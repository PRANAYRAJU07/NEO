import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, RotateCcw, Cpu, Menu, X } from 'lucide-react';
import { useApp } from '../app/AppContext';
import { APP_CONFIG } from '../config/appConfig';
import { EngineInfoModal } from './EngineInfoModal';

export const Header: React.FC = () => {
  const { photo, resetAll, engineInfo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleResetConfirm = () => {
    resetAll();
    setShowResetConfirm(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090e]/95 backdrop-blur-md">
        {/* Top Slogan Ribbon (Quiet, Editorial) */}
        <div className="border-b border-white/[0.05] bg-[#05070a] text-slate-400 text-[11px] font-mono tracking-wider py-1.5 px-4 text-center flex items-center justify-center gap-3">
          <span>{APP_CONFIG.slogans.primary}</span>
          <span className="text-slate-600">•</span>
          <span>{APP_CONFIG.slogans.secondary}</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Campaign title */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white font-mono text-sm font-bold tracking-tighter group-hover:border-sky-400 group-hover:shadow-glow-cyan transition-all duration-300">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  NEO
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-slate-400 font-mono tracking-wider uppercase hidden sm:inline-block">
                  Face the Future
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wide">
                Australian Anti Ice Campaign
              </p>
            </div>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Engine provenance pill */}
            <button
              type="button"
              onClick={() => setShowEngineModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white border border-white/10 hover:border-sky-400/40 bg-white/[0.03] hover:shadow-glow-cyan transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="Click to view generative AI engine provenance & privacy architecture"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>{engineInfo.type === 'server-gpu' ? 'GPU AI Engine' : 'AI Engine Info'}</span>
            </button>

            {/* Privacy indicator with live beacon */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-emerald-500/20 bg-emerald-950/20 text-emerald-300"
              title="Zero uploads: selfies never leave this device"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Zero-Upload Guarantee</span>
            </div>

            {/* Help Link */}
            <Link
              to="/help"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                location.pathname === '/help'
                  ? 'bg-white text-slate-950 font-bold'
                  : 'bg-white/[0.04] text-slate-200 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Get Help Today</span>
            </Link>

            {/* Reset / Clear photo button */}
            {photo && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Purge temporary images and start over"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Mobile quick actions & hamburger toggle */}
          <div className="flex md:hidden items-center gap-2">
            {photo && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-lg border border-white/10 text-red-400 hover:text-red-300"
                aria-label="Reset"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <Link
              to="/help"
              className="p-2 rounded-lg border border-white/10 text-amber-400"
              aria-label="Get Help Today"
            >
              <HeartHandshake className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#07090e] px-4 py-4 space-y-3 animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowEngineModal(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Engine Provenance & Privacy</span>
              </span>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded border border-white/10">100% Local</span>
            </button>

            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-200 hover:text-white"
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Get Help Today (AAIC & National Hotlines)</span>
            </Link>

            {photo && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowResetConfirm(true);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-red-500/20 text-xs text-red-300 hover:text-red-200"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset Experience & Purge Photo</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Engine Provenance Modal */}
      {showEngineModal && (
        <EngineInfoModal onClose={() => setShowEngineModal(false)} />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-200 shadow-2xl">
            <h2 id="reset-modal-title" className="text-lg font-bold text-white mb-2">
              Reset Experience & Purge Memory?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              This will immediately revoke active camera streams, release all temporary image buffers, and return you to the beginning. No photo data is saved on your device.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-950/40"
              >
                Yes, Reset & Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
