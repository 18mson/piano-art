'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { isBlackKey, NOTE_NAMES } from '../lib/music';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOTAL_WHITE_KEYS = 52;

// White key index of C notes: C1 = 2, C2 = 9, C3 = 16, C4 = 23, C5 = 30, C6 = 37, C7 = 44, C8 = 51
function getWhiteKeyIndexForOctave(octave: number): number {
  return 2 + (octave - 1) * 7;
}

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

  const targetStartWhiteIdx = isAll88 ? 0 : getWhiteKeyIndexForOctave(startOctave);
  const targetEndWhiteIdx = isAll88 ? 51 : getWhiteKeyIndexForOctave(startOctave + numOctaves);
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

    for (let s = 1; s <= maxStart; s++) {
      const ratio = getWhiteKeyIndexForOctave(s) / TOTAL_WHITE_KEYS;
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

    // If clicking directly on or outside the window, jump or start dragging
    const currentWindowStart = activeLeftRatio;
    const currentWindowEnd = activeLeftRatio + windowWidthRatio;

    // Capture pointer
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
  const canShiftLeft = !isAll88 && startOctave > 1;
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

  // Render static 88-key preview elements once
  const miniKeys = React.useMemo(() => {
    const keys: { midi: number; isBlack: boolean; whiteIdx: number }[] = [];
    let wCount = 0;
    for (let m = 21; m <= 108; m++) {
      const black = isBlackKey(m);
      keys.push({ midi: m, isBlack: black, whiteIdx: black ? wCount - 1 : wCount++ });
    }
    return keys;
  }, []);

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 select-none flex items-center px-2 py-1 gap-2 z-20">
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
        className="relative flex-1 h-7 bg-slate-900/90 rounded border border-slate-700/60 overflow-hidden cursor-pointer touch-none"
      >
        {/* Render 52 tiny white keys */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: TOTAL_WHITE_KEYS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full border-r border-slate-800/50 ${
                i === 23 ? 'bg-amber-500/20' : 'bg-slate-300/10'
              }`}
            />
          ))}
        </div>

        {/* Middle C (C4) indicator dot/marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{
            left: `${(23.5 / TOTAL_WHITE_KEYS) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          <span className="text-[7px] text-amber-300 font-mono font-bold leading-none mt-0.5">C4</span>
        </div>

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
          <div className="absolute top-0 left-1 text-[8px] font-mono font-semibold text-cyan-200 pointer-events-none drop-shadow">
            {isAll88 ? '88 Keys' : `C${startOctave} - C${startOctave + (typeof octaves === 'number' ? octaves : 0)}`}
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
