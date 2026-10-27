import { EngineInfo, FaceAnalysisResult, PhotoData, TransformationResult } from '../../../types';
import { analyzeFace } from '../faceAnalyzer';
import { imageCleanup } from '../../imageCleanup';
import { ITransformationProvider, TransformationOptions } from '../types';

export class ServerGpuProvider implements ITransformationProvider {
  readonly id = 'server-gpu';
  readonly name = 'Private GPU Generative AI Pipeline (SDXL)';

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
      version: 'SDXL-1.0-fp16',
      isLocalOnly: false,
      modelLoaded: false,
      endpointUrl: this.baseUrl,
      serverStatus: 'offline',
      description: 'Private GPU inference backend running Stable Diffusion XL Img2Img with stage-conditioned guidance.',
      provenance: 'Dedicated AAIC educational GPU cluster. Images processed in volatile memory only and destroyed immediately after generation.',
      hardwareAcceleration: 'NVIDIA Tensor Core GPU (CUDA / TensorRT / PyTorch fp16)',
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
        this.serverInfo.modelLoaded = data.status === 'ready';
        this.serverInfo.serverStatus = data.status;
        this.serverInfo.device = data.device;
        if (data.vram_allocated_mb) {
          this.serverInfo.vramInfo = `${data.vram_allocated_mb} MB / ${data.vram_total_mb} MB`;
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
    return analyzeFace(image);
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
    this.cancelCurrentTransformation();
    this.currentAbortController = new AbortController();

    // Link passed external abortSignal if present
    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => this.cancelCurrentTransformation());
    }

    const { pathway, intensity, stage = 1, seed } = options;
    const base64Image = await this.imageSourceToBase64(imageSource);

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
      const res = await fetch(`${this.baseUrl}/api/v1/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: this.currentAbortController.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || `Server inference error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const executionTimeMs = data.execution_time_ms || Math.round(performance.now() - startTime);

      // Convert base64 result to Blob URL and register for memory cleanup
      const blobUrl = await this.base64ToBlobUrl(data.image);
      imageCleanup.registerBlobUrl(blobUrl);

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
          `Unable to connect to Private GPU service at ${this.baseUrl}. Please verify the Python backend is running on port 8000, or switch to the Offline Provider.`
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
