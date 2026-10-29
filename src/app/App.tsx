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
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500/20 selection:text-white">
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
      <footer className="w-full border-t border-white/[0.08] bg-[#05070a] py-12 px-6 text-center text-xs text-slate-500 space-y-4">
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
