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
    <div className="min-h-screen flex flex-col bg-[#050b14] text-slate-100">
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

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <span className="font-semibold text-slate-300">
            {APP_CONFIG.name}
          </span>
          <span>•</span>
          <span>{APP_CONFIG.tagline}</span>
          <span>•</span>
          <span className="text-amber-400 font-bold">{APP_CONFIG.slogans.primary}</span>
        </div>
        <p className="max-w-2xl mx-auto text-[11px] text-slate-500 leading-relaxed">
          {APP_CONFIG.disclaimer.short} For confidential support across Australia, contact the National Alcohol and Other Drug Hotline at 1800 250 015 or Kids Helpline at 1800 55 1800.
        </p>
        <p className="text-[10px] text-slate-600">
          Zero data collection • 100% On-Device Processing • Australian Anti Ice Campaign (AAIC)
        </p>
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
