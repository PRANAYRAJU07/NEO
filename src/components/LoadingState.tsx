import React from 'react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  progress?: number;
  message?: string;
  subMessage?: string;
  privacyBadge?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  progress = 45,
  message = 'Generating Educational Visualization...',
  subMessage = 'Processing 100% on-device inside your browser sandbox. No images leave your phone.',
  privacyBadge,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6"
    >
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>{message}</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          {subMessage}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>Client Inference</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Privacy Assurance Badge */}
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400/90 font-medium bg-emerald-950/20 py-2 px-3 rounded-xl border border-emerald-800/30">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
        <span>{privacyBadge || 'Zero Network Egress • Local Canvas/Wasm Engine'}</span>
      </div>
    </div>
  );
};
