import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

interface EducationalDisclaimerProps {
  compact?: boolean;
}

export const EducationalDisclaimer: React.FC<EducationalDisclaimerProps> = ({ compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside
        aria-label="Educational Disclaimer"
        className={`w-full rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-amber-200/90 backdrop-blur-sm ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-amber-300">
                {APP_CONFIG.disclaimer.title}
              </span>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 underline underline-offset-2 hover:text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1"
                aria-haspopup="dialog"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Read Full Ethics & Medical Statement</span>
              </button>
            </div>
            <p className="mt-1 text-slate-300 leading-relaxed">
              {APP_CONFIG.disclaimer.short}
            </p>
          </div>
        </div>
      </aside>

      {/* Full Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close disclaimer modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 id="disclaimer-modal-title" className="text-xl font-bold">
                AAIC Educational & Ethics Policy
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 font-medium">
                {APP_CONFIG.disclaimer.short}
              </div>

              <h3 className="font-semibold text-slate-100 text-base">Educational Objective</h3>
              <p>
                {APP_CONFIG.disclaimer.full}
              </p>

              <h3 className="font-semibold text-slate-100 text-base">Child Safety & Respectful Representation</h3>
              <p>
                {APP_CONFIG.disclaimer.ethics} The Australian Anti Ice Campaign emphasizes support, early education, and positive healthy choices (&ldquo;Choose Life So That You May Live&rdquo;). We deliberately avoid sensationalised or graphic shock tactics that stigmatise affected individuals.
              </p>

              <h3 className="font-semibold text-slate-100 text-base">Need Support?</h3>
              <p>
                If substance use is impacting you, your family, or a peer, confidential, free help is available 24/7 across Australia. Visit our <strong className="text-sky-400">Get Help Today</strong> section.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
