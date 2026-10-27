import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Sliders,
  SplitSquareVertical,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';
import { TransformationStage } from '../types';

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
    processPathway,
    clearError,
  } = useApp();

  // If no photo is selected, prompt user to pick one
  useEffect(() => {
    if (!photo) {
      navigate('/selfie');
      return;
    }

    // Automatically generate transformation if not already present
    if (!iceResult && !isProcessing) {
      processPathway('ice', currentStage, intensity);
    }
  }, [photo, iceResult, isProcessing, currentStage, intensity, navigate, processPathway]);

  const handleStageChange = (stage: TransformationStage) => {
    setStage(stage);
    processPathway('ice', stage, intensity);
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseFloat(e.target.value);
    setIntensity(newIntensity);
  };

  const handleIntensityRelease = () => {
    processPathway('ice', currentStage, intensity);
  };

  if (!photo) return null;

  const currentStageMeta = APP_CONFIG.stages.find((s) => s.stage === currentStage) || APP_CONFIG.stages[0]!;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Title & Campaign Ribbon */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Educational Substance Toll Exploration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Future with Ice (Simulated)
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          A respectful, evidence-grounded visual simulation demonstrating how crystal methamphetamine impacts systemic hydration, vascular tone, and facial vitality over time.
        </p>
      </div>

      {/* Top Educational Disclaimer */}
      <EducationalDisclaimer compact />

      {/* Processing or Error View */}
      {isProcessing && <LoadingState progress={processingProgress} message="Rendering Educational Simulation..." />}

      {error && !isProcessing && (
        <ErrorState
          title="Processing Alert"
          message={error}
          onRetry={() => {
            clearError();
            processPathway('ice', currentStage, intensity);
          }}
        />
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

              {/* Timing badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-400">
                Rendered locally in {iceResult.executionTimeMs}ms
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

          {/* Right Column: Stage Controls & Dermatological Insights */}
          <div className="lg:col-span-6 space-y-6">
            {/* Stage Selector */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Select Timeline Stage</span>
              </h3>

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

              {/* Fine-Tuning Slider */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Simulation Intensity</span>
                  <span className="font-mono text-amber-400">{Math.round(intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={intensity}
                  onChange={handleIntensityChange}
                  onMouseUp={handleIntensityRelease}
                  onTouchEnd={handleIntensityRelease}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                  aria-label="Simulation intensity"
                />
              </div>
            </div>

            {/* Stage Explanation Card */}
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
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                Note: Biological consequences vary significantly between individuals. This illustration is non-predictive.
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
