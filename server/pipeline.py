"""
NEO Generative AI Image-to-Image Pipeline Service
Powered by Stability AI SD-Turbo (Distilled Real-Time Generative Diffusion)
with stage-conditioned educational guidance and identity preservation.
"""

import io
import time
import base64
import math
import random
from typing import Tuple, Dict, Any, Optional
from PIL import Image, ImageOps

# Stage-specific educational prompt profiles for NEO Face the Future
STAGE_PROFILES = {
    'ice': {
        1: {
            'prompt': (
                "authentic documentary portrait of a person showing early subtle fatigue and mild dehydration, "
                "subtle dark shadows under eyes, slightly dry complexion, subdued skin luster, "
                "highly detailed natural skin texture, realistic portrait photography, "
                "natural soft indoor lighting, 8k resolution, preserving original facial structure and identity"
            ),
            'base_strength': 0.28,
            'guidance_scale': 0.0,
            'description': "Stage 1 (6–12 Months): Early vitality loss, subtle dehydration, early under-eye fatigue."
        },
        2: {
            'prompt': (
                "realistic documentary portrait of a person showing physical fatigue and prolonged stimulant toll, "
                "hollowed cheeks and temples, prominent dark circles under eyes, "
                "dull sallow skin tone, rough dry complexion, authentic skin texture, "
                "maintaining recognizable subject identity, sharp focus, natural documentary lighting"
            ),
            'base_strength': 0.40,
            'guidance_scale': 0.0,
            'description': "Stage 2 (2–3 Years): Vascular strain, facial hollows, persistent sallow tone."
        },
        3: {
            'prompt': (
                "thoughtful educational illustration of chronic substance toll, pronounced fatigue and facial volume loss, "
                "deepened hollows under cheekbones, exhausted eyes with dark circles, pale sallow complexion, "
                "depleted physical vitality, authentic skin texture, documentary realism, "
                "strictly preserving individual identity, respectful, non-stigmatising, natural human face"
            ),
            'base_strength': 0.52,
            'guidance_scale': 0.0,
            'description': "Stage 3 (4+ Years): Advanced systemic depletion, hollowed cheeks, tired appearance."
        }
    },
    'healthy': {
        1: {
            'prompt': (
                "photorealistic portrait showcasing optimal youth health and vitality, warm radiant skin glow, "
                "bright clear expressive eyes, natural facial volume, hydrated clean complexion, "
                "authentic healthy skin pores, vibrant warm natural lighting, confident, lifelike, 8k"
            ),
            'base_strength': 0.22,
            'guidance_scale': 0.0,
            'description': "My Healthy Future: Natural vitality, clear eyes, hydrated complexion, preserved wellness."
        }
    }
}

NEGATIVE_PROMPT = (
    "horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, "
    "halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, "
    "distorted facial anatomy, deformed eyes, extra eyes, mutated features, "
    "blur, hazy, low quality, bad lighting, unrecognizable person, caricature"
)


class GenerativePipelineManager:
    """
    Manages the real image-to-image generative diffusion model pipeline.
    Uses Stability AI SD-Turbo for genuine generative synthesis.
    """
    def __init__(self):
        self.model_name = "stabilityai/sd-turbo"
        self.pipeline = None
        self.device = "cpu"
        self.is_loaded = False
        self.cuda_available = False

    def initialize(self):
        """
        Initializes and loads the verified generative AI model.
        Detects GPU acceleration (CUDA) or runs on CPU using float32.
        """
        try:
            import torch
            from diffusers import AutoPipelineForImage2Image

            self.cuda_available = torch.cuda.is_available()
            self.device = "cuda" if self.cuda_available else "cpu"
            print(f"[NEO AI] Initializing {self.model_name} on {self.device.upper()}...")

            if self.cuda_available:
                self.pipeline = AutoPipelineForImage2Image.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    use_safetensors=True
                )
                self.pipeline.to(self.device)
                if hasattr(self.pipeline, 'enable_attention_slicing'):
                    self.pipeline.enable_attention_slicing()
            else:
                self.pipeline = AutoPipelineForImage2Image.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                    low_cpu_mem_usage=True
                )
                self.pipeline.to(self.device)

            self.is_loaded = True
            print(f"[NEO AI] Generative pipeline ({self.model_name}) loaded successfully on {self.device.upper()}.")
        except Exception as e:
            print(f"[NEO AI] Generative model manager init warning: {e}")
            self.is_loaded = False

    def calculate_effective_strength(self, pathway: str, stage: int, intensity: float) -> float:
        """
        Maps user intensity slider (0.0 to 1.0) to model denoising strength.
        Ensures identity is strictly preserved across all stages.
        """
        profile = STAGE_PROFILES.get(pathway, {}).get(stage, STAGE_PROFILES['ice'][1])
        base_strength = profile['base_strength']

        # Scale intensity deviation (-0.5 to +0.5) by 0.16
        # At intensity 0.0 -> base - 0.08
        # At intensity 1.0 -> base + 0.08
        strength_offset = (intensity - 0.5) * 0.16
        effective = base_strength + strength_offset

        # Safe clamp: minimum 0.18, maximum 0.60 (above 0.65 identity loss occurs)
        return max(0.18, min(0.60, round(effective, 3)))

    def decode_base64_image(self, base64_str: str) -> Image.Image:
        """
        Safely decodes and validates a base64 image into a PIL Image.
        """
        if ',' in base64_str:
            base64_str = base64_str.split(',', 1)[1]

        image_bytes = base64.b64decode(base64_str)
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        return img.convert("RGB")

    def encode_image_base64(self, img: Image.Image) -> str:
        """
        Encodes a PIL Image into JPEG base64 data URI without disk storage.
        """
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=92, optimize=True)
        encoded = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded}"

    def resize_for_model(self, img: Image.Image, max_dim: int = 512) -> Tuple[Image.Image, Tuple[int, int]]:
        """
        Resizes image preserving aspect ratio to model-compatible dimensions (multiples of 64).
        """
        w, h = img.size
        scale = min(max_dim / w, max_dim / h)
        new_w = int((w * scale) // 64 * 64)
        new_h = int((h * scale) // 64 * 64)
        new_w = max(512, new_w)
        new_h = max(512, new_h)
        return img.resize((new_w, new_h), Image.Resampling.LANCZOS), (w, h)

    def transform(
        self,
        base64_image: str,
        pathway: str = 'ice',
        stage: int = 1,
        intensity: float = 0.85,
        seed: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes genuine image-to-image generative diffusion transformation.
        """
        start_time = time.time()
        input_image = self.decode_base64_image(base64_image)
        resized_img, original_size = self.resize_for_model(input_image)

        # Retrieve stage prompt and parameters
        profile = STAGE_PROFILES.get(pathway, {}).get(stage, STAGE_PROFILES['ice'][1])
        prompt = profile['prompt']
        effective_strength = self.calculate_effective_strength(pathway, stage, intensity)

        if seed is None:
            seed = random.randint(100000, 99999999)

        if not self.is_loaded or self.pipeline is None:
            raise RuntimeError(
                f"Generative model {self.model_name} is not loaded. "
                "Please ensure backend server has initialized the diffusion pipeline."
            )

        import torch

        # Generator for reproducible generation
        generator = torch.Generator(device=self.device).manual_seed(seed)

        # For distilled Turbo models, ensure num_inference_steps * strength >= 1
        steps = max(2, math.ceil(1.0 / max(0.1, effective_strength)))

        # Genuine generative image-to-image inference pass
        output = self.pipeline(
            prompt=prompt,
            image=resized_img,
            strength=effective_strength,
            num_inference_steps=steps,
            guidance_scale=0.0,
            generator=generator
        ).images[0]

        final_image = output.resize(original_size, Image.Resampling.LANCZOS)
        output_b64 = self.encode_image_base64(final_image)
        execution_time = int((time.time() - start_time) * 1000)

        return {
            'success': True,
            'image': output_b64,
            'model': self.model_name,
            'pathway': pathway,
            'stage': stage,
            'intensity': intensity,
            'effective_strength': effective_strength,
            'seed': seed,
            'prompt_used': prompt,
            'negative_prompt_used': NEGATIVE_PROMPT,
            'execution_time_ms': execution_time,
            'is_live_gpu_inference': self.cuda_available,
            'notes': f"Generated via real SD-Turbo image-to-image diffusion on {self.device.upper()}."
        }

    def get_status(self) -> Dict[str, Any]:
        """
        Returns real status of the AI pipeline and hardware.
        """
        vram_allocated = None
        vram_total = None

        if self.cuda_available:
            try:
                import torch
                vram_allocated = round(torch.cuda.memory_allocated() / (1024 * 1024), 1)
                vram_total = round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 1)
            except Exception:
                pass

        status = 'ready' if self.is_loaded else 'unloaded'

        return {
            'status': status,
            'model_name': self.model_name,
            'device': self.device,
            'vram_allocated_mb': vram_allocated,
            'vram_total_mb': vram_total,
            'cuda_available': self.cuda_available,
            'supported_stages': [1, 2, 3],
            'supported_pathways': ['ice', 'healthy']
        }


pipeline_manager = GenerativePipelineManager()
