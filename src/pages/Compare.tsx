import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SplitSquareVertical, ArrowLeft, Sparkles, Activity } from 'lucide-react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { PrimaryButton } from '../components/PrimaryButton';
import { LoadingState } from '../components/LoadingState';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';
import { TransformationPathway } from '../types';

export const Compare: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    photo,
    iceResult,
    healthyResult,
    currentStage,
    intensity,
    processPathway,
    isProcessing,
  } = useApp();

  const initialPathway = (searchParams.get('pathway') as TransformationPathway) || 'ice';
  const [activePathway, setActivePathway] = useState<TransformationPathway>(initialPathway);

  // If no photo is selected, prompt user to pick one
  useEffect(() => {
    if (!photo) {
      navigate('/selfie');
      return;
    }

    // Ensure the active pathway result is rendered
    if (activePathway === 'ice' && !iceResult && !isProcessing) {
      processPathway('ice', currentStage, intensity);
    } else if (activePathway === 'healthy' && !healthyResult && !isProcessing) {
      processPathway('healthy', 1, 0.85);
    }
  }, [photo, activePathway, iceResult, healthyResult, isProcessing, currentStage, intensity, navigate, processPathway]);

  if (!photo) return null;

  const currentResult = activePathway === 'ice' ? iceResult : healthyResult;
  const currentStageMeta = APP_CONFIG.stages.find((s) => s.stage === currentStage) || APP_CONFIG.stages[0]!;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-300 text-xs font-semibold">
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>Interactive Comparative Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Before & After Comparison
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Drag the center handle or use the keyboard arrows to compare your baseline photo with simulated future outcomes.
        </p>
      </div>

      {/* Pathway Switcher Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActivePathway('ice')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePathway === 'ice'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Simulated Toll (Ice)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePathway('healthy')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activePathway === 'healthy'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>My Healthy Future</span>
          </button>
        </div>
      </div>

      {/* Educational Disclaimer */}
      <EducationalDisclaimer compact />

      {/* Loading state or Slider */}
      {isProcessing && <LoadingState progress={65} message="Rendering comparison view..." />}

      {!isProcessing && currentResult && (
        <div className="space-y-6">
          <BeforeAfterSlider
            beforeImage={photo.blobUrl}
            afterImage={currentResult.imageUrl}
            beforeLabel="Original Baseline"
            afterLabel={
              activePathway === 'ice'
                ? `Simulated Ice Toll (${currentStageMeta.period})`
                : 'My Healthy Future (Vitality)'
            }
          />

          {/* Context note below slider */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-center max-w-xl mx-auto space-y-1">
            <p className="text-xs font-semibold text-slate-200">
              {activePathway === 'ice'
                ? `Illustrating Stage ${currentStage} consequences: ${currentStageMeta.title}`
                : 'Illustrating natural youth vitality, skin elasticity, and radiant wellness.'}
            </p>
            <p className="text-[11px] text-slate-400">
              All visuals are educational simulations. Biological responses vary.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <PrimaryButton
          variant="outline"
          onClick={() => navigate(activePathway === 'ice' ? '/future-ice' : '/healthy-future')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to {activePathway === 'ice' ? 'Ice Pathway' : 'Healthy Pathway'}
        </PrimaryButton>

        <PrimaryButton
          variant="secondary"
          onClick={() => navigate('/help')}
        >
          Get Help & Information
        </PrimaryButton>
      </div>
    </div>
  );
};
