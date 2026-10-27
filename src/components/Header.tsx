import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, RotateCcw, Cpu, Menu, X } from 'lucide-react';
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        {/* Top Slogan Ribbon */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-700 to-amber-600 text-white text-[11px] sm:text-xs font-bold tracking-wider py-1 px-4 text-center flex items-center justify-center gap-3">
          <span>{APP_CONFIG.slogans.primary}</span>
          <span className="opacity-60">•</span>
          <span>{APP_CONFIG.slogans.secondary}</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Campaign title */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl group-hover:scale-105 transition-transform">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  NEO
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 font-semibold hidden sm:inline-block">
                  Face the Future
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Australian Anti Ice Campaign
              </p>
            </div>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* On-device engine provenance pill */}
            <button
              type="button"
              onClick={() => setShowEngineModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700/80 text-sky-400 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              title="Click to view engine provenance & privacy architecture"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{engineInfo.isLocalOnly ? '100% On-Device' : 'Engine Info'}</span>
            </button>

            {/* Privacy indicator */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/40 border border-emerald-800/40 text-emerald-400"
              title="Zero uploads: selfies never leave this device"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Upload Guarantee</span>
            </div>

            {/* Help Link */}
            <Link
              to="/help"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                location.pathname === '/help'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Get Help Today</span>
            </Link>

            {/* Reset / Clear photo button */}
            {photo && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-red-950/30 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Purge temporary images and start over"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/help"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400"
              aria-label="Get Help Today"
            >
              <HeartHandshake className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowEngineModal(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-sky-400 font-medium"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Engine Provenance & Privacy</span>
              </span>
              <span className="text-xs bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">100% Local</span>
            </button>

            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-sm text-amber-300 font-semibold"
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
                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-sm text-red-300 font-semibold"
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
