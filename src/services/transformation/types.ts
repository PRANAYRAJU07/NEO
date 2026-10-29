import {
  EngineInfo,
  FaceAnalysisResult,
  PhotoData,
  TransformationPathway,
  TransformationResult,
  TransformationStage,
} from '../../types';

export interface TransformationOptions {
  pathway: TransformationPathway;
  intensity: number; // 0.0 to 1.0
  stage?: TransformationStage;
  seed?: number;
  preserveIdentity?: boolean;
  abortSignal?: AbortSignal;
  onProgress?: (progressPct: number, milestone: string) => void;
}

export interface StagePromptProfile {
  stage: TransformationStage;
  label: string;
  period: string;
  prompt: string;
  baseStrength: number;
  guidanceScale: number;
  numInferenceSteps: number;
  description: string;
}

export interface ITransformationEngine {
  readonly id: string;
  readonly name: string;
  initialize(): Promise<boolean>;
  transform(
    image: HTMLImageElement | ImageBitmap | PhotoData,
    options: TransformationOptions
  ): Promise<TransformationResult>;
  release(): void;
  getInfo(): EngineInfo;
}

export interface ITransformationProvider extends ITransformationEngine {
  analyzeFace(image: HTMLImageElement | PhotoData): Promise<FaceAnalysisResult>;
  cancelCurrentTransformation?(): void;
  checkHealth(): Promise<boolean>;
}
