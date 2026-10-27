export type PhotoSource = 'camera' | 'upload' | 'sample';

export interface PhotoData {
  id: string;
  blobUrl: string;
  file?: File;
  width: number;
  height: number;
  aspectRatio: number;
  source: PhotoSource;
  sampleId?: string;
  timestamp: number;
}

export type TransformationPathway = 'ice' | 'healthy';
export type TransformationStage = 1 | 2 | 3;

export type EngineType = 'canvas-procedural' | 'onnx-runtime' | 'fallback-prototype';

export interface EngineInfo {
  type: EngineType;
  name: string;
  version: string;
  isLocalOnly: boolean;
  modelLoaded: boolean;
  description: string;
  provenance: string;
  hardwareAcceleration?: string;
}

export interface TransformationResult {
  imageUrl: string;
  pathway: TransformationPathway;
  intensity: number;
  stage?: TransformationStage;
  executionTimeMs: number;
  engineUsed: EngineType;
  timestamp: number;
}

export interface ConsentState {
  agreedToPrivacy: boolean;
  acknowledgedEducationalOnly: boolean;
  confirmedAgeAppropriate: boolean;
  timestamp?: number;
}

export interface SampleAvatar {
  id: string;
  name: string;
  genderDescription: string;
  ageGroup: string;
  previewUrl: string;
  description: string;
}

export interface AAICSupportContact {
  id: string;
  name: string;
  phone: string;
  website: string;
  description: string;
  operatingHours: string;
  category: 'campaign' | 'youth' | 'crisis' | 'addiction';
  isVerified: boolean;
  verificationNotes?: string;
  tollFree?: boolean;
}

export interface ImageValidationError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'DIMENSIONS_TOO_SMALL' | 'DIMENSIONS_TOO_LARGE' | 'DECODE_FAILED' | 'EMPTY_FILE';
  message: string;
  details?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: ImageValidationError;
  dimensions?: { width: number; height: number };
}
