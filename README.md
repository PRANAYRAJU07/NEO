# NEO – Face the Future
### Australian Anti Ice Campaign (AAIC) • Generative AI Youth Prevention Experience

[![Test Suite](https://img.shields.io/badge/tests-49%20passed%20(42%20vitest%20%2B%207%20server)-emerald)]()
[![Model](https://img.shields.io/badge/model-SDXL%20Img2Img%20(fp16)-purple)]()
[![Privacy](https://img.shields.io/badge/privacy-ephemeral%20RAM%20only%20%2F%20zero%20storage-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-indigo)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%20Diffusers-teal)]()

> **"ICE — NOT EVEN ONCE"**  
> **"CHOOSE LIFE SO THAT YOU MAY LIVE"**

---

## 1. Executive Summary & Purpose

**NEO – Face the Future** is an educational web application developed for the **Australian Anti Ice Campaign (AAIC)**. Its mission is to educate Australian youth about the devastating physical, psychological, and social toll of crystal methamphetamine (*ice*), while presenting an encouraging, life-affirming alternative: **My Healthy Future**.

### Generative AI Upgrade
Rather than relying on superficial canvas overlays, contrast adjustments, or blur filters, NEO incorporates a **genuine generative AI image-to-image pipeline** powered by **Stable Diffusion XL (SDXL)**. The pipeline synthesizes photorealistic, identity-preserving educational illustrations across progressive timeline scenarios, grounded in dermatological and clinical indicators.

### Core Architectural Tenets
1. **Genuine Latent Image-to-Image Synthesis**: Uses Stable Diffusion XL image conditioning. Pose, facial landmarks, clothing, hairstyle, and background are preserved via low-to-moderate latent denoising ($0.18 - 0.60$), altering only dermal texture, skin tone, subcutaneous volume, and orbital fatigue.
2. **Ephemeral RAM-Only Processing & Zero Persistent Storage**: In compliance with the Australian Privacy Principles (APPs) and AAIC child-safety protocols, student selfies are processed exclusively in volatile memory (RAM/GPU VRAM). Images are **never written to disk**, logged in database records, or shared with third-party tracking services.
3. **Strict Child Safety & Non-Stigmatising Ethics**: Visual transformations depict realistic biological wear (vascular strain, loss of hydration, hollowed cheeks) without sensationalised gore, disfigurement, or stigmatising caricatures. All visuals are clearly designated as **educational illustrations, NOT predictive medical forecasts**.
4. **Complete LEASE Independence**: LEASE (Lived Experience & Addiction Support Ecosystem) is not integrated. A strict architectural boundary (`leaseIntegrationBoundary.ts`) prevents transmission of student selfies, facial landmarks, or personal data to any external portal.
5. **Universal Opt-Out**: Students who prefer not to use their own camera or photo can experience all features using diverse illustrative **Demo Avatars**.

---

## 2. Generative AI Engine: Model Selection & Technical Provenance

### Model Selected: Stable Diffusion XL Base 1.0 (`stabilityai/stable-diffusion-xl-base-1.0`)
- **Pipeline**: `AutoPipelineForImage2Image` via Hugging Face `diffusers` (PyTorch `float16`).
- **Input**: User-consented selfie, stage conditioning prompt, calibrated denoising strength, guidance scale ($5.0 - 6.5$), and optional reproducible seed.
- **Output**: 8K-styled photorealistic documentary portrait with identity-preserved facial geometry and biologically coherent substance toll or healthy vitality.

### Why SDXL Was Chosen Over Alternatives
| Evaluation Criteria | Stable Diffusion XL (SDXL) Img2Img | StyleGAN / Live Portrait | SD 1.5 Img2Img |
| :--- | :--- | :--- | :--- |
| **Photorealism & Skin Texture** | **Exceptional** (Native $1024\times 1024$ latent resolution) | High, but prone to plastic synthetic artifacting | Moderate; requires heavy upscaling |
| **Identity Preservation** | **High** at calibrated low-to-medium denoising ($0.18 - 0.60$) | High, but limited to facial crop (alters hair/background) | Moderate; loses subtle facial characteristics |
| **Background & Pose Retention** | **Preserved natively** from conditioning image | Often replaces background with neutral matte | Loses fine background detail |
| **Licensing & Safety** | **CreativeML OpenRAIL++-M** (Permits educational & commercial use) | Often non-commercial research licenses only | CreativeML OpenRAIL-M |
| **Inference Hardware Requirement** | 12–16 GB VRAM (RTX 3060/4070/4090/A10G) with fp16 | 8–12 GB VRAM | 6–8 GB VRAM |

### Mathematical Denoising Strength Formula
The frontend intensity slider ($20\% - 100\%$) directly controls the latent denoising parameter ($s$) fed into the diffusion solver:
$$s = \text{clamp}\Big(s_{\text{base}} + (I - 0.5) \times 0.16,\; 0.18,\; 0.60\Big)$$
where $I \in [0.2, 1.0]$ is the user-adjusted intensity and $s_{\text{base}}$ is the stage-calibrated baseline:
- **Healthy Future Baseline**: $s_{\text{base}} = 0.22 \implies s \in [0.18, 0.30]$ (Subtle vitality catchlights and tone, 100% identity lock).
- **Stage 1 (6–12 Months)**: $s_{\text{base}} = 0.28 \implies s \in [0.23, 0.36]$ (Early vascular strain, mild periorbital fatigue).
- **Stage 2 (2–3 Years)**: $s_{\text{base}} = 0.40 \implies s \in [0.35, 0.48]$ (Noticeable hollowed temples, dull sallow tone, rough dry skin).
- **Stage 3 (4+ Years)**: $s_{\text{base}} = 0.52 \implies s \in [0.47, 0.60]$ (Subcutaneous fat depletion, pronounced orbital hollows).

### Negative Prompt Conditioning
Every transformation enforces a strict negative conditioning vector to eliminate unrealistic or stigmatising artifacts:
```
"cartoon, 3d render, anime, illustration, extreme disfigurement, exaggerated open sores, 
frightening zombie, gore, grotesque, plastic smooth skin, distorted facial landmarks, 
blurry, oversaturated, deformed eyes, extra limbs, bad anatomy"
```

---

## 3. Architecture & Inference Providers

The transformation architecture is decoupled via the `ITransformationProvider` interface:

```
                            [ AppContext / React UI ]
                                        │
                         [ TransformationManager ]
                                        │
           ┌────────────────────────────┴───────────────────────────┐
           ▼                                                        ▼
[ ServerGpuProvider ]                                    [ MockAiProvider ]
(Private GPU FastAPI Service)                           (Offline Local Test Double)
   • Endpoint: http://localhost:8000                        • Deterministic offline mode
   • RAM-only processing                                    • Full SDXL prompt matching
   • Latent SDXL Img2Img                                    • Instant offline testing
   • CUDA fp16 acceleration                                 • Zero network requirement
```

### Automatic Fallback & Transparency
- If the private GPU server is running, the app automatically connects to it.
- If the server is offline or the host lacks an NVIDIA GPU, the app gracefully activates the **Offline Test Provider** (`mock-ai`), transparently communicating the engine status via an **Engine Info Modal** and status badges.
- **Never Fake**: The system explicitly informs users whether the output was generated by a live CUDA GPU or simulated offline.

---

## 4. Backend Private GPU Service (`server/`)

A dedicated FastAPI service is provided in `server/` to host the generative AI pipeline on a secure, private GPU node.

### API Contract
- `POST /api/v1/transform`: Executes generative image-to-image transformation.
  - **Request Body**:
    ```json
    {
      "image": "data:image/jpeg;base64,...",
      "pathway": "ice",
      "stage": 2,
      "intensity": 0.5,
      "seed": 421098,
      "preserve_identity": true
    }
    ```
  - **Response Body**:
    ```json
    {
      "status": "success",
      "image": "data:image/jpeg;base64,...",
      "pathway": "ice",
      "stage": 2,
      "intensity": 0.5,
      "seed": 421098,
      "effective_strength": 0.40,
      "execution_time_ms": 1420,
      "model_version": "SDXL-1.0-fp16",
      "is_live_gpu_inference": true
    }
    ```
- `POST /api/v1/analyze-face`: Validates face geometry, aspect ratio, and centering.
- `GET /api/v1/model-status`: Reports pipeline status (`ready`, `loading`, `cpu_fallback`), CUDA availability, and allocated VRAM.
- `GET /api/v1/health`: Lightweight heartbeat for client auto-discovery.

### Zero-Storage Guarantee
1. Uploaded base64 payload is parsed directly into a `PIL.Image` in system RAM.
2. The image tensor is uploaded to GPU VRAM for the duration of inference.
3. The generated tensor is encoded into a JPEG byte stream in RAM and returned to the client.
4. Python garbage collection and `torch.cuda.empty_cache()` immediately reclaim memory.
5. No images are written to the local filesystem or database.

---

## 5. Privacy, Security & LEASE Boundary

| Security Tenet | Implementation | Audit / Verification |
| :--- | :--- | :--- |
| **No Persistent Storage** | Images are never written to `localStorage`, `sessionStorage`, or server disk. | Checked by `imageCleanup.verifyNoPersistentStorage()`. |
| **Volatile Processing** | Backend runs entirely in RAM; frontend uses ephemeral Blob URLs. | Codebase audited; zero file I/O in `server/main.py`. |
| **Camera Cleanup** | Hardware tracks stopped via `track.stop()` on modal dismiss or unmount. | Verified in unit test `imageCleanup.test.ts`. |
| **Content Security Policy** | Strict CSP configured in `index.html`. | Enforced: `default-src 'self'; img-src 'self' blob: data:`. |
| **Zero LEASE Egress** | `validateLeaseSafeguards()` rejects any payload containing biometrics or photos. | Verified in unit test `leaseBoundary.test.ts`. |

---

## 6. Installation, Testing & Running Instructions

### Prerequisites
- **Frontend**: Node.js $\ge 18.0.0$, npm $\ge 9.0.0$.
- **Backend (Optional for GPU Inference)**: Python $\ge 3.10$, PyTorch $\ge 2.0$, CUDA $\ge 11.8$ (for live GPU acceleration), and $\ge 12\,\text{GB}$ VRAM.

### 1. Running the Private GPU Backend
```bash
# Navigate to the server directory
cd server

# Install Python requirements
pip install -r requirements.txt

# Run the FastAPI server (runs on port 8000)
python main.py
```
*Note: On systems without an NVIDIA GPU, the server automatically starts in CPU fallback simulation mode, enabling complete integration testing without crashes.*

### 2. Running Backend Tests
```bash
python -m unittest server/test_server.py
```
*Executes 7 unit and contract tests verifying health check, model status, RAM processing, strength calculations, and invalid payload rejection.*

### 3. Running the Frontend
```bash
# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Running Frontend Unit & Integration Tests (Vitest)
```bash
npm test
```
*Executes all 42 unit and integration tests across generative AI pipelines, stage mappings, face analysis, image cleanup, LEASE boundary safeguards, and UI components.*

### 5. Running Playwright End-to-End Tests
```bash
npx playwright test
```
*Executes all end-to-end tests validating the student prevention journey, camera capture, demo avatars, and privacy guarantees.*

### 6. Production Build
```bash
npm run build
```
Generates production assets, optimized JavaScript/CSS bundles, PWA service worker (`dist/sw.js`), and Web App Manifest in `dist/`.

---

## 7. Complete Test Results Summary

- **Vitest Suite**: **42 / 42 passed** (9 test files)
  - `src/tests/unit/generativeAiPipeline.test.ts`: 12 passed
  - `src/tests/unit/transformationEngine.test.ts`: 4 passed
  - `src/tests/unit/imageValidation.test.ts`: 5 passed
  - `src/tests/unit/imageCleanup.test.ts`: 4 passed
  - `src/tests/unit/leaseBoundary.test.ts`: 4 passed
  - `src/tests/components/Welcome.test.tsx`: 4 passed
  - `src/tests/components/Consent.test.tsx`: 3 passed
  - `src/tests/components/BeforeAfterSlider.test.tsx`: 3 passed
  - `src/tests/components/Help.test.tsx`: 3 passed
- **Python Backend Suite**: **7 / 7 passed** (`server/test_server.py`)
  - `test_analyze_face_endpoint`: Passed
  - `test_cpu_fallback_mode_simulation`: Passed
  - `test_health_endpoint`: Passed
  - `test_invalid_image_payload`: Passed
  - `test_model_status_endpoint`: Passed
  - `test_no_disk_storage_guarantee`: Passed
  - `test_transform_stage_mapping_and_strength`: Passed
- **Production Build (`tsc && vite build`)**: **100% Success** (Exit Code 0).

---

## 8. Verified Support Contacts

For Australian students or educators seeking confidential information, counselling, or support:
- **Australian Anti Ice Campaign (AAIC)**: `1300 424 238` • [aaic.org.au](https://aaic.org.au)
- **National Alcohol & Other Drug Hotline**: `1800 250 015` (24/7 free counselling)
- **Kids Helpline**: `1800 55 1800` (free 24/7 support for ages 5–25)
- **Lifeline Australia**: `13 11 14` (24/7 crisis support)
- **headspace**: `1800 650 890` (youth mental health support)
- **Emergency Services**: `000` (Triple Zero)
