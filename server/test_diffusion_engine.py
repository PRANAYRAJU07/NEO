"""Tests for explicit online/offline behavior of the local diffusion adapter."""
import unittest
from unittest.mock import MagicMock, patch
from PIL import Image

from diffusion_engine import LocalDiffusionEngine, DiffusionModelError


class DiffusionEngineTests(unittest.TestCase):
    def test_engine_is_not_claimed_loaded_before_inference(self):
        engine = LocalDiffusionEngine()
        self.assertFalse(engine.is_loaded)
        self.assertIsNone(engine.loaded_model_id)

    def test_offline_load_requests_local_files_only(self):
        fake_torch = MagicMock()
        fake_torch.float32 = "float32"
        fake_torch.float16 = "float16"
        fake_torch.cuda.is_available.return_value = False
        fake_torch.Generator.return_value.manual_seed.return_value = "seeded-generator"
        fake_torch.inference_mode.return_value.__enter__ = MagicMock()
        fake_torch.inference_mode.return_value.__exit__ = MagicMock(return_value=False)
        fake_pipe = MagicMock()
        fake_pipe.to.return_value = fake_pipe
        fake_pipe.return_value.images = [Image.new("RGB", (32, 32), "gray")]
        fake_diffusers = MagicMock()
        fake_diffusers.AutoPipelineForImage2Image.from_pretrained.return_value = fake_pipe
        with patch.dict("sys.modules", {"torch": fake_torch, "diffusers": fake_diffusers}), \
             patch("diffusion_engine.FORCE_OFFLINE_MODE", True), \
             patch.dict("os.environ", {"NEO_ACTIVE_MODEL": "stabilityai/sd-turbo", "NEO_DEVICE": "cpu"}):
            engine = LocalDiffusionEngine()
            engine.transform(Image.new("RGB", (32, 32), "gray"), "portrait", seed=7, steps=1)
        kwargs = fake_diffusers.AutoPipelineForImage2Image.from_pretrained.call_args.kwargs
        self.assertTrue(kwargs["local_files_only"])
        self.assertTrue(engine.is_loaded)

    def test_missing_torch_has_actionable_error(self):
        engine = LocalDiffusionEngine()
        with patch.dict("sys.modules", {"torch": None}):
            with self.assertRaises(DiffusionModelError):
                engine._torch()


if __name__ == "__main__":
    unittest.main()
