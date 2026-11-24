'use client';

import React, { useState, useEffect } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { inputDispatcher } from '../lib/input/dispatcher';
import { isThreeOctavesMode } from '../lib/input/keyboard';
import { Keyboard, ChevronLeft, ChevronRight, X, Info } from 'lucide-react';

interface KeyCapDef {
  code: string;
  keyLabel: string;
  note: string;
  isBlack: boolean;
  offset: number; // Semitone offset from base C
  row: 'upper' | 'lower';
}

// 2-OCTAVE LAYOUT DEFINITIONS
const LOWER_KEYS_2OCT: KeyCapDef[] = [
  { code: 'KeyQ', keyLabel: 'Q', note: 'C', isBlack: false, offset: 0, row: 'lower' },
  { code: 'KeyW', keyLabel: 'W', note: 'D', isBlack: false, offset: 2, row: 'lower' },
  { code: 'KeyE', keyLabel: 'E', note: 'E', isBlack: false, offset: 4, row: 'lower' },
  { code: 'KeyR', keyLabel: 'R', note: 'F', isBlack: false, offset: 5, row: 'lower' },
  { code: 'KeyT', keyLabel: 'T', note: 'G', isBlack: false, offset: 7, row: 'lower' },
  { code: 'KeyY', keyLabel: 'Y', note: 'A', isBlack: false, offset: 9, row: 'lower' },
  { code: 'KeyU', keyLabel: 'U', note: 'B', isBlack: false, offset: 11, row: 'lower' },
];

const LOWER_BLACK_KEYS_2OCT: (KeyCapDef | null)[] = [
  { code: 'Digit2', keyLabel: '2', note: 'C#', isBlack: true, offset: 1, row: 'lower' },
  { code: 'Digit3', keyLabel: '3', note: 'D#', isBlack: true, offset: 3, row: 'lower' },
  null,
  { code: 'Digit5', keyLabel: '5', note: 'F#', isBlack: true, offset: 6, row: 'lower' },
  { code: 'Digit6', keyLabel: '6', note: 'G#', isBlack: true, offset: 8, row: 'lower' },
  { code: 'Digit7', keyLabel: '7', note: 'A#', isBlack: true, offset: 10, row: 'lower' },
];

const UPPER_KEYS_2OCT: KeyCapDef[] = [
  { code: 'KeyC', keyLabel: 'C', note: 'C', isBlack: false, offset: 12, row: 'upper' },
  { code: 'KeyV', keyLabel: 'V', note: 'D', isBlack: false, offset: 14, row: 'upper' },
  { code: 'KeyB', keyLabel: 'B', note: 'E', isBlack: false, offset: 16, row: 'upper' },
  { code: 'KeyN', keyLabel: 'N', note: 'F', isBlack: false, offset: 17, row: 'upper' },
  { code: 'KeyM', keyLabel: 'M', note: 'G', isBlack: false, offset: 19, row: 'upper' },
  { code: 'Comma', keyLabel: ',', note: 'A', isBlack: false, offset: 21, row: 'upper' },
  { code: 'Period', keyLabel: '.', note: 'B', isBlack: false, offset: 23, row: 'upper' },
  { code: 'Slash', keyLabel: '/', note: 'C', isBlack: false, offset: 24, row: 'upper' },
];

const UPPER_BLACK_KEYS_2OCT: (KeyCapDef | null)[] = [
  { code: 'KeyF', keyLabel: 'F', note: 'C#', isBlack: true, offset: 13, row: 'upper' },
  { code: 'KeyG', keyLabel: 'G', note: 'D#', isBlack: true, offset: 15, row: 'upper' },
  null,
  { code: 'KeyJ', keyLabel: 'J', note: 'F#', isBlack: true, offset: 18, row: 'upper' },
  { code: 'KeyK', keyLabel: 'K', note: 'G#', isBlack: true, offset: 20, row: 'upper' },
  { code: 'KeyL', keyLabel: 'L', note: 'A#', isBlack: true, offset: 22, row: 'upper' },
  null,
];

// 3-OCTAVE CHROMATIC LAYOUT DEFINITIONS
const LOWER_KEYS_3OCT: KeyCapDef[] = [
  { code: 'KeyZ', keyLabel: 'Z', note: 'C', isBlack: false, offset: 0, row: 'lower' },
  { code: 'KeyX', keyLabel: 'X', note: 'D', isBlack: false, offset: 2, row: 'lower' },
  { code: 'KeyC', keyLabel: 'C', note: 'E', isBlack: false, offset: 4, row: 'lower' },
  { code: 'KeyV', keyLabel: 'V', note: 'F', isBlack: false, offset: 5, row: 'lower' },
  { code: 'KeyB', keyLabel: 'B', note: 'G', isBlack: false, offset: 7, row: 'lower' },
  { code: 'KeyN', keyLabel: 'N', note: 'A', isBlack: false, offset: 9, row: 'lower' },
  { code: 'KeyM', keyLabel: 'M', note: 'B', isBlack: false, offset: 11, row: 'lower' },
  { code: 'Comma', keyLabel: ',', note: 'C', isBlack: false, offset: 12, row: 'lower' },
  { code: 'Period', keyLabel: '.', note: 'D', isBlack: false, offset: 14, row: 'lower' },
  { code: 'Slash', keyLabel: '/', note: 'E', isBlack: false, offset: 16, row: 'lower' },
];

const LOWER_BLACK_KEYS_3OCT: (KeyCapDef | null)[] = [
  { code: 'KeyS', keyLabel: 'S', note: 'C#', isBlack: true, offset: 1, row: 'lower' },
  { code: 'KeyD', keyLabel: 'D', note: 'D#', isBlack: true, offset: 3, row: 'lower' },
  null,
  { code: 'KeyG', keyLabel: 'G', note: 'F#', isBlack: true, offset: 6, row: 'lower' },
  { code: 'KeyH', keyLabel: 'H', note: 'G#', isBlack: true, offset: 8, row: 'lower' },
  { code: 'KeyJ', keyLabel: 'J', note: 'A#', isBlack: true, offset: 10, row: 'lower' },
  null,
  { code: 'KeyL', keyLabel: 'L', note: 'C#', isBlack: true, offset: 13, row: 'lower' },
  { code: 'Semicolon', keyLabel: ';', note: 'D#', isBlack: true, offset: 15, row: 'lower' },
  null,
];

const UPPER_KEYS_3OCT: KeyCapDef[] = [
  { code: 'KeyQ', keyLabel: 'Q', note: 'F', isBlack: false, offset: 17, row: 'upper' },
  { code: 'KeyW', keyLabel: 'W', note: 'G', isBlack: false, offset: 19, row: 'upper' },
  { code: 'KeyE', keyLabel: 'E', note: 'A', isBlack: false, offset: 21, row: 'upper' },
  { code: 'KeyR', keyLabel: 'R', note: 'B', isBlack: false, offset: 23, row: 'upper' },
  { code: 'KeyT', keyLabel: 'T', note: 'C', isBlack: false, offset: 24, row: 'upper' },
  { code: 'KeyY', keyLabel: 'Y', note: 'D', isBlack: false, offset: 26, row: 'upper' },
  { code: 'KeyU', keyLabel: 'U', note: 'E', isBlack: false, offset: 28, row: 'upper' },
  { code: 'KeyI', keyLabel: 'I', note: 'F', isBlack: false, offset: 29, row: 'upper' },
  { code: 'KeyO', keyLabel: 'O', note: 'G', isBlack: false, offset: 31, row: 'upper' },
  { code: 'KeyP', keyLabel: 'P', note: 'A', isBlack: false, offset: 33, row: 'upper' },
  { code: 'BracketLeft', keyLabel: '[', note: 'B', isBlack: false, offset: 35, row: 'upper' },
  { code: 'BracketRight', keyLabel: ']', note: 'C', isBlack: false, offset: 36, row: 'upper' },
];

const UPPER_BLACK_KEYS_3OCT: (KeyCapDef | null)[] = [
  { code: 'Digit2', keyLabel: '2', note: 'F#', isBlack: true, offset: 18, row: 'upper' },
  { code: 'Digit3', keyLabel: '3', note: 'G#', isBlack: true, offset: 20, row: 'upper' },
  { code: 'Digit4', keyLabel: '4', note: 'A#', isBlack: true, offset: 22, row: 'upper' },
  null,
  { code: 'Digit6', keyLabel: '6', note: 'C#', isBlack: true, offset: 25, row: 'upper' },
  { code: 'Digit7', keyLabel: '7', note: 'D#', isBlack: true, offset: 27, row: 'upper' },
  null,
  { code: 'Digit9', keyLabel: '9', note: 'F#', isBlack: true, offset: 30, row: 'upper' },
  { code: 'Digit0', keyLabel: '0', note: 'G#', isBlack: true, offset: 32, row: 'upper' },
  { code: 'Minus', keyLabel: '-', note: 'A#', isBlack: true, offset: 34, row: 'upper' },
  null,
  null,
];

export const KeyboardGuide: React.FC = () => {
  const {
    octaves,
    keyboardBaseOctave,
    setKeyboardBaseOctave,
    showKeyboardGuide,
    setKeyboardGuide,
  } = usePianoStore();

  const [activeMidis, setActiveMidis] = useState<Set<number>>(new Set());

  // Close on Escape key (R-32)
  useEffect(() => {
    if (!showKeyboardGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setKeyboardGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardGuide, setKeyboardGuide]);

  // Subscribe to real-time key presses to show pressed animation
  useEffect(() => {
    const unsub = inputDispatcher.addListener((midi, pressed) => {
      setActiveMidis((prev) => {
        const next = new Set(prev);
        if (pressed) {
          next.add(midi);
        } else {
          next.delete(midi);
        }
        return next;
      });
    });

    return () => {
      unsub();
    };
  }, []);

  if (!showKeyboardGuide) {
    return null;
  }

  const is3Oct = isThreeOctavesMode(octaves);
  const baseMidi = (keyboardBaseOctave + 1) * 12;

  // In physical keyboard layout:
  // Row 1 (Top): Row QWERTY (Upper keys in 3-oct, Lower keys in 2-oct)
  // Row 2 (Bottom): Row ZXCVB (Lower keys in 3-oct, Upper keys in 2-oct)
  const is3Octave = is3Oct;

  const topRowWhiteKeys = is3Octave ? UPPER_KEYS_3OCT : LOWER_KEYS_2OCT;
  const topRowBlackKeys = is3Octave ? UPPER_BLACK_KEYS_3OCT : LOWER_BLACK_KEYS_2OCT;
  const topRowLabel = is3Octave
    ? `Baris Atas (Q - ]) • Oktaf F${keyboardBaseOctave + 1}..C${keyboardBaseOctave + 3}`
    : `Baris Atas (Q - U) • Oktaf C${keyboardBaseOctave}`;

  const bottomRowWhiteKeys = is3Octave ? LOWER_KEYS_3OCT : UPPER_KEYS_2OCT;
  const bottomRowBlackKeys = is3Octave ? LOWER_BLACK_KEYS_3OCT : UPPER_BLACK_KEYS_2OCT;
  const bottomRowLabel = is3Octave
    ? `Baris Bawah (Z - /) • Oktaf C${keyboardBaseOctave}..E${keyboardBaseOctave + 1}`
    : `Baris Bawah (C - /) • Oktaf C${keyboardBaseOctave + 1}`;

  const handleOctaveDown = () => {
    setKeyboardBaseOctave(Math.max(1, keyboardBaseOctave - 1));
  };

  const handleOctaveUp = () => {
    setKeyboardBaseOctave(Math.min(6, keyboardBaseOctave + 1));
  };

  const playNote = (offset: number) => {
    const midi = baseMidi + offset;
    inputDispatcher.noteOn(midi, 0.85);
  };

  const stopNote = (offset: number) => {
    const midi = baseMidi + offset;
    inputDispatcher.noteOff(midi);
  };

  const getNoteOctave = (offset: number) => {
    return Math.floor((baseMidi + offset) / 12) - 1;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-guide-title"
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 text-slate-200 select-none flex flex-col gap-3 my-auto"
      >
        {/* Header bar */}
        <header className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sky-400">
              <Keyboard size={16} aria-hidden="true" />
            </div>
            <div>
              <h2 id="keyboard-guide-title" className="text-sm font-bold text-white flex items-center gap-2 leading-none">
                <span>Panduan Keyboard PC</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700 font-semibold">
                  {is3Oct ? '3 Oktaf (2 Baris)' : '2 Oktaf (2 Baris)'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Disusun sesuai 2 baris keyboard PC fisik Anda (Baris QWERTY di atas, Baris ZXCV di bawah)
              </p>
            </div>
          </div>

          {/* Octave controls & close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Octave Shifter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md px-1.5 py-0.5 gap-1.5">
              <button
                type="button"
                onClick={handleOctaveDown}
                disabled={keyboardBaseOctave <= 1}
                aria-label="Geser Oktaf Turun (Panah Kiri)"
                title="Geser Oktaf Turun (Panah Kiri)"
                className="p-1 rounded hover:bg-slate-800 active:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <div className="text-center font-mono text-xs leading-tight px-1">
                <span className="text-slate-400 text-[8px] block uppercase">Oktaf</span>
                <span className="text-sky-300 font-semibold">C{keyboardBaseOctave}</span>
                <span className="text-slate-500 text-[10px]"> - </span>
                <span className="text-purple-300 font-semibold">
                  C{keyboardBaseOctave + (is3Oct ? 3 : 2)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOctaveUp}
                disabled={keyboardBaseOctave >= (is3Oct ? 4 : 6)}
                aria-label="Geser Oktaf Naik (Panah Kanan)"
                title="Geser Oktaf Naik (Panah Kanan)"
                className="p-1 rounded hover:bg-slate-800 active:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setKeyboardGuide(false)}
              aria-label="Tutup jendela panduan keyboard"
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Key Visualizer - Exact 2 Rows Stacked Vertically */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* BARIS 1: UPPER ROW (Baris Atas QWERTY) */}
          <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" aria-hidden="true" />
                {topRowLabel}
              </span>
              <span className="text-[10px] text-slate-400">
                Baris Atas Keyboard
              </span>
            </div>

            {/* Black keys row */}
            <div className="flex gap-1 pl-3.5 mb-1 overflow-x-auto">
              {topRowBlackKeys.map((k, idx) => {
                if (!k) {
                  return <div key={`gap-top-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" aria-hidden="true" />;
                }
                const midi = baseMidi + k.offset;
                const isPressed = activeMidis.has(midi);
                const noteOctave = getNoteOctave(k.offset);
                return (
                  <button
                    key={k.code}
                    type="button"
                    onPointerDown={() => playNote(k.offset)}
                    onPointerUp={() => stopNote(k.offset)}
                    onPointerLeave={() => stopNote(k.offset)}
                    aria-label={`Tombol ${k.keyLabel}, not ${k.note}${noteOctave}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded flex flex-col items-center justify-center font-mono border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 ${
                      isPressed
                        ? 'bg-purple-500 text-slate-950 font-bold border-white'
                        : 'bg-slate-900 text-purple-200 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[8px] opacity-80 leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>

            {/* White keys row */}
            <div className="flex gap-1 overflow-x-auto">
              {topRowWhiteKeys.map((k) => {
                const midi = baseMidi + k.offset;
                const isPressed = activeMidis.has(midi);
                const noteOctave = getNoteOctave(k.offset);
                return (
                  <button
                    key={k.code}
                    type="button"
                    onPointerDown={() => playNote(k.offset)}
                    onPointerUp={() => stopNote(k.offset)}
                    onPointerLeave={() => stopNote(k.offset)}
                    aria-label={`Tombol ${k.keyLabel}, not ${k.note}${noteOctave}`}
                    className={`w-7 h-8 sm:w-8 sm:h-9 shrink-0 rounded flex flex-col items-center justify-center font-mono border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 ${
                      isPressed
                        ? 'bg-purple-400 text-slate-950 font-bold border-white'
                        : 'bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[8px] text-purple-300 font-semibold leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BARIS 2: LOWER ROW (Baris Bawah ZXCV) */}
          <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-semibold text-sky-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" aria-hidden="true" />
                {bottomRowLabel}
              </span>
              <span className="text-[10px] text-slate-400">
                Baris Bawah Keyboard
              </span>
            </div>

            {/* Black keys row */}
            <div className="flex gap-1 pl-3.5 mb-1 overflow-x-auto">
              {bottomRowBlackKeys.map((k, idx) => {
                if (!k) {
                  return <div key={`gap-bottom-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" aria-hidden="true" />;
                }
                const midi = baseMidi + k.offset;
                const isPressed = activeMidis.has(midi);
                const noteOctave = getNoteOctave(k.offset);
                return (
                  <button
                    key={k.code}
                    type="button"
                    onPointerDown={() => playNote(k.offset)}
                    onPointerUp={() => stopNote(k.offset)}
                    onPointerLeave={() => stopNote(k.offset)}
                    aria-label={`Tombol ${k.keyLabel}, not ${k.note}${noteOctave}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded flex flex-col items-center justify-center font-mono border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                      isPressed
                        ? 'bg-sky-500 text-slate-950 font-bold border-white'
                        : 'bg-slate-900 text-sky-200 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[8px] opacity-80 leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>

            {/* White keys row */}
            <div className="flex gap-1 overflow-x-auto">
              {bottomRowWhiteKeys.map((k) => {
                const midi = baseMidi + k.offset;
                const isPressed = activeMidis.has(midi);
                const noteOctave = getNoteOctave(k.offset);
                return (
                  <button
                    key={k.code}
                    type="button"
                    onPointerDown={() => playNote(k.offset)}
                    onPointerUp={() => stopNote(k.offset)}
                    onPointerLeave={() => stopNote(k.offset)}
                    aria-label={`Tombol ${k.keyLabel}, not ${k.note}${noteOctave}`}
                    className={`w-7 h-8 sm:w-8 sm:h-9 shrink-0 rounded flex flex-col items-center justify-center font-mono border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                      isPressed
                        ? 'bg-sky-400 text-slate-950 font-bold border-white'
                        : 'bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[8px] text-sky-300 font-semibold leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-semibold border border-slate-700">◄ ►</kbd>
            <span>Gunakan panah kiri / kanan untuk menggeser oktaf (tombol Esc untuk tutup)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Info size={13} className="text-sky-400" aria-hidden="true" />
            <span>Label juga tampil langsung di tuts piano</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
