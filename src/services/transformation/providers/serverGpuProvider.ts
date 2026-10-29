import { EngineInfo, FaceAnalysisResult, PhotoData, TransformationResult } from '../../../types';
import { analyzeFace as clientAnalyzeFace } from '../faceAnalyzer';
import { imageCleanup } from '../../imageCleanup';
import { ITransformationProvider, TransformationOptions } from '../types';

export class ServerGpuProvider implements ITransformationProvider {
  readonly id = 'server-gpu';
  readonly name = 'Desktop-First Facial Transformation Pipeline (FastAPI)';

  private baseUrl: string;
  private currentAbortController: AbortController | null = null;
  private serverInfo: EngineInfo;
  private isOnline = false;

  constructor(endpoint?: string) {
    // Configurable endpoint with local fallback
    this.baseUrl = endpoint || (import.meta as any).env?.VITE_AI_INFERENCE_ENDPOINT || 'http://localhost:8000';
    this.serverInfo = {
      type: 'server-gpu',
      name: this.name,
      version: '2.0.0-desktop',
      isLocalOnly: true,
      modelLoaded: false,
      endpointUrl: this.baseUrl,
      serverStatus: 'offline',
      description: 'Local FastAPI facial transformation service with multi-phase physiological synthesis and identity preservation.',
      provenance: 'Dedicated AAIC educational pipeline. Zero persistent disk storage; processed entirely in volatile memory and destroyed immediately.',
      hardwareAcceleration: 'Windows Desktop CPU (AVX2 / OpenMP) or NVIDIA CUDA',
    };
  }

  async initialize(): Promise<boolean> {
    return this.checkHealth();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        this.isOnline = true;
        await this.refreshModelStatus();
        return true;
      }
      this.isOnline = false;
      this.serverInfo.serverStatus = 'offline';
      return false;
    } catch {
      this.isOnline = false;
      this.serverInfo.serverStatus = 'offline';
      return false;
    }
  }

  private async refreshModelStatus(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/model-status`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        this.serverInfo.modelLoaded = data.status === 'ready' || data.status === 'cpu_fallback';
        this.serverInfo.serverStatus = data.status;
        this.serverInfo.device = data.device;
        if (data.model_name) {
          this.serverInfo.name = `${this.name} (${data.model_name})`;
        }
        if (data.vram_allocated_mb) {
          this.serverInfo.vramInfo = `${data.vram_allocated_mb} MB / ${data.vram_total_mb} MB`;
        } else if (data.ram_used_mb) {
          this.serverInfo.vramInfo = `RAM: ${data.ram_used_mb} MB (${data.device.toUpperCase()})`;
        }
      }
    } catch {
      // Ignore background status refresh error
    }
  }

  getInfo(): EngineInfo {
    return {
      ...this.serverInfo,
      serverStatus: this.isOnline ? this.serverInfo.serverStatus : 'offline',
    };
  }

  async analyzeFace(image: HTMLImageElement | PhotoData): Promise<FaceAnalysisResult> {
    if (!this.isOnline) {
      return clientAnalyzeFace(image);
    }

    try {
      const base64Image = await this.imageSourceToBase64(image);
      const res = await fetch(`${this.baseUrl}/api/v1/analyze-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          faceDetected: data.face_detected,
          faceCount: data.face_count,
          confidence: data.confidence,
          boundingBox: data.bounding_box || undefined,
          aspectRatio: data.aspect_ratio,
          isCentered: data.is_centered,
          qualityMetrics: data.quality_metrics ? {
            blurVariance: data.quality_metrics.blur_variance,
            isBlurry: data.quality_metrics.is_blurry,
            meanLuminance: data.quality_metrics.mean_luminance,
            isUnderexposed: data.quality_metrics.is_underexposed,
            isOverexposed: data.quality_metrics.is_overexposed,
            qualityScore: data.quality_metrics.quality_score,
          } : undefined,
          recommendations: data.recommendations || [],
        };
      }
    } catch {
      // Fallback to local client analysis if server analysis fails or times out
    }
    return clientAnalyzeFace(image);
  }

  cancelCurrentTransformation(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  async transform(
    imageSource: HTMLImageElement | ImageBitmap | PhotoData,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    if (options.abortSignal?.aborted) {
      throw new Error('Transformation cancelled by user');
    }

    this.cancelCurrentTransformation();
    const controller = new AbortController();
    this.currentAbortController = controller;

    // Link passed external abortSignal if present
    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => {
        controller.abort();
        this.currentAbortController = null;
      });
    }

    const { pathway, intensity, stage = 1, seed } = options;

    // Report real initial milestone
    if (options.onProgress) {
      options.onProgress(15, 'Validating facial landmarks and orientation...');
    }

    const base64Image = await this.imageSourceToBase64(imageSource);

    if (options.onProgress) {
      options.onProgress(35, 'Generating feathered anatomical masks...');
    }

    const payload = {
      image: base64Image,
      pathway,
      stage,
      intensity,
      seed: seed || undefined,
      preserve_identity: options.preserveIdentity ?? true,
    };

    const startTime = performance.now();

    try {
      if (options.onProgress) {
        options.onProgress(55, 'Executing identity-preserving transformation...');
      }

      const res = await fetch(`${this.baseUrl}/api/v1/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || `Server inference error: HTTP ${res.status}`);
      }

      if (options.onProgress) {
        options.onProgress(85, 'Running background preservation and quality validation...');
      }

      const data = await res.json();
      const executionTimeMs = data.execution_time_ms || Math.round(performance.now() - startTime);

      // Convert base64 result to Blob URL and register for memory cleanup
      const blobUrl = await this.base64ToBlobUrl(data.image);
      imageCleanup.registerBlobUrl(blobUrl);

      if (options.onProgress) {
        options.onProgress(100, 'Transformation complete');
      }

      return {
        imageUrl: blobUrl,
        pathway,
        intensity,
        stage,
        executionTimeMs,
        engineUsed: 'server-gpu',
        timestamp: Date.now(),
        seed: data.seed,
        effectiveStrength: data.effective_strength,
        promptUsed: data.prompt_used,
        negativePromptUsed: data.negative_prompt_used,
        modelName: data.model,
        isLiveGpuInference: data.is_live_gpu_inference,
        notes: data.notes,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Transformation cancelled by user');
      }
      if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        throw new Error(
          `Unable to connect to Private AI service at ${this.baseUrl}. Please verify the Python backend is running on port 8000, or switch to the Offline Provider.`
        );
      }
      throw err;
    } finally {
      this.currentAbortController = null;
    }
  }

  private async imageSourceToBase64(
    source: HTMLImageElement | ImageBitmap | PhotoData
  ): Promise<string> {
    if ('file' in source && source.file) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read photo file'));
        reader.readAsDataURL(source.file!);
      });
    }

    // Fallback: draw to offscreen canvas and export base64
    const canvas = document.createElement('canvas');
    let width = 0;
    let height = 0;

    if ('blobUrl' in source) {
      width = source.width;
      height = source.height;
    } else if ('naturalWidth' in source) {
      width = source.naturalWidth;
      height = source.naturalHeight;
    } else {
      width = source.width;
      height = source.height;
    }

    // Limit dimension to 1024 for network transmission efficiency
    const maxDim = 1024;
    let scale = 1;
    if (width > maxDim || height > maxDim) {
      scale = maxDim / Math.max(width, height);
    }
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create offscreen canvas context');

    if ('blobUrl' in source) {
      const img = await this.loadImg(source.blobUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.90);
  }

  private loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image for canvas encoding'));
      img.src = src;
    });
  }

  private async base64ToBlobUrl(base64Data: string): Promise<string> {
    const res = await fetch(base64Data);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  release(): void {
    this.cancelCurrentTransformation();
    this.isOnline = false;
  }
}
