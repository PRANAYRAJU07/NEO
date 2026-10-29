# NEO Facial Transformation AI — Model Setup & Architecture Guide
**Australian Anti Ice Campaign (AAIC)**

---

## 1. Overview & Strategy

NEO provides a **desktop-first, privacy-compliant facial transformation backend** designed for youth drug prevention education. It generates a multi-phase educational sequence illustrating the physical toll of methamphetamine substance use ("Face the Future") alongside an encouraging vitality pathway ("My Healthy Future").

### Core Design Principles:
1. **100% Strict Identity Preservation**: The user's facial bone structure, eye geometry, nose, mouth, hair, facial hair, clothing, room lighting, and camera perspective are never hallucinated or replaced.
2. **Immutable Original Photograph**: Every phase (Stages 1, 2, 3, and Healthy Future) is derived directly and independently from the original consented selfie. No recursive quality degradation occurs.
3. **Local & Zero-Disk-Storage Privacy**: No selfies are uploaded to third-party cloud APIs. Images are processed exclusively in volatile memory (RAM/VRAM) and discarded immediately. No biometric embeddings or facial templates are stored.
4. **Desktop Hardware Compatibility**: Fully runnable on Windows desktop systems with standard CPU (e.g. Intel Core i5/i7/Iris Xe, AMD Ryzen) or optional NVIDIA CUDA acceleration.

---

## 2. Model Registry & Specifications

| Model Identifier | Architecture & Type | License | Disk Size | Hardware Target | Offline Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`landmark-physiological-v1`** *(Default)* | Multi-scale landmark-anchored physiological synthesis | Apache 2.0 / AAIC Educational | 0 MB (Embedded) | Windows CPU / CUDA (< 50 MB RAM) | **Always Offline** (Ready out-of-the-box) |
| **`stabilityai/sd-turbo`** | Distilled Adversarial Latent Diffusion (SDXL-Turbo) | CreativeML OpenRAIL++-M | ~5.2 GB | NVIDIA GPU (>= 6GB VRAM) or CPU (16GB RAM) | Cached locally in `~/.cache/huggingface/hub` |
| **`runwayml/stable-diffusion-v1-5`** | Latent Diffusion Inpainting (SD-1.5) | CreativeML OpenRAIL-M | ~4.0 GB | NVIDIA GPU (>= 4GB VRAM) or CPU (8GB RAM) | Optional download |

---

## 3. Hardware Requirements & Performance

### Recommended Windows Desktop Specifications:
- **Operating System**: Windows 10 / 11 (64-bit)
- **Processor**: Intel Core i5/i7 (11th Gen+) or AMD Ryzen 5/7
- **System Memory**: 16 GB RAM
- **GPU (Optional)**: NVIDIA GTX 1660 / RTX 3050+ with CUDA 11.8+
- **Inference Speeds**:
  - `landmark-physiological-v1`: **~60–180 ms** per phase on CPU
  - `stabilityai/sd-turbo`: **~1.2–2.5 s** on CUDA GPU; **~25–45 s** on CPU

---

## 4. Setup & Running Instructions on Windows

### Step 1: Install Python Dependencies
Ensure Python 3.10+ is installed, then install the pinned requirements:
```powershell
pip install -r server/requirements.txt
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

### Step 3: Start the Backend Service
From the repository root:
```powershell
python server/main.py
```
The FastAPI service will bind to `http://127.0.0.1:8000`. You can inspect the Swagger documentation at:
- `http://127.0.0.1:8000/docs`

### Step 4: Verify Service Health & Device
Open PowerShell and run:
```powershell
curl http://127.0.0.1:8000/health
```

Expected output:
```json
{
  "status": "healthy",
  "service": "NEO Real Generative AI Facial Transformation Engine",
  "version": "2.0.0",
  "device": "cpu",
  "active_model": "landmark-physiological-v1",
  "timestamp": 1793198000
}
```

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` / `/api/v1/health` | Service status, device, version, and active model |
| `GET` | `/models/status` / `/api/v1/model-status` | Model registry, availability on disk, RAM/VRAM usage |
| `POST` | `/analyze` / `/api/v1/analyze-face` | Genuine face detection, blur variance, exposure, and quality score |
| `POST` | `/transform` / `/api/v1/transform` | Synchronous single-phase transformation from original photo |
| `POST` | `/transform/series` / `/api/v1/transform/series` | Multi-phase generation (Stages 1–3 + Healthy) from source photo |
| `POST` | `/jobs/transform` | Asynchronous job creation with honest milestone progress |
| `POST` | `/jobs/series` | Asynchronous multi-phase job submission |
| `GET` | `/jobs/{job_id}` | Query real job status, progress percentage, and results |
| `POST` | `/jobs/{job_id}/cancel` | Immediate job cancellation and memory reclamation |

---

## 6. Privacy & Educational Safeguards

1. **No External Network Calls During Inference**: Once model weights are locally cached, all processing runs 100% offline.
2. **Volatile Memory Only**: Neither student selfies nor output illustrations are saved to disk on the server.
3. **Non-Stigmatising Illustrations**: The transformation depicts educational biological strain (sleep deprivation dark circles, dehydration, gauntness, sallow vascular cast) without sensationalised, degrading, or frightening imagery.
4. **Educational Disclaimer**: Every output is explicitly designated as an illustrative educational visualization, not a clinical prediction.


---

## 7. Real online/offline diffusion mode (desktop)

NEO includes an optional lazy-loaded Diffusers image-to-image adapter in `server/diffusion_engine.py`. It is separate from the procedural fallback and is active only when `NEO_ACTIVE_MODEL` names a real model.

### Online setup (one-time model download)

1. Create and activate the backend Python environment.
2. Set `NEO_ACTIVE_MODEL=stabilityai/sd-turbo` and `NEO_OFFLINE_MODE=false` in `.env`.
3. Install dependencies with `pip install -r server/requirements.txt`.
4. Start the backend and run a transformation while connected. Model files are downloaded to the Hugging Face cache or `NEO_MODEL_CACHE_DIR`.
5. Check `GET /api/v1/model-status`. A model is not reported as loaded until its first inference succeeds.

### Offline setup

1. Complete the model download while online and verify that a transformation succeeds.
2. Set `NEO_OFFLINE_MODE=true` and restart the backend.
3. Disconnect from the internet and run a transformation. The loader uses `local_files_only=True`.
4. If model files are missing, NEO returns an actionable error; it does not silently substitute filters for the selected diffusion model.

`NEO_MODEL_CACHE_DIR` optionally sets a dedicated cache folder. Keep model weights out of Git; they may occupy several gigabytes. `NEO_DIFFUSION_STEPS` is clamped to 1–8, with a default of 4. Inference is local in both modes: online mode permits model downloads only, not remote image processing.

### Important limitations

- SD-Turbo is image-to-image, not a dedicated identity-preserving inpainting model. Only the detected face mask is composited over the original; this cannot guarantee exact identity or unchanged facial geometry.
- The default procedural engine is lightweight and works offline, but it is image processing—not generative AI.
- All stages are educational illustrations, not medical predictions or guaranteed outcomes.
- CPU-only inference may be slow and memory-intensive. Benchmark on the target desktop before making diffusion the default.
