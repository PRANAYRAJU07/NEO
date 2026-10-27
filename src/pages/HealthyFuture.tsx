import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Sun,
  Shield,
  SplitSquareVertical,
  Activity,
  Award,
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

  // If no photo is selected, prompt user to pick one
  useEffect(() => {
    if (!photo) {
      navigate('/selfie');
      return;
    }

    if (!healthyResult && !isProcessing) {
      processPathway('healthy', 1, 0.85);
    }
  }, [photo, healthyResult, isProcessing, navigate, processPathway]);

  if (!photo) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Title & Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Positive Prevention & Longevity Pathway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Healthy Future
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Choosing life preserves your natural vitality, clear skin, cognitive potential, and lifelong opportunities.
        </p>
      </div>

      {/* Slogan Spotlight */}
      <div className="text-center py-2 bg-gradient-to-r from-emerald-950/40 via-sky-950/60 to-emerald-950/40 rounded-2xl border border-emerald-800/30 p-4">
        <p className="text-base sm:text-lg font-black tracking-wide text-emerald-300 uppercase">
          &ldquo;{APP_CONFIG.slogans.secondary}&rdquo;
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Every positive choice today protects your body, mind, and relationships tomorrow.
        </p>
      </div>

      {/* Top Educational Disclaimer */}
      <EducationalDisclaimer compact />

      {/* Processing or Error View */}
      {isProcessing && <LoadingState progress={processingProgress} message="Rendering Healthy Future Visualization..." />}

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

      {/* Main Content when Result is Ready */}
      {!isProcessing && healthyResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-slate-950 shadow-2xl shadow-emerald-950/30 aspect-square">
              <img
                src={healthyResult.imageUrl}
                alt="Simulated outcome: My Healthy Future"
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-700/80 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                <span>Natural Vitality & Radiance</span>
              </div>

              {/* Timing badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-400">
                Rendered locally in {healthyResult.executionTimeMs}ms
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <PrimaryButton
                size="md"
                variant="outline"
                onClick={() => navigate('/compare?pathway=healthy')}
                leftIcon={<SplitSquareVertical className="w-4 h-4 text-emerald-400" />}
                className="flex-1"
              >
                Compare Before & After
              </PrimaryButton>

              <PrimaryButton
                size="md"
                variant="secondary"
                onClick={() => navigate('/future-ice')}
                leftIcon={<Activity className="w-4 h-4 text-amber-400" />}
                className="flex-1"
              >
                Review Ice Pathway
              </PrimaryButton>
            </div>
          </div>

          {/* Right Column: Protective Factors & Positive Messaging */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>What Choosing Health Protects</span>
              </h3>

              {APP_CONFIG.healthyAspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1.5 hover:border-emerald-800/60 transition-colors"
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

            {/* AAIC Support Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Support & Community Help</h4>
                <p className="text-[11px] text-slate-400">
                  Connect with the Australian Anti Ice Campaign or 24/7 national helplines.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/help')}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shadow-sm"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slogan Footer */}
      <div className="text-center pt-4">
        <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
          {APP_CONFIG.slogans.primary} • {APP_CONFIG.slogans.secondary}
        </p>
      </div>
    </div>
  );
};
