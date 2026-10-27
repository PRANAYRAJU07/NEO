import React from 'react';
import { Cpu, ShieldCheck, X, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../app/AppContext';

interface EngineInfoModalProps {
  onClose: () => void;
}

export const EngineInfoModal: React.FC<EngineInfoModalProps> = ({ onClose }) => {
  const { engineInfo, activeProviderId, setProviderId } = useApp();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="engine-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label="Close engine details modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-sky-400 mb-4">
          <Cpu className="w-6 h-6" />
          <h2 id="engine-modal-title" className="text-xl font-bold">
            NEO Generative AI Engine Architecture
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          {/* Active Engine Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Active Generative Pipeline
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {engineInfo.type === 'server-gpu' ? 'Private GPU Connected' : 'Offline Simulation'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1">{engineInfo.name}</h3>
              <p className="text-xs text-slate-400">{engineInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Model Pipeline:</span>
                <span className="font-mono text-slate-200">SDXL Base 1.0 (Img2Img)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Denoising Range:</span>
                <span className="font-semibold text-sky-400">0.18 – 0.60 (Identity-Preserving)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Acceleration:</span>
                <span className="text-slate-200">{engineInfo.hardwareAcceleration || 'PyTorch CUDA fp16'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Image Storage:</span>
                <span className="text-emerald-400 font-semibold">0 KB (Volatile RAM Only)</span>
              </div>
            </div>

            {/* Provider Switcher inside modal */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Switch Active Provider:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProviderId('server-gpu')}
                  className={`px-3 py-1 rounded-lg border font-medium ${
                    activeProviderId === 'server-gpu'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Private GPU Server
                </button>
                <button
                  type="button"
                  onClick={() => setProviderId('mock-ai')}
                  className={`px-3 py-1 rounded-lg border font-medium ${
                    activeProviderId === 'mock-ai'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Offline Test Provider
                </button>
              </div>
            </div>
          </div>

          {/* Model Selection & Verification Report */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>Model Selection & Provenance: Stable Diffusion XL (SDXL)</span>
            </h4>
            <p className="text-xs text-slate-300">
              Unlike legacy filter approaches (grayscale/blur), NEO integrates with Stable Diffusion XL Base 1.0 image-to-image. SDXL was selected because:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li><strong>Photorealistic Dermal Rendering:</strong> High-frequency pore, skin-tone, and lighting realism far superior to older diffusion models.</li>
              <li><strong>Strict Identity Preservation:</strong> Conditioned via calibrated latent denoising strength (0.18 – 0.60) ensuring facial structure, eyes, clothing, and pose remain recognizable.</li>
              <li><strong>Licensing & Ethics:</strong> Permitted under CreativeML OpenRAIL++-M for non-profit educational and substance prevention applications.</li>
            </ul>

            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Child Safety Guarantees</span>
            </h4>
            <p className="text-xs text-slate-300">
              When communicating with the private GPU server, images are loaded strictly in volatile memory (RAM/VRAM) during inference and immediately garbage-collected. Zero photos are written to persistent server disks or transmitted to third-party APIs.
            </p>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                All transformations are scientifically grounded illustrative simulations, explicitly categorized as educational tools rather than predictive medical forecasts.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
