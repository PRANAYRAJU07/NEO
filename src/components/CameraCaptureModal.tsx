import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { imageCleanup } from '../services/imageCleanup';
import { validateImageFile } from '../services/imageValidation';
import { PhotoData } from '../types';

interface CameraCaptureModalProps {
  onCapture: (photo: PhotoData) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    stopTracks();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera access is not supported by this browser. Please upload a photo instead.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      imageCleanup.registerStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
      const isDenied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      if (isDenied) {
        setErrorMessage('Camera permission was denied. You can still upload a photo from your device or use a demo avatar.');
      } else {
        setErrorMessage('Unable to initialize camera. Another application may be using it, or permissions are disabled.');
      }
    }
  }, [stopTracks]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopTracks();
    };
  }, [facingMode, startCamera, stopTracks]);

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      // If front camera, mirror image for natural selfie feel
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to capture frame'))), 'image/jpeg', 0.92);
      });

      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const validation = await validateImageFile(file);

      if (!validation.valid) {
        setErrorMessage(validation.error?.message || 'Invalid photo capture');
        setIsCapturing(false);
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      imageCleanup.registerBlobUrl(blobUrl);

      stopTracks();

      onCapture({
        id: `camera-${Date.now()}`,
        blobUrl,
        file,
        width,
        height,
        aspectRatio: width / height,
        source: 'camera',
        timestamp: Date.now(),
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to capture photo');
      setIsCapturing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <Camera className="w-5 h-5 text-sky-400" />
            <h2 id="camera-modal-title" className="text-base">Take Selfie</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
          {hasPermission === false ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-200">Camera Unavailable</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Permission</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Face Guide Silhouette */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]" />
              </div>

              {/* Live Status Tag */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/80 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Local Viewfinder</span>
              </div>
            </>
          )}
        </div>

        {/* Camera Controls */}
        <div className="w-full pt-4 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={hasPermission !== true}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            title="Switch front/back camera"
            aria-label="Switch camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            disabled={hasPermission !== true || isCapturing}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 p-1 shadow-lg shadow-sky-600/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
            aria-label="Capture snapshot"
          >
            <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Cancel"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 text-center">
          Photos are processed exclusively in your device’s memory and are never uploaded.
        </p>
      </div>
    </div>
  );
};
