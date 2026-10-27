import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ConsentState,
  PhotoData,
  TransformationPathway,
  TransformationResult,
  TransformationStage,
  EngineInfo,
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
  iceResult: TransformationResult | null;
  healthyResult: TransformationResult | null;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  clearError: () => void;
  engineInfo: EngineInfo;
  processPathway: (pathway: TransformationPathway, stage?: TransformationStage, intensity?: number) => Promise<TransformationResult | null>;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [photo, setPhotoState] = useState<PhotoData | null>(null);
  const [currentStage, setStage] = useState<TransformationStage>(1);
  const [intensity, setIntensity] = useState<number>(0.85);

  const [iceResult, setIceResult] = useState<TransformationResult | null>(null);
  const [healthyResult, setHealthyResult] = useState<TransformationResult | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [engineInfo, setEngineInfo] = useState<EngineInfo>(() => transformationManager.getEngineInfo());

  // Initialize engine on startup
  useEffect(() => {
    transformationManager.initialize().then(() => {
      setEngineInfo(transformationManager.getEngineInfo());
    });
  }, []);

  const setConsent = useCallback((newConsent: ConsentState) => {
    setConsentState(newConsent);
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
  }, [photo]);

  const removePhoto = useCallback(() => {
    if (photo && !photo.sampleId) {
      imageCleanup.revokeBlobUrl(photo.blobUrl);
    }
    setPhotoState(null);
    setIceResult(null);
    setHealthyResult(null);
  }, [photo]);

  const clearError = useCallback(() => setError(null), []);

  const processPathway = useCallback(
    async (
      pathway: TransformationPathway,
      stage: TransformationStage = currentStage,
      level: number = intensity
    ): Promise<TransformationResult | null> => {
      if (!photo) {
        setError('No photo selected. Please choose or capture a photo first.');
        return null;
      }

      setIsProcessing(true);
      setProcessingProgress(15);
      setError(null);

      try {
        // Simulate smooth progress for accessible user feedback
        const progressTimer = setInterval(() => {
          setProcessingProgress((prev) => (prev < 85 ? prev + 15 : prev));
        }, 80);

        const result = await transformationManager.process(photo, {
          pathway,
          intensity: level,
          stage,
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
        setError(message);
        return null;
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
        }, 200);
      }
    },
    [photo, currentStage, intensity]
  );

  const resetAll = useCallback(() => {
    imageCleanup.fullCleanup();
    transformationManager.release();
    setPhotoState(null);
    setConsentState(null);
    setIceResult(null);
    setHealthyResult(null);
    setError(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setStage(1);
    setIntensity(0.85);
    setEngineInfo(transformationManager.getEngineInfo());
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
        iceResult,
        healthyResult,
        isProcessing,
        processingProgress,
        error,
        clearError,
        engineInfo,
        processPathway,
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
