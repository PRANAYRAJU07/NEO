import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical } from 'lucide-react';

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
          <span className="font-semibold text-slate-300">View Mode:</span>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              viewMode === 'slider'
                ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Interactive Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        <span className="text-slate-400 hidden sm:inline-block">
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
          className="relative w-full max-w-lg aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-sky-500"
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          {/* AFTER IMAGE (Background / Full Width) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* After Label Badge */}
          <div className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 pointer-events-none">
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
            <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200">
              {beforeLabel}
            </div>
          </div>

          {/* Vertical Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-sky-500">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8.5 7l-5 5 5 5V7zm7 10l5-5-5-5v10z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-square">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200">
              {beforeLabel}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-square">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200">
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
