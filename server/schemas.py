"""
Pydantic Schemas for NEO Facial Transformation AI Service
API Contract Specification (v1)
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class TransformationRequest(BaseModel):
    """
    Request payload for AI facial transformation.
    """
    image: str = Field(
        ...,
        description="Base64-encoded image string (data:image/jpeg;base64,... or raw base64)"
    )
    pathway: Literal['ice', 'healthy'] = Field(
        default='ice',
        description="Target educational pathway"
    )
    stage: Literal[1, 2, 3] = Field(
        default=1,
        description="Educational timeline stage (1: 6-12m, 2: 2-3y, 3: 4+y)"
    )
    intensity: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="User intensity slider (0.0 to 1.0)"
    )
    seed: Optional[int] = Field(
        default=None,
        description="Optional seed for deterministic reproducibility"
    )
    preserve_identity: bool = Field(
        default=True,
        description="Whether to apply identity-preserving constraints"
    )


class TransformationResponse(BaseModel):
    """
    Response payload from AI facial transformation.
    """
    success: bool
    image: str = Field(
        ...,
        description="Base64-encoded output image (data:image/jpeg;base64,...)"
    )
    model: str = Field(
        ...,
        description="Identifier of the generative model used"
    )
    pathway: Literal['ice', 'healthy']
    stage: int
    intensity: float
    effective_strength: float = Field(
        ...,
        description="The actual model denoising strength applied (e.g. 0.35)"
    )
    seed: int
    prompt_used: str
    negative_prompt_used: str
    execution_time_ms: int
    is_live_gpu_inference: bool
    notes: Optional[str] = None


class FaceAnalysisRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image")


class FaceAnalysisResponse(BaseModel):
    face_detected: bool
    confidence: float
    bounding_box: Optional[dict] = None
    aspect_ratio: float
    is_centered: bool
    recommendations: list[str] = []


class ModelStatusResponse(BaseModel):
    status: Literal['ready', 'loading', 'cpu_fallback', 'unloaded', 'gpu_offline']
    model_name: str
    device: str
    vram_allocated_mb: Optional[float] = None
    vram_total_mb: Optional[float] = None
    cuda_available: bool
    supported_stages: list[int] = [1, 2, 3]
    supported_pathways: list[str] = ['ice', 'healthy']
