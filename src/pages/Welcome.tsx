import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Activity,
  Brain,
  Users,
  Compass,
  Sparkles,
  UserCheck,
  Phone,
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { EducationalDisclaimer } from '../components/EducationalDisclaimer';
import { RotatingQuotes } from '../components/RotatingQuotes';
import { APP_CONFIG } from '../config/appConfig';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const scrollToRisks = () => {
    const el = document.getElementById('risk-awareness');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full text-slate-100 selection:bg-sky-500/30 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Editorial, Minimalist, Cinematic)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center items-center text-center px-6 sm:px-8 py-20 max-w-5xl mx-auto">
        {/* Subtle Background Glow Accent (restrained, non-distracting) */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/[0.04] rounded-full blur-3xl pointer-events-none"
        />

        <div className="space-y-8 relative z-10">
          {/* Eyebrow */}
          <h2 className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono tracking-widest uppercase text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>NEO – Face the Future</span>
          </h2>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Your future is still{' '}
            <span className="font-normal italic text-slate-100 underline decoration-sky-500/40 underline-offset-8">
              being written.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Every choice can shape the path ahead. Understand the risks of methamphetamine, explore
            possible futures, and discover why your next chapter matters.
          </p>

          {/* Primary Slogans Banner (Official AAIC Brand Guarantee) */}
          <div className="py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-mono tracking-wider text-slate-400 uppercase">
            <span className="font-semibold text-slate-300">Australian Anti Ice Campaign</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-sky-300 font-bold">&ldquo;{APP_CONFIG.slogans.primary}&rdquo;</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400">&ldquo;{APP_CONFIG.slogans.secondary}&rdquo;</span>
          </div>

          {/* Call-to-Action Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <PrimaryButton
              size="lg"
              variant="primary"
              onClick={() => navigate('/consent')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-8 py-3.5 text-sm uppercase tracking-wider font-semibold bg-white text-slate-950 hover:bg-slate-200 border-0 shadow-lg shadow-white/5"
              aria-label="Start Prevention Experience"
            >
              Explore your future
            </PrimaryButton>

            <PrimaryButton
              size="lg"
              variant="outline"
              onClick={scrollToRisks}
              className="w-full sm:w-auto px-8 py-3.5 text-sm uppercase tracking-wider font-semibold border-white/20 text-slate-300 hover:text-white hover:border-white/40"
              aria-label="Understand the risks: Learn more"
            >
              Understand the risks
            </PrimaryButton>
          </div>
        </div>

        {/* Scroll Cue */}
        <button
          type="button"
          onClick={scrollToRisks}
          className="mt-16 sm:mt-24 inline-flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg p-2"
          aria-label="Scroll to risk awareness section"
        >
          <span className="text-[11px] font-mono tracking-widest uppercase">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-slate-700 flex justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </button>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. ROTATING QUOTES SYSTEM
      ───────────────────────────────────────────────────────────── */}
      <RotatingQuotes />

      {/* ─────────────────────────────────────────────────────────────
          3. RISK-AWARENESS SECTION (“Know what is at stake”)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="risk-awareness"
        className="w-full max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-28 space-y-16"
      >
        <div className="space-y-4 max-w-2xl">
          <span className="text-xs font-mono tracking-widest uppercase text-sky-400 font-semibold">
            Health & Impact
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            Know what is at stake.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
            Methamphetamine can affect the brain and body, mental wellbeing, relationships, and
            everyday life. Its effects vary, and the risks can be serious.
          </p>
        </div>

        {/* 4 Minimalist Editorial Items with Thin Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-white/10 pt-10">
          {/* Item 1: Mind */}
          <div className="space-y-3 pb-8 md:pb-0 border-b md:border-b-0 border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-sky-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Mind</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pl-11">
              It can affect sleep, mood, concentration, and mental wellbeing, sometimes triggering
              paranoia, severe insomnia, or persistent cognitive fatigue.
            </p>
          </div>

          {/* Item 2: Body */}
          <div className="space-y-3 pb-8 md:pb-0 border-b md:border-b-0 border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-sky-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Body</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pl-11">
              It can increase heart rate and blood pressure and contribute to serious health
              complications, vascular stress, and accelerated biological wear.
            </p>
          </div>

          {/* Item 3: Connections */}
          <div className="space-y-3 pb-8 md:pb-0 border-b md:border-b-0 border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Connections</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pl-11">
              Substance use can strain relationships, erode trust with loved ones, and undermine
              daily commitments with school, sport, and work.
            </p>
          </div>

          {/* Item 4: Future */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-sky-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">Future</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pl-11">
              Dependence and health consequences can make personal and academic goals harder to
              pursue, taking focus away from dreams and passions.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FUTURE-EXPLORATION FEATURE (“Meet a possible future”)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="future-exploration"
        className="w-full border-y border-white/10 bg-[#07090e] py-20 sm:py-28"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-14">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono tracking-widest uppercase text-sky-400 font-semibold">
              Interactive Visualization
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Meet a possible future.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
              Explore educational visualizations of how different life paths may look. Your real
              future is not predetermined.
            </p>
          </div>

          {/* Two Exploration Pathways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pathway 1: Explore the Risks */}
            <div className="relative group rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 hover:border-white/20 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-light tracking-tight text-white">
                  Explore the risks
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  View an educational, progressive illustration of physical and facial wear associated
                  with chronic crystal methamphetamine use across multiple timeline scenarios.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/consent?pathway=ice')}
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white hover:text-sky-300 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore this path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pathway 2: Explore a Healthier Path */}
            <div className="relative group rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 hover:border-white/20 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-light tracking-tight text-white">
                  Explore a healthier path
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Discover how healthy choices, positive sleep, nutrition, and self-care preserve
                  natural facial radiance, energy, sports capability, and future opportunities.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/consent?pathway=healthy')}
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-400 hover:text-sky-300 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore healthy future</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Alternate Avatar Callout (Minimalist Row) */}
          <div className="border border-white/[0.08] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-300 shrink-0" />
              <span>
                <strong>Your privacy is protected:</strong> Photos are processed in volatile memory. No
                facial images are stored permanently or shared.
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/selfie?mode=sample')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Try with demo avatars</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. A HEALTHY FUTURE SECTION (“Your next chapter starts with you”)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-28 space-y-16">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-mono tracking-widest uppercase text-sky-400 font-semibold">
            Empowerment & Agency
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            Your next chapter starts with you.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
            Protecting your future isn't about being perfect. It's about making informed choices,
            building supportive connections, and knowing when to ask for help.
          </p>
        </div>

        {/* 3 Simple Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10">
          {/* Action 1 */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              01 / Clarity
            </span>
            <h3 className="text-xl font-medium text-white tracking-tight">Learn the facts.</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Equip yourself with verified, non-stigmatising knowledge so you can see through myths,
              peer pressure, and quick fixes.
            </p>
          </div>

          {/* Action 2 */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              02 / Community
            </span>
            <h3 className="text-xl font-medium text-white tracking-tight">
              Build your support system.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Surround yourself with friends, teachers, teammates, and mentors who respect your
              boundaries and encourage your potential.
            </p>
          </div>

          {/* Action 3 */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              03 / Courage
            </span>
            <h3 className="text-xl font-medium text-white tracking-tight">
              Talk to someone you trust.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When pressure or anxiety builds, speaking with a friend, parent, school counsellor, or
              support line is a sign of strength.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <PrimaryButton
            size="md"
            variant="outline"
            onClick={() => navigate('/help')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="border-white/20 text-slate-200 hover:text-white hover:border-white/40"
          >
            Take one positive step
          </PrimaryButton>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. EDUCATIONAL DISCLAIMER (Mandatory Medical / Ethics Statement)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6 sm:px-8 pb-12">
        <EducationalDisclaimer />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. CLOSING MOMENT & VERIFIED SUPPORT (“Your story is bigger”)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full border-t border-white/10 bg-[#06080d] py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-12">
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-tight">
              Your story is bigger than{' '}
              <span className="italic font-normal">one moment.</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Whatever brought you here, you deserve accurate information, support, and the chance to
              build a healthier future.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton
              size="lg"
              variant="primary"
              onClick={() => navigate('/consent')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-8 py-3.5 text-sm uppercase tracking-wider font-semibold bg-white text-slate-950 hover:bg-slate-200 border-0"
            >
              Explore the experience
            </PrimaryButton>

            <Link to="/help" className="w-full sm:w-auto">
              <PrimaryButton
                size="lg"
                variant="outline"
                className="w-full px-8 py-3.5 text-sm uppercase tracking-wider font-semibold border-white/20 text-slate-300 hover:text-white hover:border-white/40"
                aria-label="Get Help Today: Learn about support"
              >
                Learn about support
              </PrimaryButton>
            </Link>
          </div>

          {/* Verified Support Services Row */}
          <div className="pt-12 border-t border-white/[0.08] space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-slate-500">
              Verified Confidential Support Services (Australia)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
              {/* Service 1: AAIC */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs text-slate-400 block font-mono">AAIC Youth Support</span>
                <a
                  href="tel:1300424238"
                  className="text-sm font-semibold text-white hover:text-sky-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>1300 424 238</span>
                </a>
              </div>

              {/* Service 2: National Drug Hotline */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs text-slate-400 block font-mono">National Drug Hotline (24/7)</span>
                <a
                  href="tel:1800250015"
                  className="text-sm font-semibold text-white hover:text-sky-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>1800 250 015</span>
                </a>
              </div>

              {/* Service 3: Kids Helpline */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs text-slate-400 block font-mono">Kids Helpline (Ages 5–25)</span>
                <a
                  href="tel:1800551800"
                  className="text-sm font-semibold text-white hover:text-sky-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>1800 55 1800</span>
                </a>
              </div>

              {/* Service 4: Lifeline */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs text-slate-400 block font-mono">Lifeline Crisis Support (24/7)</span>
                <a
                  href="tel:131114"
                  className="text-sm font-semibold text-white hover:text-sky-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>13 11 14</span>
                </a>
              </div>

              {/* Service 5: headspace */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                <span className="text-xs text-slate-400 block font-mono">headspace (Youth Mental Health)</span>
                <a
                  href="tel:1800650890"
                  className="text-sm font-semibold text-white hover:text-sky-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>1800 650 890</span>
                </a>
              </div>

              {/* Emergency */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/[0.1] space-y-1">
                <span className="text-xs text-red-300/80 block font-mono">Acute Emergency (24/7)</span>
                <a
                  href="tel:000"
                  className="text-sm font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>Call 000 (Triple Zero)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
