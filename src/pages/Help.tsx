import React, { useState } from 'react';
import {
  HeartHandshake,
  Phone,
  Globe,
  CheckCircle2,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import { AAIC_CONTACTS, APP_CONFIG } from '../config/appConfig';
import { AAICSupportContact } from '../types';

export const Help: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredContacts = selectedCategory === 'all'
    ? AAIC_CONTACTS
    : AAIC_CONTACTS.filter((c) => c.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4" />
          <span>Verified Support & Crisis Services</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Get Help Today
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          If you or someone you care about is impacted by crystal methamphetamine (ice), alcohol, or other substances, compassionate and confidential support is available 24/7 across Australia.
        </p>
      </div>

      {/* Immediate Crisis Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-red-950/40 border border-red-500/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Immediate Medical Emergency?</h3>
            <p className="text-xs text-slate-300">
              If someone is in acute danger, unconscious, or needs urgent medical care, call Emergency Services immediately.
            </p>
          </div>
        </div>
        <a
          href="tel:000"
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm whitespace-nowrap shadow-lg shadow-red-950/50 flex items-center gap-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              selectedCategory === tab.id
                ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
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
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-white">{contact.name}</h3>
                {contact.isVerified ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 shrink-0"
                    title={contact.verificationNotes || 'Verified against Australian public health registry'}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 shrink-0"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Pending AAIC Confirmation</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {contact.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{contact.operatingHours}</span>
              </div>
            </div>

            {/* Action Buttons for this Contact */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {contact.phone}</span>
              </a>

              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                title={`Visit ${contact.website}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* LEASE & School Workshop Architectural Boundary Notice */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5 space-y-2 text-xs text-slate-400">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Australian Anti Ice Campaign (AAIC) School Presentations</span>
        </h4>
        <p className="leading-relaxed">
          AAIC delivers evidence-based prevention workshops to Australian schools, sporting clubs, and community groups. To book an educational presentation, visit{' '}
          <a
            href="https://aaic.org.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
          >
            aaic.org.au
          </a>{' '}
          or call <strong>1300 424 238</strong>. Under AAIC child-safety protocols, school inquiries remain completely separate from student app sessions, and student photos are never transmitted.
        </p>
      </div>

      {/* Slogans */}
      <div className="text-center pt-4">
        <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
          {APP_CONFIG.slogans.primary} • {APP_CONFIG.slogans.secondary}
        </p>
      </div>
    </div>
  );
};
