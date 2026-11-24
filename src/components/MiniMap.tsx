'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { useSongStore } from '../store/songStore';
import { inputDispatcher } from '../lib/input/dispatcher';
import { isBlackKey, getPitchColor } from '../lib/music';
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

// Precompute 88-key horizontal mapping for all MIDI notes 21 (A0) to 108 (C8)
const WHITE_KEY_INDICES: Record<number, number> = {};
let wIdx = 0;
for (let m = 21; m <= 108; m++) {
  if (!isBlackKey(m)) {
    WHITE_KEY_INDICES[m] = wIdx++;
  }
}

function getMidi88Ratio(midi: number): number {
  if (midi < 21) return 0;
  if (midi > 108) return 1;
  if (!isBlackKey(midi)) {
    const idx = WHITE_KEY_INDICES[midi] ?? 0;
    return (idx + 0.5) / TOTAL_WHITE_KEYS;
  } else {
    const prevWhiteIdx = WHITE_KEY_INDICES[midi - 1] ?? 0;
    return (prevWhiteIdx + 1) / TOTAL_WHITE_KEYS;
  }
}

export const MiniMap: React.FC = () => {
  const {
    octaves,
    startOctave,
    setStartOctave,
    shiftStartOctave,
  } = usePianoStore();

  const stripRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLeftRatio, setDragLeftRatio] = useState<number | null>(null);
  const [hasOffscreenLeft, setHasOffscreenLeft] = useState(false);
  const [hasOffscreenRight, setHasOffscreenRight] = useState(false);

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

  // MIDI bounds of currently visible viewport on the main piano
  const visibleMinMidi = isAll88
    ? 21
    : startOctave === 0
    ? 21
    : startOctave * 12 + 12;

  const visibleMaxMidi = isAll88
    ? 108
    : startOctave === 0
    ? Math.min(108, 21 + Math.round(numOctaves * 12))
    : Math.min(108, (startOctave + numOctaves) * 12 + 12);

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

  // 60FPS Live Preview Canvas: Renders song notes preview across all 88 keys
  useEffect(() => {
    let animId: number;
    const activePressedNotes = new Set<number>();
    let lastOffscreenCheck = 0;

    const unsubDispatcher = inputDispatcher.addListener((midi, pressed) => {
      if (pressed) {
        activePressedNotes.add(midi);
      } else {
        activePressedNotes.delete(midi);
      }
    });

    const renderPreview = () => {
      const canvas = canvasRef.current;
      const container = stripRef.current;
      if (canvas && container) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = container.clientWidth;
        const h = container.clientHeight;

        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, w, h);

          const { activeSong, currentTime } = useSongStore.getState();

          let offLeft = false;
          let offRight = false;

          // 1. Render song falling & active notes preview across the entire 88 keys
          if (activeSong) {
            const notes = activeSong.notes;
            const previewWindow = 2.6; // Preview upcoming notes 2.6s before hit
            const hitLineY = h - 6;
            const keyColWidth = Math.max(3, Math.min(8, Math.round((w / TOTAL_WHITE_KEYS) * 0.85)));

            for (let i = 0; i < notes.length; i++) {
              const n = notes[i];
              if (n.time > currentTime + previewWindow) break;
              if (n.time + n.duration < currentTime - 0.2) continue;

              const xCenter = getMidi88Ratio(n.midi) * w;
              const isSounding = currentTime >= n.time && currentTime <= n.time + n.duration;
              const pitchColor = getPitchColor(n.midi).css;

              // Check if note is outside current visible main keyboard viewport
              if (!isAll88) {
                if (n.midi < visibleMinMidi) offLeft = true;
                if (n.midi > visibleMaxMidi) offRight = true;
              }

              if (isSounding) {
                // Sounding note: glowing column and bright key hit bar
                const grad = ctx.createLinearGradient(0, 0, 0, hitLineY);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.7, pitchColor);
                grad.addColorStop(1, pitchColor);

                ctx.fillStyle = grad;
                ctx.globalAlpha = 0.4;
                ctx.fillRect(Math.round(xCenter - keyColWidth / 2), 0, keyColWidth, hitLineY);

                // Bright hit bar at hit-line
                ctx.fillStyle = pitchColor;
                ctx.globalAlpha = 0.95;
                ctx.fillRect(Math.round(xCenter - (keyColWidth + 2) / 2), hitLineY - 2, keyColWidth + 2, 6);
              } else if (n.time > currentTime) {
                // Upcoming falling note: descending pill bar
                const timeDiff = n.time - currentTime;
                const progress = Math.max(0, Math.min(1, 1 - (timeDiff / previewWindow)));
                const yBottom = progress * hitLineY;
                const barHeight = Math.max(4, Math.min(16, (n.duration / previewWindow) * hitLineY));
                const yTop = Math.max(1, yBottom - barHeight);
                const actualHeight = Math.max(3, yBottom - yTop);

                ctx.fillStyle = pitchColor;
                ctx.globalAlpha = 0.35 + progress * 0.6;
                ctx.fillRect(
                  Math.round(xCenter - keyColWidth / 2),
                  Math.round(yTop),
                  keyColWidth,
                  Math.round(actualHeight)
                );
              }
            }
          }

          // 2. Render live pressed keys (player touch/PC keyboard/MIDI)
          if (activePressedNotes.size > 0) {
            const keyColWidth = Math.max(4, Math.min(8, Math.round((w / TOTAL_WHITE_KEYS) * 0.9)));
            const hitLineY = h - 6;

            activePressedNotes.forEach((midi) => {
              const xCenter = getMidi88Ratio(midi) * w;
              ctx.fillStyle = '#38bdf8';
              ctx.globalAlpha = 0.95;
              ctx.fillRect(Math.round(xCenter - keyColWidth / 2), hitLineY - 3, keyColWidth, 7);
            });
          }

          ctx.restore();

          // Periodically update offscreen indicator state (~10Hz) to prevent react render churn
          const now = performance.now();
          if (now - lastOffscreenCheck > 100) {
            lastOffscreenCheck = now;
            setHasOffscreenLeft((prev) => (prev !== offLeft ? offLeft : prev));
            setHasOffscreenRight((prev) => (prev !== offRight ? offRight : prev));
          }
        }
      }

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);

    return () => {
      cancelAnimationFrame(animId);
      unsubDispatcher();
    };
  }, [isAll88, visibleMinMidi, visibleMaxMidi]);

  return (
    <section
      aria-label="Navigasi Rentang 88 Tuts Piano"
      className="w-full bg-slate-950 border-b border-slate-800/90 select-none flex items-center px-2 py-1.5 gap-2 z-20 safe-p-left safe-p-right"
    >
      {/* Shift Left Button */}
      <button
        type="button"
        disabled={!canShiftLeft}
        onClick={handleShiftLeft}
        aria-label="Geser rentang 1 oktaf ke kiri"
        title={hasOffscreenLeft ? 'Ada not lagu di oktaf kiri! Klik untuk menggeser' : 'Geser rentang 1 oktaf ke kiri (Panah Kiri)'}
        className={`relative p-1.5 rounded text-xs transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
          canShiftLeft
            ? hasOffscreenLeft
              ? 'text-sky-200 bg-sky-950/80 border border-sky-500/80 ring-1 ring-sky-400/60 shadow-sm shadow-sky-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700'
            : 'text-slate-600 opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        {hasOffscreenLeft && canShiftLeft && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 animate-ping" aria-hidden="true" />
        )}
      </button>

      {/* Mini-map 88 keys strip container */}
      <div
        ref={stripRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-label="Pilih posisi tuts piano pada rentang 88 tuts"
        aria-valuemin={0}
        aria-valuemax={octaves === 'all' ? 0 : 8 - (typeof octaves === 'number' ? octaves : 1)}
        aria-valuenow={startOctave}
        tabIndex={0}
        className="relative flex-1 h-9 bg-slate-900 rounded border border-slate-700/80 overflow-hidden cursor-pointer touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
      >
        {/* Render 52 white key divider slots */}
        <div className="absolute inset-0 flex" aria-hidden="true">
          {Array.from({ length: TOTAL_WHITE_KEYS }).map((_, i) => {
            const isCKey = i === 2 || i === 9 || i === 16 || i === 23 || i === 30 || i === 37 || i === 44 || i === 51;
            const isMiddleC = i === 23;
            return (
              <div
                key={i}
                className={`flex-1 h-full border-r border-slate-800/60 ${
                  isMiddleC
                    ? 'bg-amber-400/15'
                    : isCKey
                    ? 'bg-sky-400/10'
                    : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Live Song Preview Canvas (All 88 keys, upcoming & sounding notes) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          aria-hidden="true"
        />

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
              aria-hidden="true"
            >
              <div
                className={`rounded-full ${
                  marker.isMiddleC
                    ? 'w-1.5 h-1.5 bg-amber-400 mt-1'
                    : 'w-1 h-1 bg-slate-500 mt-1.5'
                }`}
              />
              <span
                className={`text-[9px] font-mono leading-none mt-0.5 select-none font-semibold ${
                  marker.isMiddleC
                    ? 'text-amber-300'
                    : 'text-slate-400'
                }`}
              >
                {marker.label}
              </span>
            </div>
          );
        })}

        {/* Draggable Active Viewport Window */}
        <div
          className={`absolute top-0 bottom-0 border-2 rounded z-20 ${
            isDragging
              ? 'border-sky-400 bg-sky-500/20'
              : 'border-sky-400/90 bg-sky-500/15 transition-[left,width] duration-150 ease-out'
          }`}
          style={{
            left: `${activeLeftRatio * 100}%`,
            width: `${windowWidthRatio * 100}%`,
          }}
          aria-hidden="true"
        >
          <div className="absolute bottom-0.5 left-1 text-[9px] font-mono font-semibold text-sky-100 pointer-events-none bg-slate-900/90 px-1.5 py-0.2 rounded border border-sky-400/50 leading-tight">
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
        aria-label="Geser rentang 1 oktaf ke kanan"
        title={hasOffscreenRight ? 'Ada not lagu di oktaf kanan! Klik untuk menggeser' : 'Geser rentang 1 oktaf ke kanan (Panah Kanan)'}
        className={`relative p-1.5 rounded text-xs transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
          canShiftRight
            ? hasOffscreenRight
              ? 'text-sky-200 bg-sky-950/80 border border-sky-500/80 ring-1 ring-sky-400/60 shadow-sm shadow-sky-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700'
            : 'text-slate-600 opacity-40 cursor-not-allowed'
        }`}
      >
        <ChevronRight size={16} aria-hidden="true" />
        {hasOffscreenRight && canShiftRight && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 animate-ping" aria-hidden="true" />
        )}
      </button>
    </section>
  );
};
