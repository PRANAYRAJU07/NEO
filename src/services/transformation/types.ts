import { EngineInfo, TransformationPathway, TransformationResult, TransformationStage } from '../../types';

export interface TransformationOptions {
  pathway: TransformationPathway;
  intensity: number; // 0.0 to 1.0
  stage?: TransformationStage;
}

export interface ITransformationEngine {
  readonly id: string;
  readonly name: string;
  initialize(): Promise<boolean>;
  transform(
    imageSource: HTMLImageElement | ImageBitmap,
    options: TransformationOptions
  ): Promise<TransformationResult>;
  release(): void;
  getInfo(): EngineInfo;
}
