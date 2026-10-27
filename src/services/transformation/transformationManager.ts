import { EngineInfo, PhotoData, TransformationResult } from '../../types';
import { onnxEngine } from './onnxModelLoader';
import { TransformationOptions } from './types';

class TransformationManager {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await onnxEngine.initialize();
    this.initialized = true;
  }

  getEngineInfo(): EngineInfo {
    return onnxEngine.getInfo();
  }

  /**
   * Transforms a PhotoData instance according to chosen options (pathway, intensity, stage).
   * Loads image element locally, passes to engine, returns transformation result.
   */
  async process(photo: PhotoData, options: TransformationOptions): Promise<TransformationResult> {
    await this.initialize();

    // Load source photo into offscreen image element
    const img = await this.loadImage(photo.blobUrl);

    try {
      const result = await onnxEngine.transform(img, options);
      return result;
    } finally {
      // Clean up image reference
      img.src = '';
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`Failed to load image for transformation: ${e}`));
      img.src = src;
    });
  }

  release(): void {
    onnxEngine.release();
    this.initialized = false;
  }
}

export const transformationManager = new TransformationManager();
