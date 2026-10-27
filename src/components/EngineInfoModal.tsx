import React from 'react';
import { Cpu, ShieldCheck, X, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../app/AppContext';

interface EngineInfoModalProps {
  onClose: () => void;
}

export const EngineInfoModal: React.FC<EngineInfoModalProps> = ({ onClose }) => {
  const { engineInfo } = useApp();

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
            On-Device Engine Architecture & Provenance
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          {/* Active Engine Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Active Transformation Pipeline
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Local Execution
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">{engineInfo.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{engineInfo.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Version:</span>
                <span className="font-mono text-slate-200">{engineInfo.version}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Network Transmission:</span>
                <span className="font-semibold text-emerald-400">0 KB (Zero egress)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Acceleration:</span>
                <span className="text-slate-200">{engineInfo.hardwareAcceleration || 'Canvas 2D / Wasm'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ONNX Runtime Status:</span>
                <span className="text-slate-200">{engineInfo.modelLoaded ? 'Model Loaded' : 'Wasm Web Engine (Active)'}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Provenance Disclosure */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Child-Safety Architecture</span>
            </h4>
            <p className="text-xs text-slate-300">
              Unlike cloud-based generative AI systems that transmit photos to remote data centers, NEO performs all image calculations directly inside your browser’s local JavaScript / WebAssembly sandbox. Student photos never leave the device.
            </p>

            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>Model Feasibility & Licensing Status</span>
            </h4>
            <p className="text-xs text-slate-300">
              High-parameter cloud diffusion models (e.g. 2GB+ checkpoints) exceed mobile cellular bandwidth and mobile browser GPU limits, and raise critical child-safety and consent concerns. NEO implements a verified on-device shader engine coupled with an ONNX Runtime Web adapter designed to host lightweight, ethical, non-stigmatising models once approved by AAIC.
            </p>

            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
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
