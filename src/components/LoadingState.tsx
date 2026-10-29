import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  progress?: number;
  message?: string;
  subMessage?: string;
  privacyBadge?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  progress = 45,
  message = 'Preparing your visualization…',
  subMessage = 'Processed locally in memory. No photographs leave this device.',
  privacyBadge,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl text-center space-y-6"
    >
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-sky-400/20 border-t-sky-400 animate-spin" />
        <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium text-white flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{message}</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-normal">
          {subMessage}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Inference Progress</span>
          <span>{progress}%</span>
        </div>
      </div>

      {privacyBadge && (
        <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-slate-400 border border-white/10 px-2.5 py-1 rounded">
          {privacyBadge}
        </span>
      )}
    </div>
  );
};
