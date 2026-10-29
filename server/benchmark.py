"""
NEO Performance & Hardware Benchmark Tool
Australian Anti Ice Campaign (AAIC)

Measures:
- Pipeline and model initialization time
- Face analysis & landmark extraction latency
- Per-phase transformation latency (Stages 1, 2, 3, and Healthy Future)
- Multi-phase series execution latency
- Quality metrics (Background MSE, Landmark drift %)
- Process RAM and VRAM utilization
"""

import time
import os
import sys
import base64
import io

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image
import psutil

from pipeline import pipeline_manager
from face_engine import face_engine
from model_registry import model_registry
from config import PHASE_PROFILES


def get_current_memory_mb():
    p = psutil.Process(os.getpid())
    return round(p.memory_info().rss / (1024 * 1024), 2)


def run_benchmark():
    print("=" * 70)
    print(" NEO FACIAL TRANSFORMATION ENGINE — BENCHMARK SUITE")
    print(" Australian Anti Ice Campaign (AAIC)")
    print("=" * 70)

    # 1. Hardware Detection
    print("\n[1] HARDWARE & ENVIRONMENT:")
    print(f"  - Device:              {model_registry.device.upper()}")
    print(f"  - Device Name:         {model_registry.cuda_device_name}")
    print(f"  - CUDA Available:      {model_registry.cuda_available}")
    if model_registry.cuda_available:
        print(f"  - Total VRAM:          {model_registry.total_vram_mb} MB")
    print(f"  - CPU Cores (logical): {psutil.cpu_count(logical=True)}")
    print(f"  - System Total RAM:    {round(psutil.virtual_memory().total / (1024**3), 2)} GB")
    print(f"  - Baseline RAM (Init): {get_current_memory_mb()} MB")

    # 2. Pipeline Initialization Benchmark
    t0 = time.time()
    pipeline_manager.initialize()
    init_time_ms = round((time.time() - t0) * 1000, 2)
    print(f"\n[2] INITIALIZATION:")
    print(f"  - Model Pipeline:      {pipeline_manager.active_model_name}")
    print(f"  - Initialization Time: {init_time_ms} ms")
    print(f"  - Post-Init RAM:       {get_current_memory_mb()} MB")

    # 3. Load Benchmark Image
    sample_path = os.path.expanduser(
        r"C:\Users\prana\.gemini\antigravity\brain\88de6d2f-ac61-4087-94e3-df21a63c7aea\sample_user_selfie.jpg"
    )
    if os.path.exists(sample_path):
        with open(sample_path, "rb") as f:
            b64_image = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")
        test_img = Image.open(sample_path)
        img_dims = f"{test_img.width}x{test_img.height}"
    else:
        test_img = Image.new("RGB", (512, 512), color=(220, 190, 170))
        buf = io.BytesIO()
        test_img.save(buf, format="JPEG")
        b64_image = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")
        img_dims = "512x512 (synthetic)"

    print(f"\n[3] TEST IMAGE:")
    print(f"  - Dimensions:          {img_dims}")

    # 4. Face Analysis Benchmark
    t0 = time.time()
    analysis = face_engine.analyze(b64_image)
    analysis_time_ms = round((time.time() - t0) * 1000, 2)
    print(f"\n[4] FACE ANALYSIS BENCHMARK:")
    print(f"  - Face Detected:       {analysis.face_detected}")
    print(f"  - Confidence:          {analysis.confidence}")
    print(f"  - Blur Variance:       {analysis.quality_metrics.blur_variance if analysis.quality_metrics else 'N/A'}")
    print(f"  - Exposure Lum:        {analysis.quality_metrics.mean_luminance if analysis.quality_metrics else 'N/A'}")
    print(f"  - Analysis Latency:    {analysis_time_ms} ms")

    # 5. Per-Phase Transformation Benchmarks
    print("\n[5] PER-PHASE TRANSFORMATION BENCHMARKS:")
    print(f"{'Phase ID':<18} | {'Latency':<10} | {'BG MSE':<10} | {'Drift %':<8} | {'RAM (MB)':<10}")
    print("-" * 65)

    phase_keys = ["ice_stage1", "ice_stage2", "ice_stage3", "healthy_vitality"]
    phase_times = []

    for pid in phase_keys:
        pcfg = PHASE_PROFILES[pid]
        t0 = time.time()
        resp = pipeline_manager.transform(
            base64_image=b64_image,
            pathway=pcfg["pathway"],
            stage=pcfg["stage"],
            phase_id=pid,
            intensity=0.85,
            seed=42
        )
        lat = round((time.time() - t0) * 1000, 2)
        phase_times.append(lat)
        bg_mse = resp.validation.background_mse if resp.validation else 0.0
        drift = resp.validation.landmark_drift_pct if resp.validation else 0.0
        ram_mb = get_current_memory_mb()
        print(f"{pid:<18} | {lat:>7.1f} ms | {bg_mse:>9.5f} | {drift:>6.2f}% | {ram_mb:>8.1f} MB")

    avg_phase_ms = round(sum(phase_times) / len(phase_times), 2)
    print("-" * 65)
    print(f"  - Average Per-Phase Latency: {avg_phase_ms} ms")

    # 6. Full Multi-Phase Series Benchmark
    t0 = time.time()
    series_resp = pipeline_manager.transform_series(
        base64_image=b64_image,
        phases=phase_keys,
        intensity=0.85,
        seed=42
    )
    series_time_ms = round((time.time() - t0) * 1000, 2)
    print(f"\n[6] MULTI-PHASE BATCH SERIES (4 Phases):")
    print(f"  - Total Execution Time:     {series_time_ms} ms")
    print(f"  - Total Phases Generated:   {series_resp.total_phases_generated}")
    print(f"  - Peak Process RAM:         {get_current_memory_mb()} MB")

    print("\n" + "=" * 70)
    print(" BENCHMARK COMPLETED SUCCESSFULLY")
    print("=" * 70)


if __name__ == "__main__":
    run_benchmark()
