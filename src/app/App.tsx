import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { Header } from '../components/Header';
import { Welcome } from '../pages/Welcome';
import { Consent } from '../pages/Consent';
import { Selfie } from '../pages/Selfie';
import { FutureIce } from '../pages/FutureIce';
import { HealthyFuture } from '../pages/HealthyFuture';
import { Compare } from '../pages/Compare';
import { Help } from '../pages/Help';
import { APP_CONFIG } from '../config/appConfig';

export const AppContent: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#06080d] text-slate-100 font-sans selection:bg-sky-500/20 selection:text-white overflow-x-hidden">
      {/* Ambient Atmospheric Lighting & Cyber Grid Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-35" />

        {/* Ambient Floating Cyan Aurora Orb */}
        <div className="absolute -top-40 -right-40 w-[550px] h-[550px] bg-sky-500/[0.08] rounded-full blur-[130px] animate-aurora" />

        {/* Ambient Floating Indigo/Violet Nebula Orb */}
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-indigo-600/[0.06] rounded-full blur-[140px] animate-pulse-slow" />

        {/* Ambient Subtle Emerald Horizon Glow */}
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-start pb-16">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/selfie" element={<Selfie />} />
            <Route path="/future-ice" element={<FutureIce />} />
            <Route path="/healthy-future" element={<HealthyFuture />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Editorial Minimalist Footer */}
        <footer className="w-full border-t border-white/[0.08] bg-[#05070a]/80 backdrop-blur-md py-12 px-6 text-center text-xs text-slate-500 space-y-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <span className="font-semibold text-slate-200">
                NEO — Face the Future
              </span>
              <span>•</span>
              <span>Australian Anti Ice Campaign</span>
              <span>•</span>
              <span className="text-slate-400">{APP_CONFIG.slogans.primary}</span>
            </div>
            <p className="max-w-xl mx-auto text-xs text-slate-400 font-normal leading-relaxed">
              An educational experience. Not a medical diagnosis or prediction.
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              Zero persistent storage • Ephemeral processing only • Australian Anti Ice Campaign (AAIC)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
