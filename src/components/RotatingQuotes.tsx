import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export interface QuoteItem {
  id: number;
  headline: string;
  supporting: string;
}

export const QUOTE_COLLECTION: QuoteItem[] = [
  {
    id: 1,
    headline: 'Your future is still being written.',
    supporting: 'Every choice is a line. Make yours count.',
  },
  {
    id: 2,
    headline: "Don't trade tomorrow for a moment.",
    supporting: 'Know the risks before making a decision that could change your life.',
  },
  {
    id: 3,
    headline: 'Your potential deserves protection.',
    supporting: 'Your health, relationships, goals, and future matter.',
  },
  {
    id: 4,
    headline: 'Pause. Picture your future. Choose.',
    supporting: 'A moment of reflection can make room for a better decision.',
  },
  {
    id: 5,
    headline: 'You are more than a difficult chapter.',
    supporting: "Support is available. Recovery is possible. You don't have to face it alone.",
  },
  {
    id: 6,
    headline: 'The strongest choice can be asking for help.',
    supporting: 'Talking to someone you trust is a sign of strength.',
  },
];

const DEFAULT_QUOTE: QuoteItem = {
  id: 1,
  headline: 'Your future is still being written.',
  supporting: 'Every choice is a line. Make yours count.',
};

interface RotatingQuotesProps {
  className?: string;
  autoPlayIntervalMs?: number;
}

export const RotatingQuotes: React.FC<RotatingQuotesProps> = ({
  className = '',
  autoPlayIntervalMs = 7500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nextQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % QUOTE_COLLECTION.length);
  }, []);

  const prevQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + QUOTE_COLLECTION.length) % QUOTE_COLLECTION.length);
  }, []);

  const goToQuote = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Autoplay management
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying || isHovered || isFocused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      nextQuote();
    }, autoPlayIntervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isFocused, prefersReducedMotion, autoPlayIntervalMs, nextQuote]);

  const current = QUOTE_COLLECTION[currentIndex] ?? DEFAULT_QUOTE;

  return (
    <section
      aria-label="Words of Reflection"
      className={`relative w-full py-12 sm:py-16 border-y border-white/[0.08] bg-[#080a0f] text-slate-100 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        // Only set unfocused if focus moved outside this component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between text-xs tracking-widest uppercase font-mono text-slate-500 mb-8 select-none">
          <span className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Perspective</span>
          </span>
          <span>
            {String(currentIndex + 1).padStart(2, '0')} / {String(QUOTE_COLLECTION.length).padStart(2, '0')}
          </span>
        </div>

        {/* Live Region for Screen Readers */}
        <div
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-[140px] sm:min-h-[160px] flex flex-col justify-center transition-opacity duration-500 ease-out"
        >
          <blockquote className="space-y-3">
            <p className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white leading-snug">
              &ldquo;{current.headline}&rdquo;
            </p>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-2xl">
              {current.supporting}
            </p>
          </blockquote>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/[0.06]">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Select a quote">
            {QUOTE_COLLECTION.map((q, idx) => (
              <button
                key={q.id}
                role="tab"
                aria-selected={idx === currentIndex}
                aria-label={`Quote ${idx + 1}: ${q.headline}`}
                onClick={() => goToQuote(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                  idx === currentIndex
                    ? 'w-8 bg-sky-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Controls: Prev, Pause/Play, Next */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              type="button"
              onClick={prevQuote}
              aria-label="Previous quote"
              className="p-2 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause quote rotation' : 'Resume quote rotation'}
              className="p-2 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={nextQuote}
              aria-label="Next quote"
              className="p-2 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
