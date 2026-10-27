"""
Backend Integration & Contract Tests for NEO AI Service
"""

import unittest
import base64
import io
import os
import sys

# Ensure server directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image
from fastapi.testclient import TestClient

from main import app
from pipeline import STAGE_PROFILES, pipeline_manager


class TestNEOBackendAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

        # Generate a small test image in base64
        img = Image.new("RGB", (300, 300), color=(200, 160, 140))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        self.test_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

    def test_health_endpoint(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("NEO Real Generative AI", data["service"])

    def test_model_status_endpoint(self):
        response = self.client.get("/api/v1/model-status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data["status"], ["ready", "cpu_fallback", "loading"])
        self.assertIn("stabilityai", data["model_name"])
        self.assertIn(1, data["supported_stages"])

    def test_face_analysis_endpoint(self):
        response = self.client.post("/api/v1/analyze-face", json={"image": self.test_b64})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["face_detected"])
        self.assertEqual(data["aspect_ratio"], 1.0)

    def test_transform_stage_mapping_and_strength(self):
        # Test Stage 1
        res1 = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "ice",
            "stage": 1,
            "intensity": 0.5,
            "seed": 42
        })
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertTrue(data1["success"])
        self.assertEqual(data1["stage"], 1)
        self.assertEqual(data1["effective_strength"], 0.28)  # Base strength for Stage 1
        self.assertIn("fatigue and dehydration", data1["prompt_used"])

        # Test Stage 2
        res2 = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "ice",
            "stage": 2,
            "intensity": 0.5,
            "seed": 42
        })
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["stage"], 2)
        self.assertEqual(data2["effective_strength"], 0.40)  # Base strength for Stage 2

        # Test Stage 3
        res3 = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "ice",
            "stage": 3,
            "intensity": 0.5,
            "seed": 42
        })
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertEqual(data3["stage"], 3)
        self.assertEqual(data3["effective_strength"], 0.52)  # Base strength for Stage 3

    def test_intensity_slider_modulation(self):
        # Intensity 0.0 -> strength decreases
        res_low = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "ice",
            "stage": 2,
            "intensity": 0.0,
            "seed": 42
        })
        self.assertEqual(res_low.status_code, 200)
        strength_low = res_low.json()["effective_strength"]

        # Intensity 1.0 -> strength increases
        res_high = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "ice",
            "stage": 2,
            "intensity": 1.0,
            "seed": 42
        })
        self.assertEqual(res_high.status_code, 200)
        strength_high = res_high.json()["effective_strength"]

        self.assertGreater(strength_high, strength_low)
        self.assertLessEqual(strength_high, 0.60)
        self.assertGreaterEqual(strength_low, 0.18)

    def test_healthy_future_pathway(self):
        res = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "pathway": "healthy",
            "stage": 1,
            "intensity": 0.8,
            "seed": 101
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["pathway"], "healthy")
        self.assertIn("health and vitality", data["prompt_used"])

    def test_reproducible_seed(self):
        res_a = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "stage": 1,
            "seed": 99999
        })
        res_b = self.client.post("/api/v1/transform", json={
            "image": self.test_b64,
            "stage": 1,
            "seed": 99999
        })
        self.assertEqual(res_a.json()["image"], res_b.json()["image"])


if __name__ == '__main__':
    unittest.main()
