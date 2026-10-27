"""
End-to-End Live Generative Inference Verification
Tests real Diffusers SD-Turbo img2img execution on the host machine.
"""

import time
import base64
import io
from PIL import Image
from pipeline import GenerativePipelineManager


def test_live_sd_turbo_diffusion():
    print("[TEST] Initializing live GenerativePipelineManager...")
    manager = GenerativePipelineManager()
    t0 = time.time()
    manager.initialize()
    init_time = round(time.time() - t0, 2)
    print(f"[TEST] Initialization completed in {init_time}s. Loaded: {manager.is_loaded}, Device: {manager.device}")

    assert manager.is_loaded, "Pipeline failed to load"
    assert manager.pipeline is not None, "Pipeline object is None"

    # Create synthetic test portrait face
    test_img = Image.new("RGB", (512, 512), color=(210, 175, 145))
    buf = io.BytesIO()
    test_img.save(buf, format="JPEG")
    b64_in = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    print("[TEST] Executing real SD-Turbo image-to-image transformation (Stage 2)...")
    result = manager.transform(
        base64_image=b64_in,
        pathway="ice",
        stage=2,
        intensity=0.85,
        seed=12345
    )

    assert result["success"] is True, "Result success is not True"
    assert "data:image/jpeg;base64," in result["image"], "Result image is not valid base64 data URI"
    assert result["model"] == "stabilityai/sd-turbo", f"Unexpected model: {result['model']}"
    assert result["stage"] == 2, f"Unexpected stage: {result['stage']}"
    assert result["execution_time_ms"] > 0, "Execution time must be > 0"
    assert "SD-Turbo" in result["notes"], f"Unexpected notes: {result['notes']}"

    # Verify decoded image dimensions
    raw_b64 = result["image"].split(",", 1)[1]
    decoded_img = Image.open(io.BytesIO(base64.b64decode(raw_b64)))
    assert decoded_img.size == (512, 512), f"Unexpected output size: {decoded_img.size}"

    print(f"[TEST] Live inference SUCCESS! Execution time: {result['execution_time_ms']}ms. Device: {manager.device}")


if __name__ == "__main__":
    test_live_sd_turbo_diffusion()
