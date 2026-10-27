import { EngineInfo, FaceAnalysisResult, PhotoData, TransformationResult } from '../../types';
import { ServerGpuProvider } from './providers/serverGpuProvider';
import { MockAiProvider } from './providers/mockAiProvider';
import { CanvasProceduralEngine } from './canvasProceduralEngine';
import { ITransformationProvider, TransformationOptions } from './types';
import { imageCleanup } from '../imageCleanup';

class TransformationManager {
  private activeProvider: ITransformationProvider;
  private serverProvider: ServerGpuProvider;
  private mockProvider: MockAiProvider;
  private localCanvasProvider: CanvasProceduralEngine;
  private initialized = false;

  constructor() {
    this.serverProvider = new ServerGpuProvider();
    this.mockProvider = new MockAiProvider();
    this.localCanvasProvider = new CanvasProceduralEngine();

    // Default to ServerGpuProvider (quality-first architecture)
    this.activeProvider = this.serverProvider;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if private GPU server is online
    const isServerOnline = await this.serverProvider.initialize();

    if (isServerOnline) {
      this.activeProvider = this.serverProvider;
    } else {
      // If server is not running locally, initialize mock/offline provider for seamless local experience
      await this.mockProvider.initialize();
      this.activeProvider = this.mockProvider;
    }

    this.initialized = true;
  }

  setProvider(providerId: 'server-gpu' | 'mock-ai' | 'canvas-procedural'): void {
    if (providerId === 'server-gpu') {
      this.activeProvider = this.serverProvider;
    } else if (providerId === 'canvas-procedural') {
      this.activeProvider = this.localCanvasProvider as unknown as ITransformationProvider;
    } else {
      this.activeProvider = this.mockProvider;
    }
  }

  getActiveProvider(): ITransformationProvider {
    return this.activeProvider;
  }

  getEngineInfo(): EngineInfo {
    return this.activeProvider.getInfo();
  }

  async checkServerHealth(): Promise<boolean> {
    const online = await this.serverProvider.checkHealth();
    if (online && this.activeProvider.id !== 'server-gpu') {
      this.activeProvider = this.serverProvider;
    }
    return online;
  }

  async analyzeFace(source: HTMLImageElement | PhotoData): Promise<FaceAnalysisResult> {
    if (typeof this.activeProvider.analyzeFace === 'function') {
      return this.activeProvider.analyzeFace(source);
    }
    return {
      faceDetected: true,
      confidence: 0.9,
      aspectRatio: 1.0,
      isCentered: true,
      recommendations: [],
    };
  }

  cancelTransformation(): void {
    if (typeof this.activeProvider.cancelCurrentTransformation === 'function') {
      this.activeProvider.cancelCurrentTransformation();
    }
  }

  async process(photo: PhotoData, options: TransformationOptions): Promise<TransformationResult> {
    await this.initialize();
    return this.activeProvider.transform(photo, options);
  }

  releaseModelResources(): void {
    this.cancelTransformation();
    this.serverProvider.release();
    this.mockProvider.release();
    this.localCanvasProvider.release();
    this.initialized = false;
  }

  clearTemporaryImages(): void {
    imageCleanup.fullCleanup();
  }
}

export const transformationManager = new TransformationManager();
