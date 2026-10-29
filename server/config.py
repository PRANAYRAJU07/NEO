"""
NEO Facial Transformation Engine Configuration
Australian Anti Ice Campaign (AAIC)

Provides validated application configuration, model settings,
educational phase profiles, and quality validation thresholds.
"""

import os
import tempfile
from pathlib import Path
from typing import Dict, Any, List

# Base Directories
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
TEMP_DIR = Path(os.environ.get("NEO_TEMP_DIR", tempfile.gettempdir())) / "neo_ai_cache"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Hardware & Server Configuration
PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "127.0.0.1")
PREFERRED_DEVICE = os.environ.get("NEO_DEVICE", "auto")  # 'auto', 'cpu', 'cuda'
MAX_IMAGE_PAYLOAD_BYTES = int(os.environ.get("MAX_IMAGE_PAYLOAD_BYTES", 15 * 1024 * 1024))  # 15 MB
MAX_PROCESSING_DIMENSION = int(os.environ.get("MAX_PROCESSING_DIMENSION", 1024))
MIN_PROCESSING_DIMENSION = 256
JOB_TTL_SECONDS = int(os.environ.get("JOB_TTL_SECONDS", 600))  # 10 minutes

# Active Model Strategy
# Available options: 'landmark-physiological-v1', 'stabilityai/sd-turbo', 'runwayml/stable-diffusion-v1-5'
DEFAULT_MODEL_NAME = os.environ.get("NEO_ACTIVE_MODEL", "landmark-physiological-v1")
# Online mode may download weights once; offline mode forbids network access during model loading.
FORCE_OFFLINE_MODE = os.environ.get("NEO_OFFLINE_MODE", "true").lower() in ("true", "1", "yes")
DIFFUSION_STEPS = max(1, min(8, int(os.environ.get("NEO_DIFFUSION_STEPS", "4"))))
DIFFUSION_MODEL_CACHE = os.environ.get("NEO_MODEL_CACHE_DIR", "").strip() or None
ALLOW_PROCEDURAL_FALLBACK = os.environ.get("NEO_ALLOW_PROCEDURAL_FALLBACK", "false").lower() in ("true", "1", "yes")

# Quality Validation Thresholds
QUALITY_THRESHOLDS = {
    "min_face_confidence": 0.70,
    "min_blur_variance": 60.0,           # Laplacian variance below this is flagged as blurry
    "min_luminance": 35.0,               # Average grayscale luminance (0-255)
    "max_luminance": 225.0,
    "max_background_mse": 0.020,         # Maximum mean squared error allowed outside face mask
    "max_landmark_drift_pct": 10.0,      # Maximum allowable facial landmark displacement percentage (accommodates buccal slimming)
    "max_retries": 2                     # Max retries if transformation fails quality check
}

# Educational Phase Profiles
# Defines clinically documented and youth-safe educational visualizations
PHASE_PROFILES: Dict[str, Dict[str, Any]] = {
    "ice_stage1": {
        "phase_id": "ice_stage1",
        "pathway": "ice",
        "stage": 1,
        "name": "Stage 1 — Early Toll",
        "period": "6–12 Months",
        "description": "Loss of natural skin glow, subtle periorbital dehydration shadows, reduced epidermal luster.",
        "base_strength": 0.28,
        "target_regions": ["periorbital", "skin_tone"],
        "prompt": (
            "documentary portrait of the subject showing subtle signs of chronic fatigue and dehydration, "
            "subtle dark shadows under eyes, slightly dry complexion, subdued skin luster, "
            "strictly preserving original facial features, geometry, and identity"
        ),
        "negative_prompt": (
            "horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, "
            "halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, "
            "distorted facial anatomy, deformed eyes, extra eyes, mutated features, "
            "blur, hazy, low quality, bad lighting, unrecognizable person, caricature"
        ),
        "guidance_scale": 0.0,
        "num_inference_steps": 25,
    },
    "ice_stage2": {
        "phase_id": "ice_stage2",
        "pathway": "ice",
        "stage": 2,
        "name": "Stage 2 — Progressive Strain",
        "period": "2–3 Years",
        "description": "Vascular strain, prominent periorbital hollows, sub-malar cheek fullness reduction, persistent sallow dermal tone.",
        "base_strength": 0.40,
        "target_regions": ["periorbital", "cheeks", "temples", "skin_tone", "texture"],
        "prompt": (
            "realistic documentary portrait showing physical fatigue and prolonged stimulant toll, "
            "hollowed cheeks and temples, prominent dark circles under eyes, "
            "dull sallow skin tone, rough dry complexion, authentic skin texture, "
            "strictly maintaining recognizable subject identity and facial structure"
        ),
        "negative_prompt": (
            "horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, "
            "halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, "
            "distorted facial anatomy, deformed eyes, extra eyes, mutated features, "
            "blur, hazy, low quality, bad lighting, unrecognizable person, caricature"
        ),
        "guidance_scale": 0.0,
        "num_inference_steps": 30,
    },
    "ice_stage3": {
        "phase_id": "ice_stage3",
        "pathway": "ice",
        "stage": 3,
        "name": "Stage 3 — Advanced Toll",
        "period": "4+ Years",
        "description": "Pronounced facial hollows, advanced systemic dehydration, tired appearance. Strictly non-sensationalised.",
        "base_strength": 0.52,
        "target_regions": ["periorbital", "cheeks", "temples", "forehead", "skin_tone", "texture", "excoriation"],
        "prompt": (
            "thoughtful educational illustration of chronic substance toll, pronounced fatigue and facial volume loss, "
            "deepened hollows under cheekbones, exhausted eyes with dark circles, pale sallow complexion, "
            "depleted physical vitality, authentic skin texture, documentary realism, "
            "strictly preserving individual identity, respectful, non-stigmatising, natural human face"
        ),
        "negative_prompt": (
            "horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, "
            "halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, "
            "distorted facial anatomy, deformed eyes, extra eyes, mutated features, "
            "blur, hazy, low quality, bad lighting, unrecognizable person, caricature"
        ),
        "guidance_scale": 0.0,
        "num_inference_steps": 35,
    },
    "healthy_vitality": {
        "phase_id": "healthy_vitality",
        "pathway": "healthy",
        "stage": 1,
        "name": "My Healthy Future",
        "period": "Ongoing Wellness",
        "description": "Optimal youth health, clear expressive eyes, vital warm dermal tone, preserved facial wellness.",
        "base_strength": 0.22,
        "target_regions": ["skin_radiance", "eye_clarity"],
        "prompt": (
            "photorealistic portrait showcasing optimal youth health and vitality, warm radiant skin glow, "
            "bright clear expressive eyes, natural facial volume, hydrated clean complexion, "
            "authentic healthy skin pores, vibrant warm natural lighting, confident, lifelike"
        ),
        "negative_prompt": (
            "horror, gore, open wounds, bleeding, cuts, sores, grotesque, zombie, monster, "
            "halloween makeup, cartoon, anime, 3d render, plastic skin, oversaturated, "
            "distorted facial anatomy, deformed eyes, extra eyes, mutated features, "
            "blur, hazy, low quality, bad lighting, unrecognizable person, caricature"
        ),
        "guidance_scale": 0.0,
        "num_inference_steps": 20,
    }
}
