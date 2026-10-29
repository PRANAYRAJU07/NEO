"""
Pydantic Schemas for NEO Facial Transformation AI Service
API Contract Specification (v2 - Multi-Phase & Async Job Architecture)
Australian Anti Ice Campaign (AAIC)
"""

from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal['healthy', 'degraded', 'offline']
    service: str
    version: str
    device: str
    active_model: str
    timestamp: int


class ModelRegistryItem(BaseModel):
    model_id: str
    display_name: str
    license: str
    type: str
    device_support: List[str]
    is_available: bool
    is_loaded: bool
    vram_estimate: str
    description: str


class ModelStatusResponse(BaseModel):
    status: Literal['ready', 'loading', 'cpu_fallback', 'unloaded', 'gpu_offline']
    model_name: str
    device: str
    cuda_available: bool
    vram_allocated_mb: Optional[float] = None
    vram_total_mb: Optional[float] = None
    ram_used_mb: Optional[float] = None
    supported_stages: List[int] = [1, 2, 3]
    supported_pathways: List[str] = ['ice', 'healthy']
    registry: List[ModelRegistryItem] = []


class FaceBoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FaceQualityMetrics(BaseModel):
    blur_variance: float
    is_blurry: bool
    mean_luminance: float
    is_underexposed: bool
    is_overexposed: bool
    quality_score: float  # 0.0 to 1.0


class FaceAnalysisRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image")


class FaceAnalysisResponse(BaseModel):
    face_detected: bool
    face_count: int = 1
    confidence: float
    bounding_box: Optional[FaceBoundingBox] = None
    bounding_boxes: List[FaceBoundingBox] = []
    aspect_ratio: float
    is_centered: bool
    quality_metrics: Optional[FaceQualityMetrics] = None
    recommendations: List[str] = []


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
    phase_id: Optional[str] = Field(
        default=None,
        description="Explicit phase identifier (e.g. 'ice_stage1', 'ice_stage2', 'ice_stage3', 'healthy_vitality')"
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
        description="Whether to apply strict identity-preserving constraints"
    )


class QualityValidationResult(BaseModel):
    validation_passed: bool
    background_mse: float
    face_detected_in_result: bool
    landmark_drift_pct: float
    quality_score: float


class TransformationResponse(BaseModel):
    """
    Response payload from AI facial transformation.
    """
    success: bool
    image: str = Field(..., description="Base64-encoded output image")
    model: str = Field(..., description="Identifier of the generative model used")
    pathway: Literal['ice', 'healthy']
    stage: int
    phase_id: Optional[str] = None
    intensity: float
    effective_strength: float = Field(..., description="The actual model denoising strength applied")
    seed: int
    prompt_used: str
    negative_prompt_used: str
    execution_time_ms: int
    is_live_gpu_inference: bool
    validation: Optional[QualityValidationResult] = None
    notes: Optional[str] = None


class SeriesTransformationRequest(BaseModel):
    """
    Request to generate all configured educational phases from the same original source photo.
    """
    image: str = Field(..., description="Base64-encoded source image (immutable truth)")
    intensity: float = Field(default=0.85, ge=0.0, le=1.0)
    seed: Optional[int] = Field(default=None)
    phases: Optional[List[str]] = Field(
        default=["ice_stage1", "ice_stage2", "ice_stage3", "healthy_vitality"],
        description="List of phase IDs to generate independently from source image"
    )


class SeriesTransformationResponse(BaseModel):
    success: bool
    results: Dict[str, TransformationResponse]
    execution_time_ms: int
    total_phases_generated: int


class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal['pending', 'processing', 'completed', 'failed', 'cancelled']
    milestone: str
    progress_pct: int
    result: Optional[TransformationResponse] = None
    series_result: Optional[SeriesTransformationResponse] = None
    error: Optional[str] = None
    created_at: float
    updated_at: float


class JobCancelResponse(BaseModel):
    success: bool
    job_id: str
    message: str
