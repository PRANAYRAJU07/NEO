"""
FastAPI Server for NEO Real Generative AI Facial Transformation Engine
Australian Anti Ice Campaign (AAIC)

Features:
- Validated API Endpoints:
    * GET  /health, GET  /api/v1/health
    * GET  /models/status, GET  /api/v1/model-status
    * POST /analyze, POST /api/v1/analyze-face
    * POST /transform, POST /api/v1/transform
    * POST /transform/series, POST /api/v1/transform/series
    * GET  /jobs/{job_id}, GET  /api/v1/jobs/{job_id}
    * POST /jobs/{job_id}/cancel, POST /api/v1/jobs/{job_id}/cancel
- Zero Persistent Storage Policy: No images logged or stored to disk
- Real milestone progress tracking without artificial timers
- Request size limit (15MB) & timeout protection
- CORS configuration for local & production frontends
"""

import time
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import PORT, HOST, MAX_IMAGE_PAYLOAD_BYTES
from schemas import (
    HealthResponse,
    ModelStatusResponse,
    FaceAnalysisRequest,
    FaceAnalysisResponse,
    TransformationRequest,
    TransformationResponse,
    SeriesTransformationRequest,
    SeriesTransformationResponse,
    JobStatusResponse,
    JobCancelResponse
)
from face_engine import face_engine
from model_registry import model_registry
from pipeline import pipeline_manager
from job_manager import job_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize generative pipeline manager on startup
    pipeline_manager.initialize()
    yield
    # Cleanup resources on shutdown
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:
        pass


app = FastAPI(
    title="NEO Facial Transformation AI Service",
    description="Desktop-First Generative AI Facial Transformation Backend for Australian Anti Ice Campaign",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Local development & desktop UI
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_IMAGE_PAYLOAD_BYTES:
        return JSONResponse(
            status_code=413,
            content={"detail": f"Payload too large. Maximum image payload size is {MAX_IMAGE_PAYLOAD_BYTES // (1024 * 1024)} MB."}
        )
    return await call_next(request)


# ---------------------------------------------------------
# Health & Status Endpoints
# ---------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """
    Returns service health, version, device, and active model.
    """
    return HealthResponse(
        status="healthy",
        service="NEO Real Generative AI Facial Transformation Engine",
        version="2.0.0",
        device=model_registry.device,
        active_model=pipeline_manager.active_model_name,
        timestamp=int(time.time())
    )


@app.get("/models/status", response_model=ModelStatusResponse)
@app.get("/api/v1/model-status", response_model=ModelStatusResponse)
async def get_model_status():
    """
    Returns the real-time operational status of the AI model and hardware.
    """
    status_data = pipeline_manager.get_status()
    return ModelStatusResponse(**status_data)


# ---------------------------------------------------------
# Face Analysis Endpoints
# ---------------------------------------------------------

@app.post("/analyze", response_model=FaceAnalysisResponse)
@app.post("/api/v1/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face(request: FaceAnalysisRequest):
    """
    Performs genuine multi-scale face detection, blur variance analysis,
    exposure estimation, and quality verification without saving image to disk.
    """
    try:
        return face_engine.analyze(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format or decode error: {str(e)}")


# ---------------------------------------------------------
# Synchronous Transformation Endpoints
# ---------------------------------------------------------

@app.post("/transform", response_model=TransformationResponse)
@app.post("/api/v1/transform", response_model=TransformationResponse)
async def transform_image(request: TransformationRequest):
    """
    Performs stage-conditioned generative AI facial transformation on a single phase.
    The original photograph is the immutable source of truth.
    """
    try:
        return pipeline_manager.transform(
            base64_image=request.image,
            pathway=request.pathway,
            stage=request.stage,
            phase_id=request.phase_id,
            intensity=request.intensity,
            seed=request.seed
        )
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generative transformation error: {str(e)}")


@app.post("/transform/series", response_model=SeriesTransformationResponse)
@app.post("/api/v1/transform/series", response_model=SeriesTransformationResponse)
async def transform_series(request: SeriesTransformationRequest):
    """
    Generates all configured educational phases independently from the original photograph.
    """
    try:
        return pipeline_manager.transform_series(
            base64_image=request.image,
            phases=request.phases,
            intensity=request.intensity,
            seed=request.seed
        )
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Series transformation error: {str(e)}")


# ---------------------------------------------------------
# Asynchronous Job Execution Endpoints
# ---------------------------------------------------------

def run_async_transformation_job(job_id: str, request: TransformationRequest):
    job = job_manager.get_job(job_id)
    if not job or job.is_cancelled():
        return

    try:
        job.update_milestone("validating_image", 15)
        # Pre-validate face
        analysis = face_engine.analyze(request.image)
        if not analysis.face_detected:
            job.fail("No face detected in photo. Please upload a clear, front-facing portrait.")
            return

        if job.is_cancelled():
            return

        job.update_milestone("model_inference", 45)
        result = pipeline_manager.transform(
            base64_image=request.image,
            pathway=request.pathway,
            stage=request.stage,
            phase_id=request.phase_id,
            intensity=request.intensity,
            seed=request.seed,
            cancel_event=job.cancel_event
        )

        job.update_milestone("postprocessing_validation", 90)
        time.sleep(0.05)
        job.complete(result=result)
    except Exception as e:
        job.fail(str(e))


def run_async_series_job(job_id: str, request: SeriesTransformationRequest):
    job = job_manager.get_job(job_id)
    if not job or job.is_cancelled():
        return

    try:
        job.update_milestone("validating_image", 10)
        analysis = face_engine.analyze(request.image)
        if not analysis.face_detected:
            job.fail("No face detected in photo. Please upload a clear portrait.")
            return

        series_result = pipeline_manager.transform_series(
            base64_image=request.image,
            phases=request.phases,
            intensity=request.intensity,
            seed=request.seed,
            job=job
        )
        job.complete(series_result=series_result)
    except Exception as e:
        job.fail(str(e))


@app.post("/jobs/transform", response_model=JobStatusResponse)
@app.post("/api/v1/jobs/transform", response_model=JobStatusResponse)
async def submit_transform_job(request: TransformationRequest, background_tasks: BackgroundTasks):
    """
    Submits an asynchronous single-phase transformation job.
    """
    job = job_manager.create_job()
    background_tasks.add_task(run_async_transformation_job, job.job_id, request)
    return job.to_response()


@app.post("/jobs/series", response_model=JobStatusResponse)
@app.post("/api/v1/jobs/series", response_model=JobStatusResponse)
async def submit_series_job(request: SeriesTransformationRequest, background_tasks: BackgroundTasks):
    """
    Submits an asynchronous multi-phase series transformation job.
    """
    job = job_manager.create_job()
    background_tasks.add_task(run_async_series_job, job.job_id, request)
    return job.to_response()


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
@app.get("/api/v1/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Queries real processing progress and job status.
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found or expired.")
    return job.to_response()


@app.post("/jobs/{job_id}/cancel", response_model=JobCancelResponse)
@app.post("/api/v1/jobs/{job_id}/cancel", response_model=JobCancelResponse)
async def cancel_job(job_id: str):
    """
    Requests cancellation of an active transformation job.
    """
    res = job_manager.cancel_job(job_id)
    if not res.success and res.message == "Job not found":
        raise HTTPException(status_code=404, detail=res.message)
    return res


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
