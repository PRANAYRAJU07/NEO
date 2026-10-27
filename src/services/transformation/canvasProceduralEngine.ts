import { EngineInfo, TransformationResult } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { imageCleanup } from '../imageCleanup';
import { ITransformationEngine, TransformationOptions } from './types';

/**
 * On-Device Canvas 2D Procedural Transformation Engine
 *
 * Implements real client-side pixel manipulation simulating the educational effects:
 * - "My Future with Ice": Gradual loss of skin elasticity/hydration, sallow desaturation,
 *   deepened orbital/cheek shadowing, micro-strain texture, respectful and non-sensationalised.
 * - "My Healthy Future": Warm vibrancy, vital skin tones, enhanced clarity, and radiant catchlights.
 *
 * Runs 100% locally in browser memory without external server communication.
 */
export class CanvasProceduralEngine implements ITransformationEngine {
  readonly id = 'canvas-procedural';
  readonly name = 'AAIC On-Device Visual Filter Engine';

  private isInitialized = false;
  private previousResultUrl: string | null = null;

  async initialize(): Promise<boolean> {
    this.isInitialized = true;
    return this.isInitialized;
  }

  getInfo(): EngineInfo {
    return {
      type: 'canvas-procedural',
      name: this.name,
      version: '1.2.0-client',
      isLocalOnly: true,
      modelLoaded: true,
      description: 'Client-side procedural image synthesis utilizing 2D Canvas pixel manipulation and dermatological color-space transforms.',
      provenance: 'Proprietary AAIC procedural prevention shader engine. Compliant with youth-safe, non-stigmatising educational guidelines.',
      hardwareAcceleration: 'HTML5 2D Canvas API / SIMD-accelerated browser rasterizer',
    };
  }

  async transform(
    imageSource: HTMLImageElement | ImageBitmap,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    const startTime = performance.now();

    // 1. Calculate target dimensions preserving aspect ratio
    const srcWidth = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width;
    const srcHeight = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height;

    const maxDim = APP_CONFIG.imageLimits.standardProcessingDimension;
    let targetWidth = srcWidth;
    let targetHeight = srcHeight;

    if (srcWidth > maxDim || srcHeight > maxDim) {
      if (srcWidth > srcHeight) {
        targetWidth = maxDim;
        targetHeight = Math.round((srcHeight * maxDim) / srcWidth);
      } else {
        targetHeight = maxDim;
        targetWidth = Math.round((srcWidth * maxDim) / srcHeight);
      }
    }

    // 2. Offscreen Canvas setup
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Failed to create 2D canvas context for image processing');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

    // 3. Extract Pixel Data
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imgData.data;
    const { pathway, intensity, stage = 1 } = options;

    // Effective intensity scaled by stage if provided
    const stageMultiplier = stage === 1 ? 0.35 : stage === 2 ? 0.70 : 1.0;
    const effectiveIntensity = Math.min(1.0, Math.max(0.0, intensity * stageMultiplier));

    if (pathway === 'ice') {
      this.applyIcePathwayEffects(data, targetWidth, targetHeight, effectiveIntensity, stage);
    } else {
      this.applyHealthyPathwayEffects(data, targetWidth, targetHeight, effectiveIntensity);
    }

    // 4. Put transformed pixel data back onto canvas
    ctx.putImageData(imgData, 0, 0);

    // 5. Apply subtle photographic tone adjustment layer for realism
    if (pathway === 'ice') {
      // Subtle cool desaturation vignette
      const gradient = ctx.createRadialGradient(
        targetWidth * 0.5,
        targetHeight * 0.45,
        targetWidth * 0.2,
        targetWidth * 0.5,
        targetHeight * 0.45,
        targetWidth * 0.7
      );
      const alpha = 0.08 + effectiveIntensity * 0.15;
      gradient.addColorStop(0, `rgba(40, 50, 60, ${alpha * 0.2})`);
      gradient.addColorStop(1, `rgba(15, 23, 42, ${alpha})`);

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();
    } else {
      // Warm, vibrant glow overlay
      const gradient = ctx.createRadialGradient(
        targetWidth * 0.5,
        targetHeight * 0.4,
        targetWidth * 0.15,
        targetWidth * 0.5,
        targetHeight * 0.4,
        targetWidth * 0.65
      );
      const alpha = 0.05 + effectiveIntensity * 0.12;
      gradient.addColorStop(0, `rgba(255, 237, 213, ${alpha * 1.2})`);
      gradient.addColorStop(1, `rgba(14, 165, 233, ${alpha * 0.4})`);

      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();
    }

    // 6. Convert canvas to Blob URL
    const blobUrl = await new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create Blob from transformed canvas'));
            return;
          }
          const url = URL.createObjectURL(blob);
          imageCleanup.registerBlobUrl(url);
          resolve(url);
        },
        'image/jpeg',
        0.92
      );
    });

    // Cleanup previous result URL if present to prevent memory buildup
    if (this.previousResultUrl) {
      imageCleanup.revokeBlobUrl(this.previousResultUrl);
    }
    this.previousResultUrl = blobUrl;

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      imageUrl: blobUrl,
      pathway,
      intensity,
      stage,
      executionTimeMs,
      engineUsed: this.id,
      timestamp: Date.now(),
    };
  }

  /**
   * Applies respectful, educational substance toll simulation on pixel buffer:
   * - Desaturation of healthy skin glow
   * - Sallow undertone shift (slight reduction in warm red/pink, shift toward cool dull tone)
   * - Gradual loss of skin elasticity/hydration
   * - Enhanced under-eye and cheek fatigue shading
   */
  private applyIcePathwayEffects(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    intensity: number,
    stage: number
  ): void {
    const centerX = width * 0.5;
    const centerY = height * 0.45;
    const maxRadius = Math.max(width, height) * 0.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;

      // Calculate pixel coordinates
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      // Distance from center of face
      const dx = (x - centerX) / maxRadius;
      const dy = (y - centerY) / maxRadius;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Standard perceptual luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // 1. Progressive Desaturation (loss of fresh skin tone)
      const desatAmount = 0.25 * intensity + (stage >= 2 ? 0.2 * intensity : 0) + (stage === 3 ? 0.2 : 0);
      let newR = r * (1 - desatAmount) + luminance * desatAmount;
      let newG = g * (1 - desatAmount) + luminance * desatAmount;
      let newB = b * (1 - desatAmount) + luminance * desatAmount;

      // 2. Sallow color balance shift (dehydration & poor circulation)
      // Ice depletes skin hydration: Red drops, cool/sallow tones increase slightly
      const redDrop = 18 * intensity;
      const blueBoost = 8 * intensity * (1 - distFromCenter * 0.5);
      newR = Math.max(0, newR - redDrop);
      newB = Math.min(255, newB + blueBoost);

      // 3. Subtle hollow/fatigue shadowing around eyes and cheeks
      // Eyes are typically in y: 0.35 to 0.45 of face height, cheeks around 0.45 to 0.6
      const isUnderEyeZone = Math.abs(dy + 0.05) < 0.12 && Math.abs(dx) < 0.35 && Math.abs(dx) > 0.08;
      const isCheekZone = dy > 0.05 && dy < 0.3 && Math.abs(dx) > 0.15 && Math.abs(dx) < 0.45;

      if (isUnderEyeZone) {
        // Soft under-eye darkening (chronic sleep deprivation)
        const darkFactor = 1.0 - 0.22 * intensity;
        newR *= darkFactor;
        newG *= darkFactor;
        newB *= darkFactor * 1.02; // slight bluish/purple fatigue tint
      } else if (isCheekZone) {
        // Subtle gauntness / loss of subcutaneous facial volume
        const hollowFactor = 1.0 - 0.14 * intensity;
        newR *= hollowFactor;
        newG *= hollowFactor;
        newB *= hollowFactor;
      }

      // 4. Subtle skin dryness micro-texture (high frequency micro-contrast)
      if (stage >= 2 && distFromCenter < 0.4) {
        const noise = ((x ^ y) % 7 - 3) * 1.8 * intensity;
        newR = Math.min(255, Math.max(0, newR + noise));
        newG = Math.min(255, Math.max(0, newG + noise));
        newB = Math.min(255, Math.max(0, newB + noise));
      }

      data[i] = Math.min(255, Math.max(0, Math.round(newR)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(newG)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(newB)));
    }
  }

  /**
   * Applies positive, encouraging wellness and vitality enhancement:
   * - Vibrant, healthy skin tone
   * - Enhanced eye catchlight and clarity
   * - Warm natural complexion
   */
  private applyHealthyPathwayEffects(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    intensity: number
  ): void {
    const centerX = width * 0.5;
    const centerY = height * 0.45;
    const maxRadius = Math.max(width, height) * 0.5;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;

      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      const dx = (x - centerX) / maxRadius;
      const dy = (y - centerY) / maxRadius;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // 1. Subtle warm vitality boost (healthy blood circulation)
      const warmFactor = 1.0 + 0.08 * intensity;
      let newR = r * warmFactor + 4 * intensity;
      let newG = g * (1.0 + 0.04 * intensity) + 2 * intensity;
      let newB = b * (1.0 - 0.02 * intensity);

      // 2. Clarity & gentle radiance in facial focal region
      if (distFromCenter < 0.45) {
        // Gentle highlight enhancement
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 120) {
          const radiance = (luminance - 120) / 135 * 12 * intensity;
          newR += radiance;
          newG += radiance * 0.95;
          newB += radiance * 0.85;
        }
      }

      // 3. Eye catchlight boost
      const isEyeZone = Math.abs(dy + 0.06) < 0.08 && Math.abs(dx) < 0.32 && Math.abs(dx) > 0.09;
      if (isEyeZone) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 140) {
          // Sharpen spark/catchlight in eyes
          newR = Math.min(255, newR + 20 * intensity);
          newG = Math.min(255, newG + 20 * intensity);
          newB = Math.min(255, newB + 22 * intensity);
        }
      }

      data[i] = Math.min(255, Math.max(0, Math.round(newR)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(newG)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(newB)));
    }
  }

  release(): void {
    if (this.previousResultUrl) {
      imageCleanup.revokeBlobUrl(this.previousResultUrl);
      this.previousResultUrl = null;
    }
    this.isInitialized = false;
  }
}
