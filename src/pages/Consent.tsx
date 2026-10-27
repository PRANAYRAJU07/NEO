import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckSquare, Square, ArrowRight, UserCheck, AlertTriangle, Server, Smartphone } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';

export const Consent: React.FC = () => {
  const navigate = useNavigate();
  const { setConsent } = useApp();

  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [acknowledgedEducational, setAcknowledgedEducational] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Student Privacy & Ethics Safeguard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Privacy Notice & Informed Choice
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Before taking or selecting a photo, please review how NEO handles images during AI-assisted educational illustration. Your trust and safety are paramount.
        </p>
      </div>

      {/* Processing Architecture Disclosure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Local On-Device Option</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Photos processed in offline mode or via demo avatars never leave your phone or laptop.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Server className="w-4 h-4" />
            <span>Private GPU Server Option</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When connecting to the private AAIC GPU engine, images are processed strictly in volatile memory and destroyed immediately. No photos are stored on server disk.
          </p>
        </div>
      </div>

      {/* Privacy Notice Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Our Privacy Commitment</span>
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          {APP_CONFIG.privacy.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
          Note: Formal legal and child-safety compliance certification remains subject to ongoing review by AAIC qualified advisors.
        </div>
      </div>

      {/* Educational Notice Alert */}
      <div className="rounded-2xl bg-amber-950/20 border border-amber-800/40 p-4 flex items-start gap-3 text-amber-200/90 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-amber-300">Fictional Educational Simulation:</strong>
          <p className="text-slate-300">
            {APP_CONFIG.disclaimer.short} Biological responses vary greatly. Visuals are designed for prevention education, not clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Interactive Consent Checkboxes */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Required Confirmations (To Use Your Own Photo)
        </h2>

        {/* Checkbox 1 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreedPrivacy}
            onClick={() => setAgreedPrivacy(!agreedPrivacy)}
            className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          >
            {agreedPrivacy ? (
              <CheckSquare className="w-5 h-5 text-sky-500" />
            ) : (
              <Square className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
            )}
          </button>
          <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-200 select-none">
            I understand how my photo is handled: processed only in temporary memory and <strong>never permanently stored</strong> or linked to personal records.
          </span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <button
            type="button"
            role="checkbox"
            aria-checked={acknowledgedEducational}
            onClick={() => setAcknowledgedEducational(!acknowledgedEducational)}
            className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          >
            {acknowledgedEducational ? (
              <CheckSquare className="w-5 h-5 text-sky-500" />
            ) : (
              <Square className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
            )}
          </button>
          <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-200 select-none">
            I acknowledge that the generated facial changes are <strong>educational illustrations</strong> and not real medical predictions of my individual future.
          </span>
        </label>

        {/* Checkbox 3 */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <button
            type="button"
            role="checkbox"
            aria-checked={confirmedAge}
            onClick={() => setConfirmedAge(!confirmedAge)}
            className="mt-0.5 text-sky-400 hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          >
            {confirmedAge ? (
              <CheckSquare className="w-5 h-5 text-sky-500" />
            ) : (
              <Square className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
            )}
          </button>
          <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-200 select-none">
            I confirm that I am participating in this AAIC educational experience voluntarily.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <PrimaryButton
          size="lg"
          variant="primary"
          disabled={!canProceedWithPhoto}
          onClick={handleProceedWithPhoto}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Proceed to Photo Selection
        </PrimaryButton>

        <PrimaryButton
          size="lg"
          variant="secondary"
          onClick={handleContinueWithoutPhoto}
          leftIcon={<UserCheck className="w-5 h-5 text-sky-400" />}
          className="w-full sm:w-auto"
        >
          Continue Without Photo
        </PrimaryButton>
      </div>

      <p className="text-xs text-slate-500 text-center sm:text-left">
        No camera or file library permissions will be requested until you explicitly choose a photo action on the next screen.
      </p>
    </div>
  );
};
