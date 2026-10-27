import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ConsentState,
  PhotoData,
  TransformationPathway,
  TransformationResult,
  TransformationStage,
  EngineInfo,
  FaceAnalysisResult,
} from '../types';
import { transformationManager } from '../services/transformation/transformationManager';
import { imageCleanup } from '../services/imageCleanup';

interface AppContextType {
  consent: ConsentState | null;
  setConsent: (consent: ConsentState) => void;
  photo: PhotoData | null;
  setPhoto: (photo: PhotoData) => void;
  removePhoto: () => void;
  currentStage: TransformationStage;
  setStage: (stage: TransformationStage) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  generationSeed?: number;
  setGenerationSeed: (seed?: number) => void;
  iceResult: TransformationResult | null;
  healthyResult: TransformationResult | null;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  clearError: () => void;
  engineInfo: EngineInfo;
  activeProviderId: string;
  setProviderId: (id: 'server-gpu' | 'mock-ai' | 'canvas-procedural') => void;
  faceAnalysis: FaceAnalysisResult | null;
  processPathway: (
    pathway: TransformationPathway,
    stage?: TransformationStage,
    intensity?: number,
    seed?: number
  ) => Promise<TransformationResult | null>;
  cancelTransformation: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [photo, setPhotoState] = useState<PhotoData | null>(null);
  const [currentStage, setStage] = useState<TransformationStage>(1);
  const [intensity, setIntensity] = useState<number>(0.85);
  const [generationSeed, setGenerationSeed] = useState<number | undefined>(undefined);
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisResult | null>(null);

  const [iceResult, setIceResult] = useState<TransformationResult | null>(null);
  const [healthyResult, setHealthyResult] = useState<TransformationResult | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [engineInfo, setEngineInfo] = useState<EngineInfo>(() => transformationManager.getEngineInfo());
  const [activeProviderId, setActiveProviderIdState] = useState<string>(() => transformationManager.getActiveProvider().id);

  // Initialize engine & provider on startup
  useEffect(() => {
    transformationManager.initialize().then(() => {
      setEngineInfo(transformationManager.getEngineInfo());
      setActiveProviderIdState(transformationManager.getActiveProvider().id);
    });
  }, []);

  const setConsent = useCallback((newConsent: ConsentState) => {
    setConsentState(newConsent);
  }, []);

  const setProviderId = useCallback((id: 'server-gpu' | 'mock-ai' | 'canvas-procedural') => {
    transformationManager.setProvider(id);
    setActiveProviderIdState(id);
    setEngineInfo(transformationManager.getEngineInfo());
  }, []);

  const setPhoto = useCallback((newPhoto: PhotoData) => {
    // Revoke previous photo blob if it changed
    if (photo && photo.blobUrl !== newPhoto.blobUrl && !photo.sampleId) {
      imageCleanup.revokeBlobUrl(photo.blobUrl);
    }
    setPhotoState(newPhoto);
    setIceResult(null);
    setHealthyResult(null);
    setError(null);

    // Trigger face analysis in background
    transformationManager.analyzeFace(newPhoto).then((analysis) => {
      setFaceAnalysis(analysis);
    }).catch(() => {
      setFaceAnalysis(null);
    });
  }, [photo]);

  const removePhoto = useCallback(() => {
    if (photo && !photo.sampleId) {
      imageCleanup.revokeBlobUrl(photo.blobUrl);
    }
    setPhotoState(null);
    setIceResult(null);
    setHealthyResult(null);
    setFaceAnalysis(null);
  }, [photo]);

  const clearError = useCallback(() => setError(null), []);

  const cancelTransformation = useCallback(() => {
    transformationManager.cancelTransformation();
    setIsProcessing(false);
    setProcessingProgress(0);
  }, []);

  const processPathway = useCallback(
    async (
      pathway: TransformationPathway,
      stage: TransformationStage = currentStage,
      level: number = intensity,
      seed: number | undefined = generationSeed
    ): Promise<TransformationResult | null> => {
      if (!photo) {
        setError('No photo selected. Please choose or capture a photo first.');
        return null;
      }

      setIsProcessing(true);
      setProcessingProgress(20);
      setError(null);

      try {
        // Progress simulation for user feedback
        const progressTimer = setInterval(() => {
          setProcessingProgress((prev) => (prev < 85 ? prev + 15 : prev));
        }, 120);

        const result = await transformationManager.process(photo, {
          pathway,
          intensity: level,
          stage,
          seed,
        });

        clearInterval(progressTimer);
        setProcessingProgress(100);

        if (pathway === 'ice') {
          setIceResult(result);
        } else {
          setHealthyResult(result);
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transformation processing error';
        if (!message.includes('cancelled')) {
          setError(message);
        }
        return null;
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
        }, 200);
      }
    },
    [photo, currentStage, intensity, generationSeed]
  );

  const resetAll = useCallback(() => {
    transformationManager.releaseModelResources();
    imageCleanup.fullCleanup();
    setPhotoState(null);
    setConsentState(null);
    setIceResult(null);
    setHealthyResult(null);
    setFaceAnalysis(null);
    setError(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setStage(1);
    setIntensity(0.85);
    setGenerationSeed(undefined);
    setEngineInfo(transformationManager.getEngineInfo());
    setActiveProviderIdState(transformationManager.getActiveProvider().id);
  }, []);

  return (
    <AppContext.Provider
      value={{
        consent,
        setConsent,
        photo,
        setPhoto,
        removePhoto,
        currentStage,
        setStage,
        intensity,
        setIntensity,
        generationSeed,
        setGenerationSeed,
        iceResult,
        healthyResult,
        isProcessing,
        processingProgress,
        error,
        clearError,
        engineInfo,
        activeProviderId,
        setProviderId,
        faceAnalysis,
        processPathway,
        cancelTransformation,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
