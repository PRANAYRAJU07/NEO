"""
NEO Asynchronous Job & Milestone Manager
Australian Anti Ice Campaign (AAIC)

Features:
- Thread-safe local job queue with honest milestone progress tracking
- User-requested job cancellation via threading.Event
- Zero persistent disk storage with automatic in-memory TTL expiration
"""

import time
import uuid
import threading
from typing import Dict, Any, Optional
from schemas import JobStatusResponse, JobCancelResponse, TransformationResponse, SeriesTransformationResponse
from config import JOB_TTL_SECONDS


class Job:
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.status = "pending"
        self.milestone = "queued"
        self.progress_pct = 0
        self.result: Optional[TransformationResponse] = None
        self.series_result: Optional[SeriesTransformationResponse] = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.updated_at = time.time()
        self.cancel_event = threading.Event()

    def update_milestone(self, milestone: str, progress_pct: int):
        self.status = "processing"
        self.milestone = milestone
        self.progress_pct = progress_pct
        self.updated_at = time.time()

    def complete(self, result: Optional[TransformationResponse] = None, series_result: Optional[SeriesTransformationResponse] = None):
        self.status = "completed"
        self.milestone = "completed"
        self.progress_pct = 100
        self.result = result
        self.series_result = series_result
        self.updated_at = time.time()

    def fail(self, error_message: str):
        self.status = "failed"
        self.milestone = "failed"
        self.error = error_message
        self.updated_at = time.time()

    def cancel(self):
        self.cancel_event.set()
        self.status = "cancelled"
        self.milestone = "cancelled"
        self.updated_at = time.time()

    def is_cancelled(self) -> bool:
        return self.cancel_event.is_set()

    def to_response(self) -> JobStatusResponse:
        return JobStatusResponse(
            job_id=self.job_id,
            status=self.status,
            milestone=self.milestone,
            progress_pct=self.progress_pct,
            result=self.result,
            series_result=self.series_result,
            error=self.error,
            created_at=self.created_at,
            updated_at=self.updated_at
        )


class JobManager:
    def __init__(self):
        self._jobs: Dict[str, Job] = {}
        self._lock = threading.Lock()

    def create_job(self) -> Job:
        with self._lock:
            self._cleanup_expired()
            job_id = f"neo_job_{uuid.uuid4().hex[:12]}"
            job = Job(job_id)
            self._jobs[job_id] = job
            return job

    def get_job(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def cancel_job(self, job_id: str) -> JobCancelResponse:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return JobCancelResponse(success=False, job_id=job_id, message="Job not found")
            if job.status in ("completed", "failed", "cancelled"):
                return JobCancelResponse(success=False, job_id=job_id, message=f"Job is already {job.status}")
            job.cancel()
            return JobCancelResponse(success=True, job_id=job_id, message="Job cancellation requested successfully")

    def _cleanup_expired(self):
        now = time.time()
        expired_ids = [
            jid for jid, j in self._jobs.items()
            if now - j.created_at > JOB_TTL_SECONDS
        ]
        for jid in expired_ids:
            del self._jobs[jid]


job_manager = JobManager()
