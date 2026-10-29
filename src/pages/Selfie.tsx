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
  ShieldCheck,
  Scan,
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
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in relative">
      {/* Title & Stage Eyebrow */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold uppercase tracking-widest shadow-glow-cyan/20">
          <Scan className="w-3.5 h-3.5 animate-pulse" />
          <span>Step 01 / Image Selection</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
          Select or Capture Your Photo
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-normal leading-relaxed">
          Select a clear, front-facing portrait with natural lighting. Your photo should be processed locally when local mode is active. Check the current mode before continuing.
        </p>
      </div>

      {/* Main Terminal Frame */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sky-400/50 pointer-events-none rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-400/50 pointer-events-none rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sky-400/50 pointer-events-none rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sky-400/50 pointer-events-none rounded-br-2xl" />

        {/* If Photo is Selected -> High-Tech Viewfinder & Actions */}
        {photo ? (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs uppercase font-mono text-emerald-400 tracking-wider font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Photo Ready for Local Exploration
              </span>
              <p className="text-xs text-slate-400 font-mono">
                Source: {photo.source === 'camera' ? 'Camera Capture' : photo.source === 'sample' ? 'Illustrative Demo Avatar' : 'Device Photo'} ({photo.width}×{photo.height}px) • In-Memory Only
              </p>
            </div>

            {/* High-Tech Hologram Portrait Frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-3xl overflow-hidden border-2 border-sky-400/40 shadow-glow-cyan/30 bg-black group">
              <img
                src={photo.blobUrl}
                alt="Selected baseline photo"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Viewfinder Reticle Overlays */}
              <div className="absolute inset-3 border border-white/20 rounded-2xl pointer-events-none" />
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-sky-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-sky-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-sky-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-sky-400 pointer-events-none" />

              {/* Laser scan line overlay */}
              <div className="scan-laser opacity-40 group-hover:opacity-80 transition-opacity" />

              {/* Ephemeral Security Badge */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 pointer-events-none">
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>SECURE_SANDBOX</span>
                </span>
                <span>VOLATILE_RAM</span>
              </div>

              {/* Delete / Remove Photo Button */}
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/75 hover:bg-red-600/90 text-white transition-all backdrop-blur-md shadow-lg border border-white/20 hover:scale-105"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Next Pathway Options (Dual Cyber Cards) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <PrimaryButton
                size="lg"
                variant="primary"
                onClick={() => navigate('/future-ice')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-7 shadow-glow-amber/40 border-amber-500/40"
              >
                Explore &ldquo;My Future with Ice&rdquo;
              </PrimaryButton>

              <PrimaryButton
                size="lg"
                variant="outline"
                onClick={() => navigate('/healthy-future')}
                leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}
                className="w-full sm:w-auto px-7 border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-950/40 shadow-glow-emerald/20"
              >
                Explore &ldquo;My Healthy Future&rdquo;
              </PrimaryButton>
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={removePhoto}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors underline underline-offset-4 font-mono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Choose a different photo or avatar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selection Options Tabs (Upload / Camera / Sample) */
          <div className="space-y-6">
            {/* High-Tech Tab Bar */}
            <div className="flex items-center justify-center p-1.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                aria-label="Upload Photo"
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-950 shadow-glow-cyan/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-950 shadow-glow-cyan/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Use camera</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'sample'
                    ? 'bg-white text-slate-950 shadow-glow-cyan/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Demo avatars</span>
              </button>
            </div>

            {/* Tab 1: Upload Zone with Cyber Reticles */}
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
                  className="relative w-full border-2 border-dashed border-white/20 hover:border-sky-400/80 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer bg-gradient-to-b from-white/[0.02] to-sky-950/10 hover:from-sky-950/20 hover:to-sky-900/20 transition-all text-center group shadow-xl overflow-hidden"
                >
                  <div className="scan-laser opacity-0 group-hover:opacity-40 transition-opacity" />

                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-sky-400/50 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:shadow-glow-cyan/30 transition-all">
                    <Upload className="w-7 h-7 text-sky-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                      Choose a photo
                    </span>
                    <p className="text-xs text-slate-400 font-mono">
                      JPEG, PNG, or WebP • Up to 15 MB
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Front-facing portrait with natural lighting</span>
                  </div>
                </label>
              </div>
            )}

            {/* Tab 2: Camera Launch Terminal */}
            {activeTab === 'camera' && (
              <div className="p-10 text-center space-y-5 border border-white/10 rounded-3xl bg-white/[0.01] glass-panel relative overflow-hidden">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-950/50 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-glow-cyan/20 animate-pulse-slow">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h2 className="text-lg font-bold text-white tracking-tight">Live Camera Capture</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click below to open the on-device camera viewfinder. We never store or upload captured stream data.
                  </p>
                </div>
                <PrimaryButton
                  variant="primary"
                  onClick={() => setShowCameraModal(true)}
                  leftIcon={<Camera className="w-4 h-4" />}
                  className="px-6 shadow-glow-cyan"
                >
                  Use camera
                </PrimaryButton>
              </div>
            )}

            {/* Tab 3: Demo Avatars (Youth Models) */}
            {activeTab === 'sample' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold text-white tracking-tight">Select a Youth Demo Avatar</h2>
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
                      className="group rounded-2xl glass-panel border border-white/10 hover:border-sky-400/60 p-5 flex flex-col items-center gap-3.5 transition-all text-center focus:outline-none focus:ring-2 focus:ring-sky-500 hover:scale-[1.03] hover:shadow-glow-cyan/20 relative overflow-hidden"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-sky-400 group-hover:shadow-glow-cyan transition-all">
                        <img
                          src={avatar.previewUrl}
                          alt={avatar.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                          {avatar.name}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">{avatar.ageGroup}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/30">
                        Select Model
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="rounded-2xl bg-red-950/30 border border-red-500/40 p-4 flex items-start gap-3 text-red-200 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold text-red-300">We couldn&apos;t process this image. Try another photo.</strong>
                  <p className="text-slate-300 text-xs">{validationError}</p>
                </div>
              </div>
            )}

            {isProcessingFile && (
              <div className="text-center text-xs text-sky-400 font-mono animate-pulse">
                Validating image format and dimensions...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 flex items-center justify-center gap-2.5 text-xs text-slate-400 text-center font-mono">
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
