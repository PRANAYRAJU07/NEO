import React, { useState } from 'react';
import {
  Phone,
  Globe,
  CheckCircle2,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  LifeBuoy,
  HeartHandshake,
} from 'lucide-react';
import { AAIC_CONTACTS, APP_CONFIG } from '../config/appConfig';
import { AAICSupportContact } from '../types';

export const Help: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredContacts = selectedCategory === 'all'
    ? AAIC_CONTACTS
    : AAIC_CONTACTS.filter((c) => c.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in relative">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-500/40 text-sky-300 text-xs font-mono font-semibold tracking-wider shadow-glow-cyan/20 animate-pulse-slow">
          <HeartHandshake className="w-4 h-4 text-sky-400" />
          <span>Support &amp; Care Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
          Get Help Today
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
          If you or someone you care about is impacted by crystal methamphetamine (ice), alcohol, or other substances, compassionate and confidential support is available 24/7 across Australia.
        </p>
      </div>

      {/* Immediate Crisis Callout with Radar Ping */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950/30 via-slate-900/60 to-red-950/30 border border-red-500/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-glow-red/20 relative overflow-hidden">
        <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
          <div className="relative w-12 h-12 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
            <span className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping pointer-events-none" />
            <LifeBuoy className="w-6 h-6 relative z-10" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white tracking-tight">Immediate Medical Emergency?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If someone is in acute danger, unconscious, or needs urgent medical care, call Emergency Services immediately.
            </p>
          </div>
        </div>
        <a
          href="tel:000"
          className="relative z-10 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-glow-red/40 flex items-center gap-2.5 focus:ring-2 focus:ring-red-400 focus:outline-none transition-transform hover:scale-105"
        >
          <Phone className="w-4 h-4" />
          <span>Call 000 (Triple Zero)</span>
        </a>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'campaign', label: 'AAIC Official' },
          { id: 'addiction', label: 'Drug & Alcohol' },
          { id: 'youth', label: 'Youth Support' },
          { id: 'crisis', label: '24/7 Crisis Support' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wide border transition-all ${
              selectedCategory === tab.id
                ? 'bg-white text-slate-950 border-white font-bold shadow-glow-cyan/20 scale-105'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verified Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((contact: AAICSupportContact) => (
          <div
            key={contact.id}
            className="glass-panel-hover rounded-3xl border border-white/10 p-6 flex flex-col justify-between gap-5 transition-all hover:scale-[1.01] hover:border-sky-500/40 relative overflow-hidden group shadow-xl"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-white tracking-tight group-hover:text-sky-300 transition-colors">
                  {contact.name}
                </h3>
                {contact.isVerified ? (
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 text-emerald-400 shrink-0 shadow-sm"
                    title={contact.verificationNotes || 'Verified against Australian public health registry'}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-slate-400 shrink-0"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Community Resource</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {contact.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{contact.operatingHours}</span>
              </div>
            </div>

            {/* Action Buttons for this Contact */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.08]">
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {contact.phone}</span>
              </a>

              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3.5 rounded-xl glass-panel hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title={`Visit ${contact.website}`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Website</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* AAIC School Workshop Notice */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-2.5 text-xs text-slate-300 shadow-xl">
        <h4 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Australian Anti Ice Campaign (AAIC) School Presentations</span>
        </h4>
        <p className="leading-relaxed">
          AAIC delivers evidence-based prevention workshops to Australian schools, sporting clubs, and community groups. To book an educational presentation, visit{' '}
          <a
            href="https://aaic.org.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline underline-offset-2 hover:text-sky-300 font-medium"
          >
            aaic.org.au
          </a>
          .
        </p>
      </div>

      {/* Slogan Footer */}
      <div className="text-center pt-4">
        <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">
          {APP_CONFIG.slogans.primary} • {APP_CONFIG.slogans.secondary}
        </p>
      </div>
    </div>
  );
};
