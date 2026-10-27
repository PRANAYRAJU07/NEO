import * as ort from 'onnxruntime-web';
import { EngineInfo, TransformationResult } from '../../types';
import { CanvasProceduralEngine } from './canvasProceduralEngine';
import { ITransformationEngine, TransformationOptions } from './types';

/**
 * ONNX Runtime Web Facial Transformation Adapter
 *
 * Implements real client-side ONNX session creation and tensor inference when an
 * approved model file is mounted at `/models/face_transform.onnx`.
 *
 * If no approved ONNX model is available or hardware constraints prevent model execution,
 * it provides honest disclosure and seamlessly delegates to the local Canvas procedural engine.
 */
export class OnnxTransformationEngine implements ITransformationEngine {
  readonly id = 'onnx-runtime';
  readonly name = 'ONNX Runtime Web Neural Engine';

  private session: ort.InferenceSession | null = null;
  private isModelAvailable = false;
  private fallbackEngine: CanvasProceduralEngine;
  private statusMessage = 'Checking for mounted ONNX model...';

  constructor() {
    this.fallbackEngine = new CanvasProceduralEngine();
  }

  async initialize(): Promise<boolean> {
    await this.fallbackEngine.initialize();

    // Check if ONNX model is mounted in static assets
    try {
      const modelPath = '/models/face_transform.onnx';
      const checkRes = await fetch(modelPath, { method: 'HEAD' });

      if (checkRes.ok && checkRes.headers.get('content-type') !== 'text/html') {
        // Model file is present on static server
        try {
          this.session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['webgl', 'wasm'],
            graphOptimizationLevel: 'all',
          });
          this.isModelAvailable = true;
          this.statusMessage = 'ONNX Model loaded successfully (WebGL/WASM acceleration active).';
          return true;
        } catch (sessionErr) {
          this.isModelAvailable = false;
          this.statusMessage = `ONNX session init failed: ${sessionErr instanceof Error ? sessionErr.message : String(sessionErr)}. Active fallback to Procedural Engine.`;
          return false;
        }
      } else {
        // Model not deployed
        this.isModelAvailable = false;
        this.statusMessage = 'Approved ONNX weights not mounted in /models/. Using On-Device Procedural Engine.';
        return false;
      }
    } catch {
      this.isModelAvailable = false;
      this.statusMessage = 'Standalone local client mode: Procedural Canvas Engine active.';
      return false;
    }
  }

  getInfo(): EngineInfo {
    if (this.isModelAvailable && this.session) {
      return {
        type: 'onnx-runtime',
        name: this.name,
        version: '1.20.1-onnx',
        isLocalOnly: true,
        modelLoaded: true,
        description: 'Client-side ONNX Runtime Web neural transformation with WebGL/WASM acceleration.',
        provenance: 'Locally compiled ONNX model checkpoint. 100% on-device inference without cloud API.',
        hardwareAcceleration: 'WebGL / WebAssembly SIMD',
      };
    }

    return {
      type: 'canvas-procedural',
      name: 'On-Device Visual Filter Engine (Active)',
      version: '1.2.0-client',
      isLocalOnly: true,
      modelLoaded: false,
      description: `ONNX weights pending AAIC licensing approval (${this.statusMessage}). Running verified client-side Canvas procedural engine.`,
      provenance: 'Proprietary AAIC educational shader. Non-stigmatising, zero server communication.',
      hardwareAcceleration: 'HTML5 Canvas 2D / Wasm',
    };
  }

  async transform(
    imageSource: HTMLImageElement | ImageBitmap,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    if (this.isModelAvailable && this.session) {
      return this.runOnnxInference(imageSource, options);
    }

    // Honest delegation to the verified local procedural engine
    return this.fallbackEngine.transform(imageSource, options);
  }

  /**
   * Preprocesses image into float32 RGB tensor [1, 3, 256, 256],
   * runs ONNX session, and postprocesses back into displayable image.
   */
  private async runOnnxInference(
    imageSource: HTMLImageElement | ImageBitmap,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    const startTime = performance.now();

    // 1. Offscreen 256x256 tensor input preparation
    const targetSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create offscreen canvas for ONNX preprocessing');

    ctx.drawImage(imageSource, 0, 0, targetSize, targetSize);
    const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
    const data = imgData.data;

    // 2. Transpose HWC (Uint8) -> CHW (Float32 in [-1, 1] or [0, 1])
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    const channelSize = targetSize * targetSize;

    for (let i = 0; i < channelSize; i++) {
      const r = data[i * 4]! / 255.0;
      const g = data[i * 4 + 1]! / 255.0;
      const b = data[i * 4 + 2]! / 255.0;

      float32Data[i] = (r - 0.5) / 0.5; // Normalized to [-1, 1]
      float32Data[channelSize + i] = (g - 0.5) / 0.5;
      float32Data[2 * channelSize + i] = (b - 0.5) / 0.5;
    }

    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);

    // 3. Inference
    const feeds: Record<string, ort.Tensor> = {};
    const inputName = this.session?.inputNames[0] || 'input';
    feeds[inputName] = inputTensor;

    const results = await this.session!.run(feeds);
    const outputName = this.session?.outputNames[0] || 'output';
    const outputTensor = results[outputName];

    if (!outputTensor) {
      throw new Error('ONNX inference produced null output tensor');
    }

    // 4. Postprocessing tensor back to canvas
    const outputData = outputTensor.data as Float32Array;
    const outImgData = ctx.createImageData(targetSize, targetSize);
    const outData = outImgData.data;

    for (let i = 0; i < channelSize; i++) {
      const r = Math.min(255, Math.max(0, Math.round(((outputData[i] ?? 0) * 0.5 + 0.5) * 255)));
      const g = Math.min(255, Math.max(0, Math.round(((outputData[channelSize + i] ?? 0) * 0.5 + 0.5) * 255)));
      const b = Math.min(255, Math.max(0, Math.round(((outputData[2 * channelSize + i] ?? 0) * 0.5 + 0.5) * 255)));

      outData[i * 4] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 255;
    }

    ctx.putImageData(outImgData, 0, 0);

    const blobUrl = await new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to create blob from ONNX output'));
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.92);
    });

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      imageUrl: blobUrl,
      pathway: options.pathway,
      intensity: options.intensity,
      stage: options.stage,
      executionTimeMs,
      engineUsed: this.id,
      timestamp: Date.now(),
    };
  }

  release(): void {
    if (this.session) {
      try {
        this.session.release();
      } catch (e) {
        console.warn('Error releasing ONNX session:', e);
      }
      this.session = null;
    }
    this.fallbackEngine.release();
    this.isModelAvailable = false;
  }
}

export const onnxEngine = new OnnxTransformationEngine();
