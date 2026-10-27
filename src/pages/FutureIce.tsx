import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  SplitSquareVertical,
  Cpu,
  Info,
  TrendingUp,
  AlertCircle,
  Frown,
  ChevronLeft,
  ChevronRight,
  Dices,
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
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 to 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [stageThumbnails, setStageThumbnails] = useState<Record<number, string>>({});
  const [containerWidth, setContainerWidth] = useState<number>(600);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredInitialRef = useRef(false);

  // Sync sliderVal with global intensity
  useEffect(() => {
    setSliderVal(intensity);
  }, [intensity]);

  // Keep stage thumbnail cache updated
  useEffect(() => {
    if (iceResult?.imageUrl && currentStage) {
      setStageThumbnails((prev) => ({
        ...prev,
        [currentStage]: iceResult.imageUrl,
      }));
    }
  }, [iceResult, currentStage]);

  // Measure split slider container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset initial trigger flag if photo changes
  useEffect(() => {
    hasTriggeredInitialRef.current = false;
    setStageThumbnails({});
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

  // Update split slider position based on pointer event
  const updateSplitPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = Math.round((clampedX / rect.width) * 100);
    setSplitPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingSplit(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSplitPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSplit) return;
    updateSplitPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingSplit(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  const handleSplitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSplitPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSplitPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      setSplitPosition(0);
    } else if (e.key === 'End') {
      setSplitPosition(100);
    }
  };

  const handleStageChange = (stage: TransformationStage) => {
    setStage(stage);
    clearError();
    // Reset split position towards center so transformation is immediately visible
    if (splitPosition > 85) setSplitPosition(50);
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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in">
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
            onClick={handleRerollSeed}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200"
            title="Re-roll generation seed"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Re-roll Seed</span>
          </button>
          <span className="text-slate-600">•</span>
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
          {/* Left Column: Visual Split Slider & 4-Stage Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            {/* Interactive Split Comparison Card */}
            <div
              ref={containerRef}
              role="slider"
              aria-label="Before and after comparison slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={splitPosition}
              tabIndex={0}
              onKeyDown={handleSplitKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl aspect-[4/3] sm:aspect-square select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {/* AFTER (Transformed with Ice) - Background full width */}
              <img
                src={iceResult.imageUrl}
                alt="Simulated outcome: My Future with Ice"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* BEFORE (Original photo) - Clipped by split position */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPosition}%` }}
              >
                <img
                  src={photo.blobUrl}
                  alt="Original Appearance"
                  className="absolute inset-0 h-full object-cover max-w-none"
                  style={{ width: `${containerWidth}px` }}
                  draggable={false}
                />
              </div>

              {/* Left Label: Your Photo */}
              <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-slate-700 pointer-events-none text-left">
                <span className="block text-xs font-bold text-white">Your Photo</span>
                <span className="block text-[10px] text-slate-300">Current appearance</span>
              </div>

              {/* Right Label: With Ice (Simulated) */}
              <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-red-900/60 pointer-events-none text-right flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
                  <Frown className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-red-300">With Ice (Simulated)</span>
                  <span className="block text-[10px] text-slate-400">
                    Stage {currentStage} • {currentStageMeta.period}
                  </span>
                </div>
              </div>

              {/* Draggable Divider Line & Split Handle */}
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize transition-transform ${
                    isDraggingSplit ? 'scale-110 shadow-sky-500/50' : 'hover:scale-105'
                  }`}
                  title="Drag left or right to compare"
                >
                  <ChevronLeft className="w-3.5 h-3.5 -mr-1 text-slate-800" />
                  <ChevronRight className="w-3.5 h-3.5 -ml-1 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Horizontal Stage Thumbnails Strip (Original, Stage 1, Stage 2, Stage 3) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Thumbnail 0: Original Photo */}
              <button
                type="button"
                onClick={() => setSplitPosition(100)}
                className={`relative rounded-xl overflow-hidden border text-left transition-all aspect-[4/3] bg-slate-900 group ${
                  splitPosition >= 95
                    ? 'border-2 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                }`}
                title="View original baseline appearance"
              >
                <img
                  src={photo.blobUrl}
                  alt="Original"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 text-center">
                  <span className="block text-xs font-bold text-white">Original</span>
                </div>
              </button>

              {/* Thumbnails 1, 2, 3: Stages */}
              {APP_CONFIG.stages.map((stg) => {
                const isActive = currentStage === stg.stage && splitPosition < 95;
                const thumbUrl = stageThumbnails[stg.stage] || (currentStage === stg.stage ? iceResult.imageUrl : photo.blobUrl);
                return (
                  <button
                    key={stg.stage}
                    type="button"
                    onClick={() => handleStageChange(stg.stage)}
                    className={`relative rounded-xl overflow-hidden border text-left transition-all aspect-[4/3] bg-slate-900 group ${
                      isActive
                        ? 'border-2 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                        : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                    title={`Switch to Stage ${stg.stage} (${stg.period})`}
                  >
                    <img
                      src={thumbUrl}
                      alt={stg.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 text-center">
                      <span className="block text-[11px] font-bold text-white leading-tight">Stage {stg.stage}</span>
                      <span className="block text-[9px] text-slate-300 opacity-90">{stg.period}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Stage Controls & Documented Indicators */}
          <div className="lg:col-span-6 space-y-5">
            {/* Card 1: SELECT TIMELINE STAGE */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Select Timeline Stage
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  See how long-term ice use can impact appearance and health.
                </p>
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
                          ? 'bg-amber-950/40 border-2 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold">Stage {stg.stage}</span>
                      <span className="block text-[11px] opacity-75 mt-0.5">{stg.period}</span>
                    </button>
                  );
                })}
              </div>

              {/* Simulation Intensity Slider */}
              <div className="pt-2 space-y-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Simulation Intensity</span>
                  <span className="font-mono font-bold text-amber-400">{Math.round(sliderVal * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={sliderVal}
                  onChange={handleSliderChange}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                  aria-label="Simulation Intensity"
                />
              </div>
            </div>

            {/* Card 2: DOCUMENTED IMPACT INDICATORS */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Documented Impact Indicators</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{currentStageMeta.period}</span>
              </div>

              <h2 className="text-lg font-bold text-white">{currentStageMeta.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStageMeta.description}
              </p>

              {/* 5 Clinical Bullets with Red Dots */}
              {currentStageMeta.bullets && (
                <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                  {currentStageMeta.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5 shadow-sm shadow-red-500/50" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Important Disclaimer Box */}
              <div className="rounded-xl bg-amber-950/20 border border-amber-800/40 p-3.5 space-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Important</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This is an educational illustration based on research and is NOT a prediction of how you will look. Effects vary greatly between individuals.
                </p>
              </div>
            </div>

            {/* Action Buttons Row: Compare & My Healthy Future */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <PrimaryButton
                size="md"
                variant="outline"
                onClick={() => navigate('/compare?pathway=ice')}
                leftIcon={<SplitSquareVertical className="w-4 h-4 text-sky-400" />}
                className="w-full sm:flex-1 py-3"
              >
                Compare Before & After
              </PrimaryButton>

              <button
                type="button"
                onClick={() => navigate('/healthy-future')}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/40 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>My Healthy Future</span>
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
