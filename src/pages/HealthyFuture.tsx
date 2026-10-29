import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Sun,
  Shield,
  SplitSquareVertical,
  Activity,
  Award,
  UserCheck,
  Info,
  LifeBuoy,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';

export const HealthyFuture: React.FC = () => {
  const navigate = useNavigate();
  const {
    photo,
    healthyResult,
    isProcessing,
    processingProgress,
    error,
    processPathway,
    clearError,
  } = useApp();

  // User can view their authentic baseline, or optionally generate a simulated vitality enhancement
  const [viewMode, setViewMode] = useState<'authentic' | 'vitality_illustration'>('authentic');

  if (!photo) {
    navigate('/selfie');
    return null;
  }

  const handleGenerateVitalityIllustration = () => {
    setViewMode('vitality_illustration');
    if (!healthyResult) {
      processPathway('healthy', 1, 0.85);
    }
  };

  const displayedImage = viewMode === 'vitality_illustration' && healthyResult
    ? healthyResult.imageUrl
    : photo.blobUrl;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in relative">
      {/* Title & Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold tracking-wider shadow-glow-emerald/30 animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Positive Prevention &amp; Longevity Pathway</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          My Healthy Future
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Your authentic natural appearance represents the vitality, health, and potential that choosing life protects.
        </p>
      </div>

      {/* Slogan Spotlight Banner */}
      <div className="glass-panel text-center py-4 px-6 bg-gradient-to-r from-emerald-950/40 via-teal-950/60 to-emerald-950/40 rounded-3xl border border-emerald-500/30 shadow-glow-emerald/20">
        <p className="text-base sm:text-xl font-black tracking-wide text-emerald-300 uppercase">
          &ldquo;{APP_CONFIG.slogans.secondary}&rdquo;
        </p>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-lg mx-auto">
          Every positive choice today preserves your natural biological health, mental clarity, and future relationships.
        </p>
      </div>

      {/* Top Educational Disclaimer */}
      <EducationalDisclaimer compact />

      {/* Processing or Error View */}
      {isProcessing && (
        <LoadingState
          progress={processingProgress}
          message="Preparing your visualization…"
          subMessage="Applying subtle generative health and hydration conditioning."
        />
      )}

      {error && !isProcessing && (
        <ErrorState
          title="Processing Alert"
          message={error}
          onRetry={() => {
            clearError();
            processPathway('healthy', 1, 0.85);
          }}
        />
      )}

      {/* Main Content */}
      {!isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/60 bg-slate-950 shadow-glow-emerald/30 aspect-square group">
              <img
                src={displayedImage}
                alt="My Healthy Future"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Status Badge */}
              <div className="absolute top-3.5 left-3.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/50 text-xs font-semibold text-emerald-300 flex items-center gap-2 shadow-lg">
                {viewMode === 'authentic' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Authentic Baseline (Protected)</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Vitality Illustration</span>
                  </>
                )}
              </div>

              {viewMode === 'vitality_illustration' && healthyResult && (
                <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                  {healthyResult.isLiveGpuInference ? 'GPU SDXL' : 'Vitality Conditioning'} • {healthyResult.executionTimeMs}ms
                </div>
              )}
            </div>

            {/* View Mode Toggle Controls */}
            <div className="flex items-center justify-center p-1.5 rounded-2xl glass-panel border border-white/10 text-xs gap-1">
              <button
                type="button"
                onClick={() => setViewMode('authentic')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-semibold transition-all ${
                  viewMode === 'authentic'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Authentic Face (Recommended)
              </button>
              <button
                type="button"
                onClick={handleGenerateVitalityIllustration}
                className={`flex-1 py-2.5 px-3 rounded-xl font-semibold transition-all ${
                  viewMode === 'vitality_illustration'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Optional AI Vitality Preview
              </button>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <PrimaryButton
                size="md"
                variant="outline"
                onClick={() => navigate('/compare?pathway=healthy')}
                leftIcon={<SplitSquareVertical className="w-4 h-4 text-emerald-400" />}
                className="flex-1 border-white/20 hover:border-emerald-400/50"
              >
                Compare Before &amp; After
              </PrimaryButton>

              <PrimaryButton
                size="md"
                variant="secondary"
                onClick={() => navigate('/future-ice')}
                leftIcon={<Activity className="w-4 h-4 text-amber-400" />}
                className="flex-1 border-white/15 hover:border-amber-400/50"
              >
                Review Ice Pathway
              </PrimaryButton>
            </div>
          </div>

          {/* Right Column: Protective Factors & Positive Messaging */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>What Choosing Health Protects</span>
              </h3>

              {APP_CONFIG.healthyAspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="glass-panel-hover rounded-2xl border border-white/10 p-4 space-y-1.5 transition-all hover:scale-[1.01] hover:border-emerald-500/40"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    {idx === 0 ? <Sun className="w-4 h-4" /> : idx === 1 ? <Heart className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    <span>{aspect.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aspect.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="glass-panel rounded-2xl border border-emerald-500/30 p-4 space-y-1.5 text-xs text-slate-300 bg-emerald-950/20 shadow-glow-emerald/10">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Info className="w-4 h-4" />
                <span>Respectful Representation Policy</span>
              </div>
              <p className="leading-relaxed">
                NEO does not claim that AI can predict clinical recovery or guarantee specific medical outcomes. Your natural face today represents the health, dignity, and opportunities you protect by choosing life.
              </p>
            </div>

            {/* AAIC Support Card */}
            <div className="glass-panel-hover rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <LifeBuoy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Support &amp; Community Help</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Connect with the Australian Anti Ice Campaign or 24/7 national helplines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/help')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shadow-glow-cyan/20 transition-all hover:scale-105"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slogan Footer */}
      <div className="text-center pt-4">
        <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">
          {APP_CONFIG.slogans.primary} • {APP_CONFIG.slogans.secondary}
        </p>
      </div>
    </div>
  );
};
