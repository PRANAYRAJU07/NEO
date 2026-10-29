"""
NEO Model Registry & Hardware Acceleration Manager
Australian Anti Ice Campaign (AAIC)

Features:
- Configurable model registry with license, device support, and RAM/VRAM estimates
- Real hardware detection (CPU threads, CUDA availability, VRAM, system RAM)
- Transparent model load status reporting (never fabricates load state)
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import psutil

from schemas import ModelRegistryItem, ModelStatusResponse


class ModelRegistryManager:
    """
    Manages available AI models, hardware acceleration checks, and memory profiling.
    """
    def __init__(self):
        self.device = "cpu"
        self.cuda_available = False
        self.cuda_device_name = ""
        self.total_vram_mb = None
        self._detect_hardware()

        # Registered AI Models
        self.models: Dict[str, Dict[str, Any]] = {
            "landmark-physiological-v1": {
                "model_id": "landmark-physiological-v1",
                "display_name": "Landmark-Guided Anatomical & Dermal Synthesis Engine",
                "license": "Apache 2.0 / AAIC Educational",
                "type": "Landmark-Guided Physiological Synthesis",
                "device_support": ["cpu", "cuda"],
                "vram_estimate": "< 50 MB (CPU / GPU)",
                "description": (
                    "Lightweight procedural image-processing fallback. Not a generative model; "
                    "medical accuracy and exact identity preservation are not guaranteed."
                ),
                "is_always_available": True,
                "is_loaded": True
            },
            "stabilityai/sd-turbo": {
                "model_id": "stabilityai/sd-turbo",
                "display_name": "Stable Diffusion Turbo (image-to-image)",
                "license": "CreativeML OpenRAIL++-M",
                "type": "Latent Diffusion Image-to-Image / Inpainting",
                "device_support": ["cpu", "cuda"],
                "vram_estimate": "5.5 GB (fp16 on CUDA) / 8 GB RAM (CPU)",
                "description": (
                    "Optional local image-to-image diffusion model. The generated candidate is "
                    "composited within the detected face mask; identity is not guaranteed."
                ),
                "cache_dir_name": "models--stabilityai--sd-turbo",
                "is_always_available": False,
                "is_loaded": False
            },
            "runwayml/stable-diffusion-v1-5": {
                "model_id": "runwayml/stable-diffusion-v1-5",
                "display_name": "Stable Diffusion v1.5 Inpainting",
                "license": "CreativeML OpenRAIL-M",
                "type": "Latent Diffusion Inpainting",
                "device_support": ["cpu", "cuda"],
                "vram_estimate": "4.2 GB (fp16 on CUDA) / 6 GB RAM (CPU)",
                "description": (
                    "Compatible SD 1.5 inpainting baseline for localized facial mask-guided editing."
                ),
                "cache_dir_name": "models--runwayml--stable-diffusion-v1-5",
                "is_always_available": False,
                "is_loaded": False
            }
        }

    def _detect_hardware(self):
        """
        Detects GPU and CPU capabilities.
        """
        try:
            import torch
            self.cuda_available = torch.cuda.is_available()
            if self.cuda_available:
                self.device = "cuda"
                self.cuda_device_name = torch.cuda.get_device_name(0)
                self.total_vram_mb = round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 1)
            else:
                self.device = "cpu"
                self.cuda_device_name = "Intel / AMD CPU (OpenMP / AVX2)"
        except Exception:
            self.cuda_available = False
            self.device = "cpu"

    def check_model_weights_available(self, model_id: str) -> bool:
        """
        Checks whether model weights actually exist on disk in the local cache or models folder.
        """
        model_meta = self.models.get(model_id)
        if not model_meta:
            return False

        if model_meta.get("is_always_available", False):
            return True

        cache_name = model_meta.get("cache_dir_name")
        if not cache_name:
            return False

        hf_cache_dir = Path(os.path.expanduser("~/.cache/huggingface/hub")) / cache_name
        if hf_cache_dir.exists():
            # Check if snapshots exist
            snapshots_dir = hf_cache_dir / "snapshots"
            if snapshots_dir.exists() and any(snapshots_dir.iterdir()):
                return True

        return False

    def get_vram_usage(self) -> Optional[float]:
        """
        Returns allocated VRAM in megabytes if CUDA is available.
        """
        if not self.cuda_available:
            return None
        try:
            import torch
            return round(torch.cuda.memory_allocated() / (1024 * 1024), 1)
        except Exception:
            return None

    def get_ram_usage(self) -> float:
        """
        Returns current process RAM usage in megabytes.
        """
        try:
            process = psutil.Process(os.getpid())
            return round(process.memory_info().rss / (1024 * 1024), 1)
        except Exception:
            return 0.0

    def get_registry_items(self) -> List[ModelRegistryItem]:
        """
        Returns serialized list of registered models and their current availability on disk.
        """
        items = []
        for mid, meta in self.models.items():
            is_avail = self.check_model_weights_available(mid)
            items.append(ModelRegistryItem(
                model_id=mid,
                display_name=meta["display_name"],
                license=meta["license"],
                type=meta["type"],
                device_support=meta["device_support"],
                is_available=is_avail,
                is_loaded=meta.get("is_loaded", False),
                vram_estimate=meta["vram_estimate"],
                description=meta["description"]
            ))
        return items

    def get_status(self, active_model_name: str) -> ModelStatusResponse:
        """
        Returns real-time status of the pipeline and system resources.
        """
        status_code = "ready"
        if not self.cuda_available:
            status_code = "cpu_fallback"

        return ModelStatusResponse(
            status=status_code,
            model_name=active_model_name,
            device=self.device,
            cuda_available=self.cuda_available,
            vram_allocated_mb=self.get_vram_usage(),
            vram_total_mb=self.total_vram_mb,
            ram_used_mb=self.get_ram_usage(),
            supported_stages=[1, 2, 3],
            supported_pathways=["ice", "healthy"],
            registry=self.get_registry_items()
        )


model_registry = ModelRegistryManager()
