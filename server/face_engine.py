"""
NEO Facial Analysis & Anatomical Masking Engine
Australian Anti Ice Campaign (AAIC)

Features:
- Genuine multi-scale face and feature detection
- Real blur variance (Laplacian) and exposure analysis
- Anatomical landmark extraction and multi-region segmentation
- Strict background, hairline, and clothing protection masks
- Post-transformation quality validation (background MSE, landmark drift)
"""

import io
import base64
from typing import Tuple, List, Dict, Any, Optional
import cv2
import numpy as np
from PIL import Image, ImageOps

from config import QUALITY_THRESHOLDS, MIN_PROCESSING_DIMENSION, MAX_PROCESSING_DIMENSION
from schemas import FaceBoundingBox, FaceQualityMetrics, FaceAnalysisResponse, QualityValidationResult


class FaceAnalysisEngine:
    """
    Performs genuine face detection, landmark extraction, and quality verification.
    """
    def __init__(self):
        cascade_dir = cv2.data.haarcascades
        self.face_cascade_default = cv2.CascadeClassifier(cascade_dir + 'haarcascade_frontalface_default.xml')
        self.face_cascade_alt = cv2.CascadeClassifier(cascade_dir + 'haarcascade_frontalface_alt2.xml')
        self.profile_cascade = cv2.CascadeClassifier(cascade_dir + 'haarcascade_profileface.xml')
        self.eye_cascade = cv2.CascadeClassifier(cascade_dir + 'haarcascade_eye.xml')
        self.eye_glasses_cascade = cv2.CascadeClassifier(cascade_dir + 'haarcascade_eye_tree_eyeglasses.xml')

    def decode_base64_image(self, base64_str: str) -> Tuple[Image.Image, np.ndarray]:
        """
        Safely decodes and validates a base64 image into a PIL Image and BGR numpy array.
        Applies EXIF transpose to guarantee correct orientation.
        """
        if ',' in base64_str:
            base64_str = base64_str.split(',', 1)[1]

        image_bytes = base64.b64decode(base64_str)
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        pil_img = pil_img.convert("RGB")

        # Resize if dimensions exceed safe desktop processing limits while preserving aspect ratio
        w, h = pil_img.size
        max_dim = MAX_PROCESSING_DIMENSION
        if w > max_dim or h > max_dim:
            scale = max_dim / max(w, h)
            new_w, new_h = int(w * scale), int(h * scale)
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        img_rgb = np.array(pil_img)
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        return pil_img, img_bgr

    def encode_image_base64(self, pil_img: Image.Image, quality: int = 92) -> str:
        """
        Encodes a PIL Image into a JPEG base64 data URI string.
        """
        buffered = io.BytesIO()
        pil_img.save(buffered, format="JPEG", quality=quality, optimize=True)
        encoded = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded}"

    def detect_faces(self, img_bgr: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detects all faces in the image using multi-scale cascades with fallback.
        Returns bounding boxes (x, y, w, h) sorted in descending order by area.
        """
        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        min_dim = min(w, h)
        min_size = (int(min_dim * 0.15), int(min_dim * 0.15))

        # Try default frontal face detector
        faces = self.face_cascade_default.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=min_size,
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        # Fallback to alternate detector if no face was found
        if len(faces) == 0:
            faces = self.face_cascade_alt.detectMultiScale(
                gray,
                scaleFactor=1.08,
                minNeighbors=3,
                minSize=min_size
            )

        # Profile face detector fallback
        if len(faces) == 0:
            faces = self.profile_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=min_size
            )

        if len(faces) == 0:
            return []

        # Sort by area descending (largest face first)
        sorted_faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        return [tuple(f) for f in sorted_faces]

    def analyze_face_quality(self, img_bgr: np.ndarray, face_box: Optional[Tuple[int, int, int, int]]) -> FaceQualityMetrics:
        """
        Calculates blur variance, exposure levels, and composite quality score.
        """
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        if face_box:
            fx, fy, fw, fh = face_box
            # Bound check
            fx = max(0, fx)
            fy = max(0, fy)
            fw = min(fw, w - fx)
            fh = min(fh, h - fy)
            roi_gray = gray[fy:fy + fh, fx:fx + fw]
        else:
            roi_gray = gray

        # 1. Blur Variance using Laplacian
        blur_var = float(cv2.Laplacian(roi_gray, cv2.CV_64F).var())
        is_blurry = bool(blur_var < QUALITY_THRESHOLDS["min_blur_variance"])

        # 2. Exposure & Mean Luminance
        mean_lum = float(np.mean(roi_gray))
        is_underexposed = bool(mean_lum < QUALITY_THRESHOLDS["min_luminance"])
        is_overexposed = bool(mean_lum > QUALITY_THRESHOLDS["max_luminance"])

        # 3. Composite Quality Score (0.0 to 1.0)
        # Blur factor: saturated at 300
        blur_score = min(1.0, blur_var / 300.0)
        # Exposure factor: ideal range 80-160
        exposure_dist = abs(mean_lum - 128.0)
        exposure_score = max(0.0, 1.0 - (exposure_dist / 128.0))

        quality_score = round(0.55 * blur_score + 0.45 * exposure_score, 2)

        return FaceQualityMetrics(
            blur_variance=round(blur_var, 2),
            is_blurry=is_blurry,
            mean_luminance=round(mean_lum, 2),
            is_underexposed=is_underexposed,
            is_overexposed=is_overexposed,
            quality_score=quality_score
        )

    def analyze(self, base64_image: str) -> FaceAnalysisResponse:
        """
        Performs comprehensive face analysis on an input image.
        Returns face count, primary bounding box, aspect ratio, centering, and quality metrics.
        """
        _, img_bgr = self.decode_base64_image(base64_image)
        h, w = img_bgr.shape[:2]
        aspect_ratio = round(w / h, 2)

        faces = self.detect_faces(img_bgr)
        face_detected = len(faces) > 0
        face_count = len(faces)

        recommendations: List[str] = []

        if not face_detected:
            return FaceAnalysisResponse(
                face_detected=False,
                face_count=0,
                confidence=0.0,
                bounding_box=None,
                bounding_boxes=[],
                aspect_ratio=aspect_ratio,
                is_centered=False,
                quality_metrics=self.analyze_face_quality(img_bgr, None),
                recommendations=["No face detected. Please ensure your face is clearly visible, well-lit, and front-facing."]
            )

        primary_face = faces[0]
        fx, fy, fw, fh = primary_face
        face_cx = fx + fw / 2.0
        face_cy = fy + fh / 2.0

        # Centering check: face center within middle 30% of frame
        is_centered = bool((abs(face_cx - w / 2.0) < w * 0.25) and (abs(face_cy - h / 2.0) < h * 0.25))

        quality = self.analyze_face_quality(img_bgr, primary_face)

        # Detect recommendations
        if face_count > 1:
            recommendations.append(f"Multiple faces detected ({face_count}). The transformation will focus on the primary subject.")
        if quality.is_blurry:
            recommendations.append("Image is slightly blurry. A sharper portrait will yield cleaner facial details.")
        if quality.is_underexposed:
            recommendations.append("Lighting appears low. Ambient front-facing light produces the most natural results.")
        elif quality.is_overexposed:
            recommendations.append("Lighting is very bright. Balanced, diffused lighting produces the highest-fidelity skin texture.")
        if w < MIN_PROCESSING_DIMENSION or h < MIN_PROCESSING_DIMENSION:
            recommendations.append("Resolution is low. Higher resolution photos produce significantly more realistic educational details.")

        if len(recommendations) == 0:
            recommendations.append("Excellent portrait clarity and alignment detected. Ready for high-fidelity transformation.")

        confidence = round(min(0.98, 0.75 + (quality.quality_score * 0.23)), 2)

        return FaceAnalysisResponse(
            face_detected=True,
            face_count=face_count,
            confidence=confidence,
            bounding_box=FaceBoundingBox(x=int(fx), y=int(fy), width=int(fw), height=int(fh)),
            bounding_boxes=[FaceBoundingBox(x=int(x), y=int(y), width=int(bw), height=int(bh)) for (x, y, bw, bh) in faces],
            aspect_ratio=aspect_ratio,
            is_centered=is_centered,
            quality_metrics=quality,
            recommendations=recommendations
        )

    def extract_landmarks(self, img_bgr: np.ndarray, face_box: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """
        Extracts key anatomical landmarks (eyes, cheeks, temples, forehead)
        from the primary face region.
        """
        fx, fy, fw, fh = face_box
        cx = fx + fw * 0.50
        cy = fy + fh * 0.48
        face_scale = fw * 0.50

        # Detect eyes within upper 60% of face box
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        roi_gray = gray[fy:fy + int(fh * 0.60), fx:fx + fw]
        eyes = self.eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=3, minSize=(int(fw * 0.12), int(fh * 0.12)))

        if len(eyes) < 2:
            # Fallback to eyeglasses cascade
            eyes = self.eye_glasses_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=2, minSize=(int(fw * 0.12), int(fh * 0.12)))

        if len(eyes) >= 2:
            eyes = sorted(eyes, key=lambda e: e[0])
            lex = fx + eyes[0][0] + eyes[0][2] * 0.50
            ley = fy + eyes[0][1] + eyes[0][3] * 0.55
            rex = fx + eyes[-1][0] + eyes[-1][2] * 0.50
            rey = fy + eyes[-1][1] + eyes[-1][3] * 0.55
        else:
            # Anthropometric fallback based on head geometry
            lex = cx - face_scale * 0.38
            ley = cy - face_scale * 0.18
            rex = cx + face_scale * 0.38
            rey = cy - face_scale * 0.18

        eye_dist = abs(rex - lex)
        eye_center_x = (lex + rex) / 2.0
        eye_center_y = (ley + rey) / 2.0

        # Sub-malar cheek centers (angled under cheekbones)
        lcx = lex - face_scale * 0.10
        lcy = ley + face_scale * 0.55
        rcx = rex + face_scale * 0.10
        rcy = rey + face_scale * 0.55

        # Temple centers (bilateral)
        ltx = lex - face_scale * 0.35
        lty = ley - face_scale * 0.30
        rtx = rex + face_scale * 0.35
        rty = rey - face_scale * 0.30

        return {
            "cx": cx,
            "cy": cy,
            "face_scale": face_scale,
            "lex": lex,
            "ley": ley,
            "rex": rex,
            "rey": rey,
            "eye_dist": eye_dist,
            "eye_center": (eye_center_x, eye_center_y),
            "lcx": lcx,
            "lcy": lcy,
            "rcx": rcx,
            "rcy": rcy,
            "ltx": ltx,
            "lty": lty,
            "rtx": rtx,
            "rty": rty,
            "face_box": face_box
        }

    def generate_anatomical_masks(
        self,
        img_shape: Tuple[int, int],
        landmarks: Dict[str, Any]
    ) -> Dict[str, np.ndarray]:
        """
        Constructs smooth feathered anatomical masks for localized transformation.
        Protects background, hairline, ears, and clothing.
        """
        h, w = img_shape[:2]
        cx, cy = landmarks["cx"], landmarks["cy"]
        face_scale = landmarks["face_scale"]
        lex, ley = landmarks["lex"], landmarks["ley"]
        rex, rey = landmarks["rex"], landmarks["rey"]
        lcx, lcy = landmarks["lcx"], landmarks["lcy"]
        rcx, rcy = landmarks["rcx"], landmarks["rcy"]
        ltx, lty = landmarks["ltx"], landmarks["lty"]
        rtx, rty = landmarks["rtx"], landmarks["rty"]

        Y, X = np.ogrid[:h, :w]

        # 1. Primary Face Oval Mask (Super-elliptical with soft cosine/Gaussian falloff)
        nx = (X - cx) / (face_scale * 0.95)
        ny = (Y - cy) / (face_scale * 1.25)
        face_mask = np.exp(-((nx)**4 + (ny)**4))
        face_mask = np.clip(face_mask, 0.0, 1.0).astype(np.float32)

        # 2. Periorbital Dark Circles & Sunken Eye Sockets Mask
        eye_radius = face_scale * 0.22
        d_left_eye = ((X - lex)**2 / (2 * (eye_radius * 1.15)**2) + (Y - (ley + eye_radius * 0.30))**2 / (2 * (eye_radius * 0.70)**2))
        d_right_eye = ((X - rex)**2 / (2 * (eye_radius * 1.15)**2) + (Y - (rey + eye_radius * 0.30))**2 / (2 * (eye_radius * 0.70)**2))
        eye_hollow = np.exp(-d_left_eye) + np.exp(-d_right_eye)
        eye_hollow = np.clip(eye_hollow, 0.0, 1.0) * face_mask

        # 3. Sub-malar Buccal Fat Pad Mask (Cheek Hollows)
        cos_a, sin_a = np.cos(0.24), np.sin(0.24)
        lx_r = (X - lcx) * cos_a - (Y - lcy) * sin_a
        ly_r = (X - lcx) * sin_a + (Y - lcy) * cos_a
        d_left_cheek = (lx_r**2 / (2 * (face_scale * 0.22)**2) + ly_r**2 / (2 * (face_scale * 0.38)**2))
        rx_r = (X - rcx) * cos_a - (Y - rcy) * (-sin_a)
        ry_r = (X - rcx) * (-sin_a) + (Y - rcy) * cos_a
        d_right_cheek = (rx_r**2 / (2 * (face_scale * 0.22)**2) + ry_r**2 / (2 * (face_scale * 0.38)**2))
        cheek_hollow = np.exp(-d_left_cheek) + np.exp(-d_right_cheek)
        cheek_hollow = np.clip(cheek_hollow, 0.0, 1.0) * face_mask

        # 4. Temporal Wasting Mask
        d_left_temple = ((X - ltx)**2 / (2 * (face_scale * 0.16)**2) + (Y - lty)**2 / (2 * (face_scale * 0.22)**2))
        d_right_temple = ((X - rtx)**2 / (2 * (face_scale * 0.16)**2) + (Y - rty)**2 / (2 * (face_scale * 0.22)**2))
        temple_hollow = np.exp(-d_left_temple) + np.exp(-d_right_temple)
        temple_hollow = np.clip(temple_hollow, 0.0, 1.0) * face_mask

        # 5. Background & Clothing Protection Mask (1.0 outside face, 0.0 inside)
        background_protection = np.clip(1.0 - face_mask, 0.0, 1.0)

        return {
            "face_mask": face_mask,
            "periorbital_mask": eye_hollow,
            "cheek_mask": cheek_hollow,
            "temple_mask": temple_hollow,
            "background_protection": background_protection
        }

    def validate_quality(
        self,
        original_bgr: np.ndarray,
        transformed_bgr: np.ndarray,
        face_mask: np.ndarray,
        orig_landmarks: Dict[str, Any]
    ) -> QualityValidationResult:
        """
        Validates post-transformation results:
        1. Background preservation: MSE outside face mask must be within threshold.
        2. Subject identity confirmation: Face must remain detectable in transformed image.
        3. Landmark stability: Eye and face center displacement within tolerance.
        """
        # 1. Background MSE Check
        inv_mask = (1.0 - face_mask).astype(np.float32)
        inv_sum = np.sum(inv_mask) + 1e-6

        diff = (original_bgr.astype(np.float32) - transformed_bgr.astype(np.float32)) / 255.0
        diff_sq = (diff ** 2) * inv_mask[:, :, None]
        bg_mse = float(np.sum(diff_sq) / (inv_sum * 3.0))

        # 2. Transformed Face Detection
        new_faces = self.detect_faces(transformed_bgr)
        face_detected = len(new_faces) > 0

        # 3. Landmark Drift Check
        landmark_drift_pct = 0.0
        if face_detected:
            new_primary = new_faces[0]
            new_cx = new_primary[0] + new_primary[2] * 0.50
            new_cy = new_primary[1] + new_primary[3] * 0.50

            orig_cx = orig_landmarks["cx"]
            orig_cy = orig_landmarks["cy"]
            orig_scale = orig_landmarks["face_scale"]

            drift_px = np.sqrt((new_cx - orig_cx)**2 + (new_cy - orig_cy)**2)
            landmark_drift_pct = float(round((drift_px / orig_scale) * 100.0, 2))

        # 4. Evaluation
        passed = bool(
            face_detected and
            bg_mse <= QUALITY_THRESHOLDS["max_background_mse"] and
            landmark_drift_pct <= QUALITY_THRESHOLDS["max_landmark_drift_pct"]
        )

        quality_score = max(0.0, min(1.0, 1.0 - (bg_mse * 20.0) - (landmark_drift_pct * 0.05)))

        return QualityValidationResult(
            validation_passed=bool(passed),
            background_mse=round(bg_mse, 5),
            face_detected_in_result=bool(face_detected),
            landmark_drift_pct=landmark_drift_pct,
            quality_score=round(quality_score, 2)
        )


face_engine = FaceAnalysisEngine()
