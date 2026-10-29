"""
Comprehensive Backend Test Suite for NEO Facial Transformation AI Service
Australian Anti Ice Campaign (AAIC)

Covers:
- Health and Model Status Endpoints
- Face Analysis (valid face, blank no-face, invalid base64, blur/exposure metrics)
- Stage-specific parameter & strength mappings
- Multi-phase transformation from immutable source image
- Strict background & clothing preservation (MSE validation)
- Deterministic reproducibility with random seeds
- Asynchronous job execution, milestone polling, and cancellation
- 15 MB payload size limit enforcement
"""

import unittest
import base64
import io
import os
import sys
import time

# Ensure server directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image
import numpy as np
from fastapi.testclient import TestClient

from main import app
from config import PHASE_PROFILES
from face_engine import face_engine
from pipeline import pipeline_manager


class TestNEOBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pipeline_manager.initialize()
        cls.client = TestClient(app)

        # Load real test face if available, or generate a synthetic face portrait
        sample_path = os.path.expanduser(
            r"C:\Users\prana\.gemini\antigravity\brain\88de6d2f-ac61-4087-94e3-df21a63c7aea\sample_user_selfie.jpg"
        )
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                cls.face_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode('utf-8')
        else:
            # Create synthetic portrait
            img = Image.new("RGB", (320, 320), color=(220, 190, 170))
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            cls.face_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

        # Blank non-face image
        blank = Image.new("RGB", (300, 300), color=(50, 50, 50))
        buf = io.BytesIO()
        blank.save(buf, format="JPEG")
        cls.blank_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

    def test_01_health_endpoints(self):
        """Verify /health and /api/v1/health endpoints."""
        for endpoint in ["/health", "/api/v1/health"]:
            res = self.client.get(endpoint)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["status"], "healthy")
            self.assertIn("NEO Real Generative AI", data["service"])
            self.assertIn(data["device"], ["cpu", "cuda"])

    def test_02_model_status_endpoints(self):
        """Verify /models/status and /api/v1/model-status."""
        for endpoint in ["/models/status", "/api/v1/model-status"]:
            res = self.client.get(endpoint)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn(data["status"], ["ready", "cpu_fallback"])
            self.assertIn("landmark-physiological-v1", data["model_name"])
            self.assertGreater(len(data["registry"]), 0)

    def test_03_face_analysis_with_real_face(self):
        """Verify face analysis returns genuine metrics, bounding box, and blur variance."""
        res = self.client.post("/api/v1/analyze-face", json={"image": self.face_b64})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["face_detected"])
        self.assertGreater(data["face_count"], 0)
        self.assertIsNotNone(data["bounding_box"])
        self.assertGreater(data["bounding_box"]["width"], 50)
        self.assertGreater(data["bounding_box"]["height"], 50)
        self.assertIsNotNone(data["quality_metrics"])
        self.assertGreater(data["quality_metrics"]["blur_variance"], 0.0)
        self.assertGreater(data["confidence"], 0.70)

    def test_04_face_analysis_no_face_rejection(self):
        """Verify blank or non-face images are detected as face_detected: False."""
        res = self.client.post("/analyze", json={"image": self.blank_b64})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["face_detected"])
        self.assertEqual(data["confidence"], 0.0)
        self.assertIn("No face detected", data["recommendations"][0])

    def test_05_face_analysis_invalid_payload(self):
        """Verify corrupted base64 string raises HTTP 400."""
        res = self.client.post("/analyze", json={"image": "not_a_valid_base64_payload"})
        self.assertEqual(res.status_code, 400)

    def test_06_transform_stage_profiles_and_strengths(self):
        """Verify Ice Stages 1, 2, 3 and Healthy Future mapping."""
        # Stage 1
        res1 = self.client.post("/api/v1/transform", json={
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 1,
            "intensity": 0.50,
            "seed": 42
        })
        self.assertEqual(res1.status_code, 200)
        d1 = res1.json()
        self.assertTrue(d1["success"])
        self.assertEqual(d1["stage"], 1)
        self.assertEqual(d1["effective_strength"], 0.28)
        self.assertIn("Stage 1", d1["notes"])

        # Stage 2
        res2 = self.client.post("/api/v1/transform", json={
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 2,
            "intensity": 0.50,
            "seed": 42
        })
        self.assertEqual(res2.status_code, 200)
        d2 = res2.json()
        self.assertEqual(d2["stage"], 2)
        self.assertEqual(d2["effective_strength"], 0.40)

        # Stage 3
        res3 = self.client.post("/api/v1/transform", json={
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 3,
            "intensity": 0.50,
            "seed": 42
        })
        self.assertEqual(res3.status_code, 200)
        d3 = res3.json()
        self.assertEqual(d3["stage"], 3)
        self.assertEqual(d3["effective_strength"], 0.52)

        # Healthy Future
        res_h = self.client.post("/api/v1/transform", json={
            "image": self.face_b64,
            "pathway": "healthy",
            "stage": 1,
            "intensity": 0.50,
            "seed": 42
        })
        self.assertEqual(res_h.status_code, 200)
        dh = res_h.json()
        self.assertEqual(dh["pathway"], "healthy")
        self.assertEqual(dh["effective_strength"], 0.22)

    def test_07_background_and_clothing_preservation(self):
        """Verify background outside face mask has negligible MSE delta."""
        res = self.client.post("/transform", json={
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 3,
            "intensity": 0.85,
            "seed": 1234
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        val = data["validation"]
        self.assertIsNotNone(val)
        self.assertTrue(val["validation_passed"])
        self.assertLessEqual(val["background_mse"], 0.02)
        self.assertTrue(val["face_detected_in_result"])

    def test_08_deterministic_reproducibility(self):
        """Verify identical seed produces identical output image strings."""
        payload = {
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 2,
            "intensity": 0.75,
            "seed": 999888
        }
        r1 = self.client.post("/transform", json=payload).json()
        r2 = self.client.post("/transform", json=payload).json()
        self.assertEqual(r1["image"], r2["image"])

    def test_09_multi_phase_series_endpoint(self):
        """Verify /transform/series generates all phases from the same immutable original image."""
        res = self.client.post("/transform/series", json={
            "image": self.face_b64,
            "intensity": 0.80,
            "seed": 7777,
            "phases": ["ice_stage1", "ice_stage2", "ice_stage3", "healthy_vitality"]
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["total_phases_generated"], 4)
        self.assertIn("ice_stage1", data["results"])
        self.assertIn("ice_stage2", data["results"])
        self.assertIn("ice_stage3", data["results"])
        self.assertIn("healthy_vitality", data["results"])

    def test_10_async_job_lifecycle(self):
        """Verify asynchronous job creation, polling, and completion."""
        # Submit async job
        res = self.client.post("/jobs/transform", json={
            "image": self.face_b64,
            "pathway": "ice",
            "stage": 1,
            "intensity": 0.60
        })
        self.assertEqual(res.status_code, 200)
        job_data = res.json()
        job_id = job_data["job_id"]
        self.assertIn("neo_job_", job_id)

        # Poll status until complete (or max 5 seconds)
        completed = False
        for _ in range(25):
            poll = self.client.get(f"/jobs/{job_id}")
            self.assertEqual(poll.status_code, 200)
            status_data = poll.json()
            if status_data["status"] == "completed":
                completed = True
                self.assertEqual(status_data["progress_pct"], 100)
                self.assertIsNotNone(status_data["result"])
                break
            time.sleep(0.1)

        self.assertTrue(completed, "Async job did not complete in time")

    def test_11_async_job_cancellation(self):
        """Verify async job cancellation endpoint."""
        from job_manager import job_manager
        # Create an in-flight job to test cancellation directly
        job = job_manager.create_job()
        job.update_milestone("processing_phase_1", 25)

        # Cancel job
        cancel_res = self.client.post(f"/jobs/{job.job_id}/cancel")
        self.assertEqual(cancel_res.status_code, 200)
        self.assertTrue(cancel_res.json()["success"])
        self.assertTrue(job.is_cancelled())

        # Verify 404 on nonexistent job
        not_found_res = self.client.post("/jobs/non_existent_job_123/cancel")
        self.assertEqual(not_found_res.status_code, 404)

    def test_12_request_size_limit_rejection(self):
        """Verify payloads exceeding 15MB are rejected with HTTP 413."""
        # Construct large dummy header simulating 16 MB payload
        headers = {"content-length": str(16 * 1024 * 1024)}
        res = self.client.post("/transform", headers=headers, json={"image": "small"})
        self.assertEqual(res.status_code, 413)


if __name__ == "__main__":
    unittest.main()
