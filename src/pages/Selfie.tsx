import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera,
  Upload,
  UserCheck,
  Trash2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { useApp } from '../app/AppContext';
import { validateImageFile } from '../services/imageValidation';
import { imageCleanup } from '../services/imageCleanup';
import { SAMPLE_AVATARS } from '../config/sampleAvatars';
import { PhotoData } from '../types';

export const Selfie: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { photo, setPhoto, removePhoto } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If query param ?mode=sample is present, default to sample avatar tab
  useEffect(() => {
    if (searchParams.get('mode') === 'sample') {
      setActiveTab('sample');
    }
  }, [searchParams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setValidationError(null);

    const validation = await validateImageFile(file);

    if (!validation.valid) {
      setValidationError(validation.error?.message || 'Invalid image file.');
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    imageCleanup.registerBlobUrl(blobUrl);

    const width = validation.dimensions?.width || 600;
    const height = validation.dimensions?.height || 600;

    setPhoto({
      id: `file-${Date.now()}`,
      blobUrl,
      file,
      width,
      height,
      aspectRatio: width / height,
      source: 'upload',
      timestamp: Date.now(),
    });

    setIsProcessingFile(false);
  };

  const handleSelectSample = (sampleId: string) => {
    const avatar = SAMPLE_AVATARS.find((a) => a.id === sampleId);
    if (!avatar) return;

    setValidationError(null);
    setPhoto({
      id: avatar.id,
      blobUrl: avatar.previewUrl,
      width: 400,
      height: 400,
      aspectRatio: 1,
      source: 'sample',
      sampleId: avatar.id,
      timestamp: Date.now(),
    });
  };

  const handleCameraCapture = (capturedPhoto: PhotoData) => {
    setShowCameraModal(false);
    setPhoto(capturedPhoto);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Step 01 / Image Selection
        </span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
          Select or Capture Your Photo
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto font-normal leading-relaxed">
          Select a clear, front-facing portrait with natural lighting. Your photo should be processed locally when local mode is active. Check the current mode before continuing.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* If Photo is Selected -> Show Preview & Actions */}
        {photo ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                Photo Ready for Local Exploration
              </span>
              <p className="text-xs text-slate-500 font-mono">
                Source: {photo.source === 'camera' ? 'Camera Capture' : photo.source === 'sample' ? 'Illustrative Demo Avatar' : 'Device Photo'} ({photo.width}×{photo.height}px)
              </p>
            </div>

            {/* Preview image */}
            <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-black">
              <img
                src={photo.blobUrl}
                alt="Selected baseline photo"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-red-600 text-white transition-colors backdrop-blur-md shadow-lg"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Next Pathway Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <PrimaryButton
                size="lg"
                variant="primary"
                onClick={() => navigate('/future-ice')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-6"
              >
                Explore &ldquo;My Future with Ice&rdquo;
              </PrimaryButton>

              <PrimaryButton
                size="lg"
                variant="outline"
                onClick={() => navigate('/healthy-future')}
                leftIcon={<Sparkles className="w-4 h-4 text-sky-400" />}
                className="w-full sm:w-auto px-6 border-white/20 text-slate-200 hover:text-white hover:border-white/40"
              >
                Explore &ldquo;My Healthy Future&rdquo;
              </PrimaryButton>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={removePhoto}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors underline underline-offset-4"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Choose a different photo or avatar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selection Options Tabs (Upload / Camera / Sample) */
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center justify-center p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                aria-label="Upload Photo"
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Choose a photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setShowCameraModal(true);
                }}
                aria-label="Take Selfie"
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Use camera</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'sample'
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Demo avatars</span>
              </button>
            </div>

            {/* Tab 1: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="selfie-file-input"
                  aria-label="Upload photo"
                />

                <label
                  htmlFor="selfie-file-input"
                  className="w-full border border-dashed border-white/20 hover:border-sky-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-slate-200">
                      Choose a photo
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      JPEG, PNG, or WebP • Up to 15 MB
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Front-facing portrait with natural lighting
                  </span>
                </label>
              </div>
            )}

            {/* Tab 2: Camera Launch trigger */}
            {activeTab === 'camera' && (
              <div className="p-8 text-center space-y-4 border border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-sky-400">
                  <Camera className="w-6 h-6" />
                </div>
                <h2 className="text-base font-medium text-white">Live Camera Capture</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click below to open the on-device camera viewfinder. We never store or upload captured stream data.
                </p>
                <PrimaryButton
                  variant="primary"
                  onClick={() => setShowCameraModal(true)}
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Use camera
                </PrimaryButton>
              </div>
            )}

            {/* Tab 3: Demo Avatars */}
            {activeTab === 'sample' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold text-white">Select a Youth Demo Avatar</h2>
                  <p className="text-xs text-slate-400">
                    Experience the complete educational journey without using your personal photograph.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {SAMPLE_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectSample(avatar.id)}
                      className="group rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500 p-4 flex flex-col items-center gap-3 transition-all text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-sky-400 transition-colors">
                        <img
                          src={avatar.previewUrl}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white group-hover:text-sky-300">
                          {avatar.name}
                        </span>
                        <p className="text-[11px] text-slate-400">{avatar.ageGroup}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="rounded-xl bg-red-950/20 border border-red-500/30 p-4 flex items-start gap-3 text-red-200 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold text-red-300">We couldn&apos;t process this image. Try another photo.</strong>
                  <p className="text-slate-300 text-xs">{validationError}</p>
                </div>
              </div>
            )}

            {isProcessingFile && (
              <div className="text-center text-xs text-slate-400 animate-pulse">
                Validating image format and dimensions...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>Selfies are strictly processed inside your browser sandbox. No photo upload ever takes place.</span>
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};
