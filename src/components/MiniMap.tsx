'use client';

import React, { useRef, useState, useCallback } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOTAL_WHITE_KEYS = 52;

// White key index of C notes: A0 = 0, C1 = 2, C2 = 9, C3 = 16, C4 = 23, C5 = 30, C6 = 37, C7 = 44, C8 = 51
function getWhiteKeyIndexForOctave(octave: number): number {
  if (octave <= 0) return 0;
  return 2 + (octave - 1) * 7;
}

// Markers for all octaves across the 88-key piano
const OCTAVE_MARKERS: { label: string; whiteIdx: number; isMiddleC?: boolean }[] = [
  { label: 'A0', whiteIdx: 0 },
  { label: 'C1', whiteIdx: 2 },
  { label: 'C2', whiteIdx: 9 },
  { label: 'C3', whiteIdx: 16 },
  { label: 'C4', whiteIdx: 23, isMiddleC: true },
  { label: 'C5', whiteIdx: 30 },
  { label: 'C6', whiteIdx: 37 },
  { label: 'C7', whiteIdx: 44 },
  { label: 'C8', whiteIdx: 51 },
];

export const MiniMap: React.FC = () => {
  const {
    octaves,
    startOctave,
    setStartOctave,
    shiftStartOctave,
  } = usePianoStore();

  const stripRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLeftRatio, setDragLeftRatio] = useState<number | null>(null);

  // Compute visual window metrics
  const isAll88 = octaves === 'all';
  const numOctaves = typeof octaves === 'number' ? octaves : 7.2;

  const targetStartWhiteIdx = isAll88
    ? 0
    : startOctave === 0
    ? 0
    : getWhiteKeyIndexForOctave(startOctave);

  const targetEndWhiteIdx = isAll88
    ? 51
    : startOctave === 0
    ? Math.min(51, Math.round(numOctaves * 7))
    : Math.min(51, getWhiteKeyIndexForOctave(startOctave + numOctaves));

  const targetWhiteCount = targetEndWhiteIdx - targetStartWhiteIdx + 1;

  const windowWidthRatio = isAll88 ? 1 : targetWhiteCount / TOTAL_WHITE_KEYS;
  const canonicalLeftRatio = isAll88 ? 0 : targetStartWhiteIdx / TOTAL_WHITE_KEYS;

  const activeLeftRatio = dragLeftRatio !== null ? dragLeftRatio : canonicalLeftRatio;

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignored
    }
  };

  const snapToNearestOctave = useCallback((currentLeftRatio: number) => {
    if (octaves === 'all') {
      setDragLeftRatio(null);
      return;
    }

    const maxStart = 8 - octaves;
    let closestOctave = 1;
    let minDistance = Infinity;

    // Check all octaves including s = 0 (A0)
    for (let s = 0; s <= maxStart; s++) {
      const whiteIdx = s === 0 ? 0 : getWhiteKeyIndexForOctave(s);
      const ratio = whiteIdx / TOTAL_WHITE_KEYS;
      const dist = Math.abs(ratio - currentLeftRatio);
      if (dist < minDistance) {
        minDistance = dist;
        closestOctave = s;
      }
    }

    triggerHaptic();
    setStartOctave(closestOctave);
    setDragLeftRatio(null);
  }, [octaves, setStartOctave]);

  // Pointer event handlers for draggable window
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAll88 || !stripRef.current) return;
    e.preventDefault();

    const stripRect = stripRef.current.getBoundingClientRect();
    const clickX = e.clientX - stripRect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / stripRect.width));

    const currentWindowStart = activeLeftRatio;
    const currentWindowEnd = activeLeftRatio + windowWidthRatio;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsDragging(true);

    if (clickRatio < currentWindowStart || clickRatio > currentWindowEnd) {
      // Jump window centered around click
      const newLeft = Math.max(0, Math.min(1 - windowWidthRatio, clickRatio - windowWidthRatio / 2));
      setDragLeftRatio(newLeft);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !stripRef.current || isAll88) return;
    e.preventDefault();

    const stripRect = stripRef.current.getBoundingClientRect();
    const currentX = e.clientX - stripRect.left;
    const currentRatio = currentX / stripRect.width;

    const newLeft = Math.max(0, Math.min(1 - windowWidthRatio, currentRatio - windowWidthRatio / 2));
    setDragLeftRatio(newLeft);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isAll88) return;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (dragLeftRatio !== null) {
      snapToNearestOctave(dragLeftRatio);
    }
  };

  // Keyboard navigation
  const canShiftLeft = !isAll88 && startOctave > 0;
  const canShiftRight = !isAll88 && typeof octaves === 'number' && startOctave < 8 - octaves;

  const handleShiftLeft = () => {
    if (canShiftLeft) {
      triggerHaptic();
      shiftStartOctave(-1);
    }
  };

  const handleShiftRight = () => {
    if (canShiftRight) {
      triggerHaptic();
      shiftStartOctave(1);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 select-none flex items-center px-2 py-1 gap-2 z-20 safe-p-left safe-p-right">
      {/* Shift Left Button */}
      <button
        type="button"
        disabled={!canShiftLeft}
        onClick={handleShiftLeft}
        title="Shift down 1 octave (ArrowLeft)"
        className={`p-1 rounded text-xs font-mono transition-colors flex items-center justify-center ${
          canShiftLeft
            ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700'
            : 'text-slate-600 opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Mini-map 88 keys strip container */}
      <div
        ref={stripRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 h-8 bg-slate-900/90 rounded border border-slate-700/60 overflow-hidden cursor-pointer touch-none"
      >
        {/* Render 52 tiny white keys with subtle octave dividers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: TOTAL_WHITE_KEYS }).map((_, i) => {
            const isCKey = i === 2 || i === 9 || i === 16 || i === 23 || i === 30 || i === 37 || i === 44 || i === 51;
            const isMiddleC = i === 23;
            return (
              <div
                key={i}
                className={`flex-1 h-full border-r border-slate-800/40 ${
                  isMiddleC
                    ? 'bg-amber-500/15'
                    : isCKey
                    ? 'bg-cyan-500/10'
                    : 'bg-slate-300/5'
                }`}
              />
            );
          })}
        </div>

        {/* Octave Markers for ALL octaves across 88 keys */}
        {OCTAVE_MARKERS.map((marker) => {
          const leftPercent = ((marker.whiteIdx + 0.5) / TOTAL_WHITE_KEYS) * 100;
          return (
            <div
              key={marker.label}
              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none z-10"
              style={{
                left: `${leftPercent}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className={`rounded-full transition-all ${
                  marker.isMiddleC
                    ? 'w-1.5 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] mt-0.5'
                    : 'w-1 h-1 bg-slate-500/80 mt-1'
                }`}
              />
              <span
                className={`text-[7px] font-mono leading-none mt-0.5 select-none ${
                  marker.isMiddleC
                    ? 'text-amber-300 font-bold drop-shadow'
                    : 'text-slate-400 font-medium'
                }`}
              >
                {marker.label}
              </span>
            </div>
          );
        })}

        {/* Draggable Active Viewport Window */}
        <div
          className={`absolute top-0 bottom-0 border-2 rounded ${
            isDragging
              ? 'border-cyan-400 bg-cyan-400/25 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
              : 'border-cyan-400/80 bg-cyan-500/15 transition-[left,width] duration-200 ease-out'
          }`}
          style={{
            left: `${activeLeftRatio * 100}%`,
            width: `${windowWidthRatio * 100}%`,
          }}
        >
          <div className="absolute bottom-0.5 left-1 text-[8px] font-mono font-bold text-cyan-200 pointer-events-none drop-shadow bg-cyan-950/80 px-1 rounded-t border-t border-r border-cyan-400/60 leading-tight">
            {isAll88
              ? '88 Tuts'
              : startOctave === 0
              ? `A0 - A${octaves}`
              : `C${startOctave} - C${startOctave + (typeof octaves === 'number' ? octaves : 0)}`}
          </div>
        </div>
      </div>

      {/* Shift Right Button */}
      <button
        type="button"
        disabled={!canShiftRight}
        onClick={handleShiftRight}
        title="Shift up 1 octave (ArrowRight)"
        className={`p-1 rounded text-xs font-mono transition-colors flex items-center justify-center ${
          canShiftRight
            ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700'
            : 'text-slate-600 opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

