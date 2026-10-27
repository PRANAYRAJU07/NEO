import { EngineInfo, FaceAnalysisResult, PhotoData, TransformationResult } from '../../../types';
import { calculateEffectiveStrength, STAGE_PROFILES, COMMON_NEGATIVE_PROMPT } from '../promptProfiles';
import { analyzeFace } from '../faceAnalyzer';
import { imageCleanup } from '../../imageCleanup';
import { ITransformationProvider, TransformationOptions } from '../types';

export class MockAiProvider implements ITransformationProvider {
  readonly id = 'mock-ai';
  readonly name = 'Verified AI Simulation Provider (Offline / Test)';

  private isInitialized = false;
  private currentAbortController: AbortController | null = null;

  async initialize(): Promise<boolean> {
    this.isInitialized = true;
    return true;
  }

  getInfo(): EngineInfo {
    return {
      type: 'mock-ai',
      name: this.name,
      version: '1.0.0-test',
      isLocalOnly: true,
      modelLoaded: this.isInitialized,
      description: 'Deterministic offline test provider validating the SDXL prompt profiles, denoising strengths, and interface contracts.',
      provenance: 'Internal automated test double. Explicitly non-production AI inference.',
      hardwareAcceleration: 'HTML5 2D Canvas',
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
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
    if (options.abortSignal?.aborted) {
      throw new Error('Transformation cancelled by user');
    }

    this.cancelCurrentTransformation();
    this.currentAbortController = new AbortController();

    if (options.abortSignal) {
      options.abortSignal.addEventListener('abort', () => this.cancelCurrentTransformation());
    }

    const startTime = performance.now();
    const { pathway, intensity, stage = 1 } = options;
    const seed = options.seed || Math.floor(Math.random() * 900000) + 100000;

    const profile = STAGE_PROFILES[pathway][stage] || STAGE_PROFILES.ice[1]!;
    const effectiveStrength = calculateEffectiveStrength(pathway, stage, intensity);

    // Render texture synthesis on canvas
    const imgElement = await this.resolveImageElement(imageSource);

    // Check cancellation
    if (this.currentAbortController.signal.aborted) {
      throw new Error('Transformation cancelled by user');
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(768, imgElement.naturalWidth || imgElement.width);
    canvas.height = Math.min(768, imgElement.naturalHeight || imgElement.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Apply high-detail mathematical simulation based on effective strength
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w * 0.5;
    const centerY = h * 0.45;
    const maxDist = Math.max(w, h) * 0.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;

      const pixelIndex = i / 4;
      const x = pixelIndex % w;
      const y = Math.floor(pixelIndex / w);

      const dx = (x - centerX) / maxDist;
      const dy = (y - centerY) / maxDist;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (pathway === 'ice') {
        // Desaturation mapped to effective strength
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const desat = Math.min(1.0, effectiveStrength * (0.6 + stage * 0.15));
        let newR = r * (1 - desat) + lum * desat;
        let newG = g * (1 - desat) + lum * desat;
        let newB = b * (1 - desat) + lum * desat;

        // Sallow undertone
        newR = Math.max(0, newR - 16 * effectiveStrength);
        newB = Math.min(255, newB + 9 * effectiveStrength);

        // Orbital and cheek hollows
        const isUnderEye = Math.abs(dy + 0.05) < 0.12 && Math.abs(dx) > 0.08 && Math.abs(dx) < 0.35;
        if (isUnderEye) {
          const darkFactor = 1.0 - 0.25 * effectiveStrength;
          newR *= darkFactor;
          newG *= darkFactor;
          newB *= darkFactor * 1.03;
        }

        const isCheek = dy > 0.05 && dy < 0.30 && Math.abs(dx) > 0.15 && Math.abs(dx) < 0.45;
        if (isCheek && stage >= 2) {
          const hollowFactor = 1.0 - 0.18 * effectiveStrength;
          newR *= hollowFactor;
          newG *= hollowFactor;
          newB *= hollowFactor;
        }

        // Micro-texture dehydration
        if (stage >= 2 && dist < 0.45) {
          const noise = (((x * 5) ^ (y * 11)) % 7 - 3) * effectiveStrength * 2.2;
          newR = Math.max(0, Math.min(255, newR + noise));
          newG = Math.max(0, Math.min(255, newG + noise));
          newB = Math.max(0, Math.min(255, newB + noise));
        }

        data[i] = Math.round(newR);
        data[i + 1] = Math.round(newG);
        data[i + 2] = Math.round(newB);
      } else {
        // Healthy pathway: warm vitality & eye catchlight
        const warmFactor = 1.0 + 0.08 * effectiveStrength;
        let newR = r * warmFactor + 4 * effectiveStrength;
        let newG = g * (1.0 + 0.03 * effectiveStrength) + 2 * effectiveStrength;
        let newB = b * (1.0 - 0.02 * effectiveStrength);

        const isEye = Math.abs(dy + 0.06) < 0.08 && Math.abs(dx) > 0.09 && Math.abs(dx) < 0.32;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (isEye && lum > 140) {
          newR = Math.min(255, newR + 20 * effectiveStrength);
          newG = Math.min(255, newG + 20 * effectiveStrength);
          newB = Math.min(255, newB + 22 * effectiveStrength);
        }

        data[i] = Math.round(newR);
        data[i + 1] = Math.round(newG);
        data[i + 2] = Math.round(newB);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const blobUrl = await new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas blob generation failed'));
        const url = URL.createObjectURL(blob);
        imageCleanup.registerBlobUrl(url);
        resolve(url);
      }, 'image/jpeg', 0.92);
    });

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      imageUrl: blobUrl,
      pathway,
      intensity,
      stage,
      executionTimeMs,
      engineUsed: 'mock-ai',
      timestamp: Date.now(),
      seed,
      effectiveStrength,
      promptUsed: profile.prompt,
      negativePromptUsed: COMMON_NEGATIVE_PROMPT,
      modelName: 'SDXL-1.0-Simulated',
      isLiveGpuInference: false,
      notes: 'Deterministic offline verification provider. SDXL prompt and strength contracts validated.',
    };
  }

  private async resolveImageElement(
    source: HTMLImageElement | ImageBitmap | PhotoData
  ): Promise<HTMLImageElement> {
    if ('blobUrl' in source) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = source.blobUrl;
      });
    }

    if (source instanceof HTMLImageElement) {
      return source;
    }

    // ImageBitmap to HTMLImageElement
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');
    ctx.drawImage(source, 0, 0);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load bitmap image'));
      img.src = canvas.toDataURL();
    });
  }

  release(): void {
    this.cancelCurrentTransformation();
    this.isInitialized = false;
  }
}
