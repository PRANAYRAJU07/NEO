import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: number; // width / height
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Baseline Photo',
  afterLabel = 'Transformed Outcome',
  aspectRatio = 1,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle position calculation from mouse or touch event
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer was not captured
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newPos = sliderPosition;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newPos = Math.max(0, sliderPosition - 5);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newPos = Math.min(100, sliderPosition + 5);
        e.preventDefault();
        break;
      case 'Home':
        newPos = 0;
        e.preventDefault();
        break;
      case 'End':
        newPos = 100;
        e.preventDefault();
        break;
      case 'PageDown':
        newPos = Math.max(0, sliderPosition - 20);
        e.preventDefault();
        break;
      case 'PageUp':
        newPos = Math.min(100, sliderPosition + 20);
        e.preventDefault();
        break;
      default:
        return;
    }
    setSliderPosition(newPos);
  };

  // Stop dragging on global window release
  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Mode toggle bar */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 font-mono">View Mode:</span>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-sky-600/40 border-sky-400 text-sky-200 shadow-glow-cyan/20'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Interactive Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-sky-600/40 border-sky-400 text-sky-200 shadow-glow-cyan/20'
                : 'glass-panel border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline-block">
          {viewMode === 'slider' ? 'Drag line or use Left/Right keys' : 'Comparing both states'}
        </span>
      </div>

      {viewMode === 'slider' ? (
        /* Interactive Split Slider */
        <div
          ref={containerRef}
          role="slider"
          aria-label="Before and after comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full max-w-xl aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-sky-500 group"
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          {/* Viewfinder corner brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40 pointer-events-none z-30" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40 pointer-events-none z-30" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40 pointer-events-none z-30" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40 pointer-events-none z-30" />

          {/* AFTER IMAGE (Background / Full Width) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* After Label Badge */}
          <div className="absolute bottom-3 right-3 z-10 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200 pointer-events-none shadow-lg">
            {afterLabel}
          </div>

          {/* BEFORE IMAGE (Clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
              draggable={false}
            />

            {/* Before Label Badge */}
            <div className="absolute bottom-3 left-3 z-10 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200 shadow-lg">
              {beforeLabel}
            </div>
          </div>

          {/* Vertical Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute inset-y-0 -left-px w-0.5 bg-gradient-to-b from-sky-400 via-white to-sky-400 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center border-2 border-sky-400 transition-transform ${
                isDragging ? 'scale-110 shadow-glow-cyan' : 'hover:scale-105'
              }`}
            >
              <ChevronLeft className="w-4 h-4 -mr-1 text-slate-900" />
              <ChevronRight className="w-4 h-4 -ml-1 text-slate-900" />
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950 aspect-square shadow-xl group">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200">
              {beforeLabel}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950 aspect-square shadow-xl group">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200">
              {afterLabel}
            </div>
          </div>
        </div>
      )}

      {/* Screen reader description */}
      <span className="sr-only">
        Comparison slider: currently showing {Math.round(sliderPosition)}% of {beforeLabel} and {Math.round(100 - sliderPosition)}% of {afterLabel}.
      </span>
    </div>
  );
};
