import { EngineInfo, FaceAnalysisResult, PhotoData, TransformationResult } from '../../../types';
import { calculateEffectiveStrength, STAGE_PROFILES, COMMON_NEGATIVE_PROMPT } from '../promptProfiles';
import { analyzeFace } from '../faceAnalyzer';
import { imageCleanup } from '../../imageCleanup';
import { ITransformationProvider, TransformationOptions } from '../types';

export class MockAiProvider implements ITransformationProvider {
  readonly id = 'mock-ai';
  readonly name = 'Offline Demo Provider (Non-Production Fallback)';

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
      version: '1.0.0-demo',
      isLocalOnly: true,
      modelLoaded: this.isInitialized,
      description: 'Explicit offline test/demo provider validating UI contracts and layout when the local Python AI backend is offline.',
      provenance: 'Explicitly labeled development fallback. Not active when Python FastAPI service is online.',
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

    // Detect face position to anchor anatomical features dynamically
    let centerX = canvas.width * 0.5;
    let centerY = canvas.height * 0.48;
    let maxDist = Math.max(canvas.width, canvas.height) * 0.38;

    try {
      const analysis = await this.analyzeFace(imgElement);
      if (analysis.faceDetected && analysis.boundingBox) {
        const scaleX = canvas.width / (imgElement.naturalWidth || canvas.width);
        const scaleY = canvas.height / (imgElement.naturalHeight || canvas.height);
        centerX = (analysis.boundingBox.x + analysis.boundingBox.width * 0.50) * scaleX;
        centerY = (analysis.boundingBox.y + analysis.boundingBox.height * 0.48) * scaleY;
        maxDist = (analysis.boundingBox.width * 0.55) * scaleX;
      }
    } catch {
      // Fallback to centered face geometry
    }

    const w = canvas.width;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;

      const pixelIndex = i / 4;
      const x = pixelIndex % w;
      const y = Math.floor(pixelIndex / w);

      const dx = (x - centerX) / maxDist;
      const dy = (y - centerY) / maxDist;

      // 1. Smooth elliptical face mask
      const faceMask = Math.max(0, Math.min(1, Math.exp(-Math.pow(dx / 0.50, 4) - Math.pow(dy / 0.62, 4))));

      if (pathway === 'ice') {
        // 2. Smooth Continuous Gaussian Periorbital Dark Circles
        const dLeftEye = (dx + 0.18) * (dx + 0.18) / (2 * 0.08 * 0.08) + (dy + 0.02) * (dy + 0.02) / (2 * 0.05 * 0.05);
        const dRightEye = (dx - 0.18) * (dx - 0.18) / (2 * 0.08 * 0.08) + (dy + 0.02) * (dy + 0.02) / (2 * 0.05 * 0.05);
        const eyeHollow = Math.min(1, Math.exp(-dLeftEye) + Math.exp(-dRightEye)) * faceMask;

        // 3. Smooth Continuous Sub-malar Cheek Hollows (Gauntness)
        const lxRot = (dx + 0.22) * 0.969 - (dy - 0.15) * 0.247;
        const lyRot = (dx + 0.22) * 0.247 + (dy - 0.15) * 0.969;
        const dLeftCheek = (lxRot * lxRot) / (2 * 0.08 * 0.08) + (lyRot * lyRot) / (2 * 0.13 * 0.13);

        const rxRot = (dx - 0.22) * 0.969 - (dy - 0.15) * (-0.247);
        const ryRot = (dx - 0.22) * (-0.247) + (dy - 0.15) * 0.969;
        const dRightCheek = (rxRot * rxRot) / (2 * 0.08 * 0.08) + (ryRot * ryRot) / (2 * 0.13 * 0.13);

        const cheekHollow = Math.min(1, Math.exp(-dLeftCheek) + Math.exp(-dRightCheek)) * faceMask;

        // Desaturation mapped to effective strength & face mask
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const desat = Math.min(1.0, (0.08 + 0.08 * stage) * effectiveStrength * faceMask);
        let newR = r * (1 - desat) + lum * desat;
        let newG = g * (1 - desat) + lum * desat;
        let newB = b * (1 - desat) + lum * desat;

        // Sallow undertone
        newR = Math.max(0, newR - 10 * stage * effectiveStrength * faceMask);
        newB = Math.max(0, newB - 6 * stage * effectiveStrength * faceMask);

        // Orbital eye socket deepening (smooth continuous shading, no hard boxes)
        const eyeDarken = (0.24 + 0.12 * stage) * effectiveStrength * eyeHollow;
        newR *= (1.0 - eyeDarken);
        newG *= (1.0 - eyeDarken * 1.05);
        newB *= (1.0 - eyeDarken * 0.92);

        // Cheek gauntness shading for stage >= 2
        if (stage >= 2) {
          const cheekDarken = (0.12 + 0.10 * (stage - 1)) * effectiveStrength * cheekHollow;
          newR *= (1.0 - cheekDarken);
          newG *= (1.0 - cheekDarken);
          newB *= (1.0 - cheekDarken);
        }

        // Micro-texture dehydration
        if (stage >= 2 && faceMask > 0.3) {
          const noise = (((x * 7) ^ (y * 13)) % 7 - 3) * effectiveStrength * 1.5;
          newR = Math.max(0, Math.min(255, newR + noise));
          newG = Math.max(0, Math.min(255, newG + noise));
          newB = Math.max(0, Math.min(255, newB + noise));
        }

        data[i] = Math.round(newR);
        data[i + 1] = Math.round(newG);
        data[i + 2] = Math.round(newB);
      } else {
        // Healthy pathway: warm vitality & eye catchlight
        const warmFactor = 1.0 + 0.08 * effectiveStrength * faceMask;
        let newR = r * warmFactor + 4 * effectiveStrength * faceMask;
        let newG = g * (1.0 + 0.03 * effectiveStrength * faceMask) + 2 * effectiveStrength * faceMask;
        let newB = b * (1.0 - 0.02 * effectiveStrength * faceMask);

        data[i] = Math.round(newR);
        data[i + 1] = Math.round(newG);
        data[i + 2] = Math.round(newB);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // If ice pathway stage >= 2, render realistic excoriation sores on canvas
    if (pathway === 'ice' && stage >= 2) {
      const numSores = stage === 2 ? 4 : 12;
      const rng = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };

      for (let sIdx = 0; sIdx < numSores; sIdx++) {
        const angle = rng(seed + sIdx * 7) * Math.PI * 2;
        const rDist = 0.12 + rng(seed + sIdx * 13) * 0.26;
        const sx = centerX + rDist * maxDist * Math.cos(angle);
        const sy = centerY + rDist * maxDist * Math.sin(angle) * 1.1;
        const rad = 2.5 + rng(seed + sIdx * 19) * 3.5;

        // Subtle erythematous halo (natural warm vascular redness)
        const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 2.0);
        haloGrad.addColorStop(0, `rgba(165, 42, 42, ${0.30 * effectiveStrength})`);
        haloGrad.addColorStop(0.6, `rgba(130, 35, 35, ${0.15 * effectiveStrength})`);
        haloGrad.addColorStop(1, 'rgba(130, 35, 35, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 2.0, 0, Math.PI * 2);
        ctx.fill();

        // Dark dried scab core (organic brown-maroon)
        const scabGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
        scabGrad.addColorStop(0, `rgba(50, 18, 15, ${0.75 * effectiveStrength})`);
        scabGrad.addColorStop(0.7, `rgba(75, 28, 24, ${0.55 * effectiveStrength})`);
        scabGrad.addColorStop(1, 'rgba(75, 28, 24, 0)');
        ctx.fillStyle = scabGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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
