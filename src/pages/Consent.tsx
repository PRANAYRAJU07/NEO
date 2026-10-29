import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Server,
  Smartphone,
  Lock,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';

export const Consent: React.FC = () => {
  const navigate = useNavigate();
  const { setConsent } = useApp();

  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [acknowledgedEducational, setAcknowledgedEducational] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

  const confirmedCount = (agreedPrivacy ? 1 : 0) + (acknowledgedEducational ? 1 : 0) + (confirmedAge ? 1 : 0);
  const canProceedWithPhoto = agreedPrivacy && acknowledgedEducational && confirmedAge;

  const handleProceedWithPhoto = () => {
    if (!canProceedWithPhoto) return;
    setConsent({
      agreedToPrivacy: true,
      acknowledgedEducationalOnly: true,
      confirmedAgeAppropriate: true,
      agreedToServerProcessing: true,
      timestamp: Date.now(),
    });
    navigate('/selfie');
  };

  const handleContinueWithoutPhoto = () => {
    setConsent({
      agreedToPrivacy: true,
      acknowledgedEducationalOnly: true,
      confirmedAgeAppropriate: true,
      agreedToServerProcessing: false,
      timestamp: Date.now(),
    });
    navigate('/selfie?mode=sample');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in relative">
      {/* Top Biometric Shield Hero */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold tracking-wider shadow-glow-emerald/20 animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Biometric Privacy &amp; Ethics Safeguard</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Privacy Notice &amp; Informed Choice
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Before taking or selecting a photo, review how NEO handles facial images during AI-assisted educational illustration. Your identity and safety are protected at every step.
        </p>

        {/* Live Clearance Telemetry Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Safety Clearance Status</span>
            </span>
            <span
              className={`font-bold transition-colors ${
                canProceedWithPhoto ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {canProceedWithPhoto
                ? '3 of 3 Confirmed • Ready to Proceed'
                : `${confirmedCount} of 3 Required Confirmations`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                canProceedWithPhoto
                  ? 'bg-gradient-to-r from-sky-400 to-emerald-400 shadow-glow-emerald'
                  : 'bg-gradient-to-r from-sky-500 to-amber-500'
              }`}
              style={{ width: `${(confirmedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Processing Architecture Disclosure (Twin Interactive Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel-hover rounded-2xl p-5 space-y-2.5 border border-sky-500/20 bg-gradient-to-b from-sky-950/20 to-slate-950/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-sky-400" />
            </div>
            <span>Local On-Device Option</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Photos processed in offline mode or through demo avatars never leave your personal phone or laptop sandbox.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero Network Transmission</span>
          </div>
        </div>

        <div className="glass-panel-hover rounded-2xl p-5 space-y-2.5 border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-slate-950/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center">
              <Server className="w-4 h-4 text-purple-300" />
            </div>
            <span>Private GPU Engine Option</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When connecting to the private AAIC GPU engine, images are processed strictly in volatile memory and destroyed immediately. No photos are stored on server disk.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-300 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Volatile Memory Only • Ephemeral</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice Box */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-white/10 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <span>Our Privacy Commitment</span>
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          {APP_CONFIG.privacy.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0 shadow-sm shadow-sky-400/50" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="pt-3 text-[11px] text-slate-500 border-t border-white/[0.08] font-mono">
          Note: Formal legal and child-safety compliance certification remains subject to ongoing review by AAIC qualified advisors.
        </div>
      </div>

      {/* Educational Notice Alert */}
      <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-5 flex items-start gap-3.5 text-amber-200/95 text-xs sm:text-sm shadow-glow-amber/5">
        <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="space-y-1">
          <strong className="font-semibold text-amber-300">Fictional Educational Simulation:</strong>
          <p className="text-slate-300 leading-relaxed">
            {APP_CONFIG.disclaimer.short} Biological responses vary greatly. Visuals are designed for prevention education, not clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Interactive Consent Checkboxes (High-Tech Authorization Cards) */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold px-1">
          Required Confirmations (To Use Your Own Photo)
        </h2>

        {/* Checkbox Card 1 */}
        <label
          onClick={() => setAgreedPrivacy(!agreedPrivacy)}
          className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group select-none ${
            agreedPrivacy
              ? 'glass-panel border-sky-400/60 bg-sky-950/25 shadow-glow-cyan/20'
              : 'glass-panel-hover border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreedPrivacy}
              onClick={(e) => {
                e.stopPropagation();
                setAgreedPrivacy(!agreedPrivacy);
              }}
              className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-0.5 shrink-0 transition-transform active:scale-95"
            >
              {agreedPrivacy ? (
                <CheckSquare className="w-5 h-5 text-sky-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              )}
            </button>
            <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
              I understand how my photo is handled: processed only in temporary memory and{' '}
              <strong className="text-white font-semibold">never permanently stored</strong> or linked to personal records.
            </span>
          </div>
        </label>

        {/* Checkbox Card 2 */}
        <label
          onClick={() => setAcknowledgedEducational(!acknowledgedEducational)}
          className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group select-none ${
            acknowledgedEducational
              ? 'glass-panel border-sky-400/60 bg-sky-950/25 shadow-glow-cyan/20'
              : 'glass-panel-hover border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={acknowledgedEducational}
              onClick={(e) => {
                e.stopPropagation();
                setAcknowledgedEducational(!acknowledgedEducational);
              }}
              className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-0.5 shrink-0 transition-transform active:scale-95"
            >
              {acknowledgedEducational ? (
                <CheckSquare className="w-5 h-5 text-sky-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              )}
            </button>
            <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
              I acknowledge that the generated facial changes are{' '}
              <strong className="text-white font-semibold">educational illustrations</strong> and not real medical predictions of my individual future.
            </span>
          </div>
        </label>

        {/* Checkbox Card 3 */}
        <label
          onClick={() => setConfirmedAge(!confirmedAge)}
          className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group select-none ${
            confirmedAge
              ? 'glass-panel border-sky-400/60 bg-sky-950/25 shadow-glow-cyan/20'
              : 'glass-panel-hover border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={confirmedAge}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmedAge(!confirmedAge);
              }}
              className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-0.5 shrink-0 transition-transform active:scale-95"
            >
              {confirmedAge ? (
                <CheckSquare className="w-5 h-5 text-sky-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              )}
            </button>
            <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
              I confirm that I am participating in this AAIC educational experience voluntarily.
            </span>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <PrimaryButton
          size="lg"
          variant="primary"
          disabled={!canProceedWithPhoto}
          onClick={handleProceedWithPhoto}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className={`w-full sm:w-auto px-8 transition-all duration-300 ${
            canProceedWithPhoto ? 'shadow-glow-cyan' : 'opacity-50'
          }`}
        >
          Proceed to Photo Selection
        </PrimaryButton>

        <PrimaryButton
          size="lg"
          variant="secondary"
          onClick={handleContinueWithoutPhoto}
          leftIcon={<UserCheck className="w-5 h-5 text-sky-400" />}
          className="w-full sm:w-auto px-6 border-white/15 hover:border-sky-400/40"
        >
          Continue Without Photo
        </PrimaryButton>
      </div>

      <p className="text-xs text-slate-500 text-center sm:text-left font-mono">
        No camera or file library permissions will be requested until you explicitly choose a photo action on the next screen.
      </p>
    </div>
  );
};
