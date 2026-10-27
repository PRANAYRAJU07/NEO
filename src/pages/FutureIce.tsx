import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Sliders,
  SplitSquareVertical,
  Dices,
  Cpu,
  Info,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';
import { TransformationStage } from '../types';
import { calculateEffectiveStrength, STAGE_PROFILES } from '../services/transformation/promptProfiles';

export const FutureIce: React.FC = () => {
  const navigate = useNavigate();
  const {
    photo,
    iceResult,
    isProcessing,
    processingProgress,
    error,
    currentStage,
    setStage,
    intensity,
    setIntensity,
    generationSeed,
    setGenerationSeed,
    engineInfo,
    activeProviderId,
    setProviderId,
    processPathway,
    cancelTransformation,
    clearError,
  } = useApp();

  const [sliderVal, setSliderVal] = useState<number>(intensity);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredInitialRef = useRef(false);

  // Sync sliderVal with global intensity
  useEffect(() => {
    setSliderVal(intensity);
  }, [intensity]);

  // Reset initial trigger flag if photo changes
  useEffect(() => {
    hasTriggeredInitialRef.current = false;
  }, [photo?.blobUrl]);

  // If no photo is selected, prompt user to pick one
  useEffect(() => {
    if (!photo) {
      navigate('/selfie');
      return;
    }

    // Automatically trigger initial generation if not present, not processing, and no unhandled error
    if (!iceResult && !isProcessing && !error && !hasTriggeredInitialRef.current) {
      hasTriggeredInitialRef.current = true;
      processPathway('ice', currentStage, intensity, generationSeed);
    }
  }, [photo, iceResult, isProcessing, error, currentStage, intensity, generationSeed, navigate, processPathway]);

  const handleStageChange = (stage: TransformationStage) => {
    setStage(stage);
    clearError();
    processPathway('ice', stage, sliderVal, generationSeed);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderVal(val);

    // Debounce regeneration
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setIntensity(val);
      clearError();
      processPathway('ice', currentStage, val, generationSeed);
    }, 400);
  };

  const handleRerollSeed = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setGenerationSeed(newSeed);
    clearError();
    processPathway('ice', currentStage, sliderVal, newSeed);
  };

  const handleProviderToggle = () => {
    const nextProvider = activeProviderId === 'server-gpu' ? 'mock-ai' : 'server-gpu';
    setProviderId(nextProvider);
    clearError();
    hasTriggeredInitialRef.current = false;
    processPathway('ice', currentStage, sliderVal, generationSeed);
  };

  if (!photo) return null;

  const currentStageMeta = APP_CONFIG.stages.find((s) => s.stage === currentStage) || APP_CONFIG.stages[0]!;
  const effectiveStrength = calculateEffectiveStrength('ice', currentStage, sliderVal);
  const activeProfile = STAGE_PROFILES.ice[currentStage] || STAGE_PROFILES.ice[1]!;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Title & Campaign Ribbon */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Generative AI Substance Toll Simulation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Future with Ice (Simulated)
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Stage-conditioned generative AI illustration demonstrating the cumulative physical toll of crystal methamphetamine over time, while strictly preserving your facial geometry.
        </p>
      </div>

      {/* Top Educational Disclaimer */}
      <EducationalDisclaimer compact />

      {/* Provider & Hardware Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-semibold text-white">AI Provider:</span>
          <span className="font-mono text-sky-300">{engineInfo.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            {engineInfo.isLocalOnly ? 'Local Simulation' : 'Private GPU'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleProviderToggle}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2"
            title="Toggle between Private GPU Server and Offline Test Provider"
          >
            Switch to {activeProviderId === 'server-gpu' ? 'Offline Provider' : 'GPU Server'}
          </button>
        </div>
      </div>

      {/* Processing or Error View */}
      {isProcessing && (
        <div className="space-y-4">
          <LoadingState
            progress={processingProgress}
            message="Running Generative AI Image-to-Image Inference..."
            subMessage={`Conditioning: ${activeProfile.label} • Denoising Strength: ${effectiveStrength} • SDXL Pipeline`}
            privacyBadge={
              activeProviderId === 'server-gpu'
                ? 'Zero Persistent Storage • Private Ephemeral In-Memory Inference'
                : 'Zero Network Egress • Offline On-Device Simulation'
            }
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={cancelTransformation}
              className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4"
            >
              Cancel Generation
            </button>
          </div>
        </div>
      )}

      {error && !isProcessing && (
        <div className="space-y-4">
          <ErrorState
            title="Inference Notice"
            message={error}
            onRetry={() => {
              clearError();
              hasTriggeredInitialRef.current = false;
              processPathway('ice', currentStage, sliderVal, generationSeed);
            }}
          />
          {activeProviderId === 'server-gpu' && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setProviderId('mock-ai');
                  clearError();
                  hasTriggeredInitialRef.current = false;
                  processPathway('ice', currentStage, sliderVal, generationSeed);
                }}
                className="px-4 py-2 rounded-xl bg-sky-950/80 border border-sky-700/60 text-xs font-semibold text-sky-300 hover:bg-sky-900 transition-colors shadow-lg"
              >
                Switch to Offline Simulation Provider & Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content when Result is Ready */}
      {!isProcessing && iceResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl aspect-square">
              <img
                src={iceResult.imageUrl}
                alt="Simulated outcome: My Future with Ice"
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{currentStageMeta.label}</span>
              </div>

              {/* Technical Model Metadata */}
              <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                <span>{iceResult.isLiveGpuInference ? 'GPU' : 'API Standby'}</span>
                <span>•</span>
                <span>Strength {iceResult.effectiveStrength ?? effectiveStrength}</span>
                <span>•</span>
                <span>{iceResult.executionTimeMs}ms</span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <PrimaryButton
                size="md"
                variant="outline"
                onClick={() => navigate('/compare?pathway=ice')}
                leftIcon={<SplitSquareVertical className="w-4 h-4 text-sky-400" />}
                className="flex-1"
              >
                Compare Before & After
              </PrimaryButton>

              <PrimaryButton
                size="md"
                variant="healthy"
                onClick={() => navigate('/healthy-future')}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="flex-1"
              >
                My Healthy Future
              </PrimaryButton>
            </div>
          </div>

          {/* Right Column: Stage Controls & Model Parameters */}
          <div className="lg:col-span-6 space-y-6">
            {/* Stage Selector */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Timeline Scenario</span>
                </h3>
                <span className="text-xs text-slate-500">Non-Predictive Scenario</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {APP_CONFIG.stages.map((stg) => {
                  const isActive = currentStage === stg.stage;
                  return (
                    <button
                      key={stg.stage}
                      type="button"
                      onClick={() => handleStageChange(stg.stage)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold">Stage {stg.stage}</span>
                      <span className="block text-[11px] opacity-75 mt-0.5">{stg.period}</span>
                    </button>
                  );
                })}
              </div>

              {/* Denoising Strength / Intensity Slider */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>Transformation Intensity</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Denoising Strength: {effectiveStrength})
                    </span>
                  </span>
                  <span className="font-mono text-amber-400">{Math.round(sliderVal * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={sliderVal}
                  onChange={handleSliderChange}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                  aria-label="Generative transformation intensity"
                />
                <p className="text-[11px] text-slate-500">
                  Intensity modulates SDXL latent denoising (0.18 – 0.60), altering skin texture without destroying identity.
                </p>
              </div>

              {/* Seed / Re-roll Control */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono">
                  Seed: <span className="text-slate-200">{iceResult.seed || 'Random'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRerollSeed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Re-roll Seed</span>
                </button>
              </div>
            </div>

            {/* Stage Educational Explanation Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Documented Educational Indicators
                </span>
                <span className="text-xs text-slate-500 font-medium">{currentStageMeta.period}</span>
              </div>
              <h2 className="text-base font-bold text-white">{currentStageMeta.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStageMeta.description}
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  All transformations are fictional educational illustrations generated via controlled prompt conditioning.
                </span>
              </div>
            </div>

            {/* Support Link */}
            <div className="rounded-2xl bg-sky-950/30 border border-sky-800/40 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-sky-300">Need to Talk to Someone?</h4>
                <p className="text-[11px] text-slate-400">
                  Free, confidential 24/7 support is available across Australia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/help')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold whitespace-nowrap shadow-sm"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slogan & Ethics Footer */}
      <div className="text-center space-y-2 pt-4">
        <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
          {APP_CONFIG.slogans.primary} • {APP_CONFIG.slogans.secondary}
        </p>
      </div>
    </div>
  );
};
