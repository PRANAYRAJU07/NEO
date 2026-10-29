"""
Optional local Diffusers image-to-image adapter.

Online mode may download model weights during first load. Offline mode uses
local_files_only=True and never attempts a model download. Inference itself
always runs locally. Torch and Diffusers are imported only when diffusion is selected.
"""
from __future__ import annotations

import os
import threading
from typing import Optional

from PIL import Image

from config import DIFFUSION_MODEL_CACHE, DIFFUSION_STEPS, FORCE_OFFLINE_MODE


class DiffusionModelError(RuntimeError):
    """Actionable failure to load or run the configured local diffusion model."""


class LocalDiffusionEngine:
    def __init__(self) -> None:
        self._pipeline = None
        self._model_id: Optional[str] = None
        self._lock = threading.RLock()
        self._device: Optional[str] = None

    @staticmethod
    def _torch():
        try:
            import torch
            return torch
        except ImportError as exc:
            raise DiffusionModelError("PyTorch is not installed. Install backend requirements before selecting diffusion.") from exc

    def _choose_device(self, torch) -> str:
        requested = os.environ.get("NEO_DEVICE", "auto").lower()
        if requested == "cpu":
            return "cpu"
        if requested == "cuda":
            if not torch.cuda.is_available():
                raise DiffusionModelError("NEO_DEVICE=cuda was requested, but CUDA is unavailable.")
            return "cuda"
        return "cuda" if torch.cuda.is_available() else "cpu"

    def _load(self, model_id: str):
        if self._pipeline is not None and self._model_id == model_id:
            return self._pipeline
        with self._lock:
            if self._pipeline is not None and self._model_id == model_id:
                return self._pipeline
            try:
                torch = self._torch()
                if self._device is None:
                    self._device = self._choose_device(torch)
                from diffusers import AutoPipelineForImage2Image
                dtype = torch.float16 if self._device == "cuda" else torch.float32
                kwargs = {"torch_dtype": dtype, "local_files_only": FORCE_OFFLINE_MODE}
                if DIFFUSION_MODEL_CACHE:
                    kwargs["cache_dir"] = DIFFUSION_MODEL_CACHE
                pipe = AutoPipelineForImage2Image.from_pretrained(model_id, **kwargs)
                pipe = pipe.to(self._device)
                if self._device == "cuda":
                    try:
                        pipe.enable_attention_slicing()
                    except Exception:
                        pass
                self._pipeline = pipe
                self._model_id = model_id
                return pipe
            except Exception as exc:
                mode = "offline cache-only" if FORCE_OFFLINE_MODE else "online download-enabled"
                raise DiffusionModelError(
                    f"Could not load '{model_id}' in {mode} mode: {exc}. "
                    "Online mode requires model access and a completed download; offline mode requires all model files cached."
                ) from exc

    def transform(self, image: Image.Image, prompt: str, negative_prompt: str = "",
                  strength: float = 0.30, seed: int = 0, steps: Optional[int] = None) -> Image.Image:
        model_id = os.environ.get("NEO_ACTIVE_MODEL", "stabilityai/sd-turbo").strip()
        if not model_id or model_id == "landmark-physiological-v1":
            raise DiffusionModelError("Set NEO_ACTIVE_MODEL to a real Diffusers model ID.")
        torch = self._torch()
        pipe = self._load(model_id)
        step_count = max(1, min(8, int(steps if steps is not None else DIFFUSION_STEPS)))
        kwargs = {
            "prompt": prompt,
            "image": image.convert("RGB"),
            "strength": max(0.15, min(0.45, float(strength))),
            "num_inference_steps": step_count,
            "guidance_scale": 0.0 if "sd-turbo" in model_id.lower() else 4.0,
            "generator": torch.Generator(device=self._device).manual_seed(int(seed)),
        }
        if negative_prompt:
            kwargs["negative_prompt"] = negative_prompt
        try:
            with self._lock, torch.inference_mode():
                result = pipe(**kwargs)
            if not getattr(result, "images", None):
                raise DiffusionModelError("The diffusion pipeline returned no images.")
            output = result.images[0].convert("RGB")
            if output.size != image.size:
                output = output.resize(image.size, Image.Resampling.LANCZOS)
            return output
        except DiffusionModelError:
            raise
        except Exception as exc:
            raise DiffusionModelError(f"Local diffusion inference failed: {exc}") from exc

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    @property
    def loaded_model_id(self) -> Optional[str]:
        return self._model_id
