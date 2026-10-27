import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Shield, HeartHandshake, Eye, Sparkles, UserCheck } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { APP_CONFIG } from '../config/appConfig';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Australian Anti Ice Campaign • Youth Prevention Experience</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          NEO – <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-amber-400 bg-clip-text text-transparent">Face the Future</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An interactive educational journey helping Australian youth visualize the profound physical and personal value of choosing a drug-free future.
        </p>

        {/* Primary Slogan Showcase */}
        <div className="py-2">
          <p className="text-sm font-black tracking-widest text-amber-400 uppercase">
            &ldquo;{APP_CONFIG.slogans.primary}&rdquo;
          </p>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
            {APP_CONFIG.slogans.secondary}
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <PrimaryButton
            size="lg"
            variant="primary"
            onClick={() => navigate('/consent')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-sky-600/30"
          >
            Start Prevention Experience
          </PrimaryButton>

          <Link to="/help" className="w-full sm:w-auto">
            <PrimaryButton
              size="lg"
              variant="secondary"
              leftIcon={<HeartHandshake className="w-5 h-5 text-amber-400" />}
              className="w-full"
            >
              Get Help Today
            </PrimaryButton>
          </Link>
        </div>
      </section>

      {/* Educational Disclaimer Banner */}
      <EducationalDisclaimer />

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Card 1: Educational Insight */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Visualise Consequences</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Explore scientifically grounded, non-stigmatising simulations of how crystal methamphetamine affects facial vitality, vascular health, and biological age.
          </p>
        </div>

        {/* Card 2: Healthy Alternative */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">My Healthy Future</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            See the alternative: how staying clean preserves mental clarity, glowing health, sports capability, relationships, and life ambitions.
          </p>
        </div>

        {/* Card 3: Privacy & Respect */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-3 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">100% On-Device Privacy</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your photos are processed entirely inside your phone or laptop. No selfies are sent to any remote server or stored in any database.
          </p>
        </div>
      </section>

      {/* Continue Without Photo Quick Pill */}
      <section className="rounded-2xl bg-slate-900/50 border border-slate-800/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Prefer not to use your own photo?</h3>
            <p className="text-xs text-slate-400">
              You can experience the complete visual journey with our illustrative student avatars.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/selfie?mode=sample')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold whitespace-nowrap border border-slate-700"
        >
          Use Demo Avatars
        </button>
      </section>
    </div>
  );
};
