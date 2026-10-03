'use client';

import React, { useState, useEffect } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { inputDispatcher } from '../lib/input/dispatcher';
import { isThreeOctavesMode } from '../lib/input/keyboard';
import { Keyboard, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

interface KeyCapDef {
  code: string;
  keyLabel: string;
  note: string;
  isBlack: boolean;
  offset: number; // Semitone offset from base C
  row: 'upper' | 'lower';
}

// ===============================================
// 2-OCTAVE LAYOUT DEFINITIONS (For 1 & 2 octaves)
// ===============================================
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

// ===============================================
// 3-OCTAVE CHROMATIC LAYOUT DEFINITIONS (For 3+ octaves)
// Lower Pair: Z.. / (white) + S.. ; (black)
// Upper Pair: Q.. ] (white) + 2.. - (black)
// ===============================================
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
  null, // gap between E and F (C and V)
  { code: 'KeyG', keyLabel: 'G', note: 'F#', isBlack: true, offset: 6, row: 'lower' },
  { code: 'KeyH', keyLabel: 'H', note: 'G#', isBlack: true, offset: 8, row: 'lower' },
  { code: 'KeyJ', keyLabel: 'J', note: 'A#', isBlack: true, offset: 10, row: 'lower' },
  null, // gap between B and C (M and ,)
  { code: 'KeyL', keyLabel: 'L', note: 'C#', isBlack: true, offset: 13, row: 'lower' },
  { code: 'Semicolon', keyLabel: ';', note: 'D#', isBlack: true, offset: 15, row: 'lower' },
  null, // gap after D#
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
  null, // gap between B and C (R and T)
  { code: 'Digit6', keyLabel: '6', note: 'C#', isBlack: true, offset: 25, row: 'upper' },
  { code: 'Digit7', keyLabel: '7', note: 'D#', isBlack: true, offset: 27, row: 'upper' },
  null, // gap between E and F (U and I)
  { code: 'Digit9', keyLabel: '9', note: 'F#', isBlack: true, offset: 30, row: 'upper' },
  { code: 'Digit0', keyLabel: '0', note: 'G#', isBlack: true, offset: 32, row: 'upper' },
  { code: 'Minus', keyLabel: '-', note: 'A#', isBlack: true, offset: 34, row: 'upper' },
  null, // gap between B and C ([ and ])
  null,
];

export const KeyboardGuide: React.FC = () => {
  const {
    octaves,
    keyboardBaseOctave,
    setKeyboardBaseOctave,
    showKeyboardGuide,
    setKeyboardGuide,
    isMobile,
  } = usePianoStore();

  const [activeMidis, setActiveMidis] = useState<Set<number>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  if (isMobile || !showKeyboardGuide) {
    return null;
  }

  const is3Oct = isThreeOctavesMode(octaves);
  const baseMidi = (keyboardBaseOctave + 1) * 12;

  const lowerWhiteKeys = is3Oct ? LOWER_KEYS_3OCT : LOWER_KEYS_2OCT;
  const lowerBlackKeys = is3Oct ? LOWER_BLACK_KEYS_3OCT : LOWER_BLACK_KEYS_2OCT;
  const upperWhiteKeys = is3Oct ? UPPER_KEYS_3OCT : UPPER_KEYS_2OCT;
  const upperBlackKeys = is3Oct ? UPPER_BLACK_KEYS_3OCT : UPPER_BLACK_KEYS_2OCT;

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
    <aside
      aria-label="Panduan Tombol Keyboard PC"
      className="absolute top-10 left-1/2 -translate-x-1/2 z-30 max-w-5xl w-[96%] sm:w-auto bg-slate-950/92 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-3 text-slate-200 select-none transition-all duration-200"
    >
      {/* Header bar */}
      <header className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Keyboard size={15} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-white flex items-center gap-1.5 leading-none">
              <span>PANDUAN KEYBOARD PC</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-normal">
                {is3Oct ? '3 Oktaf Penuh' : '2 Oktaf'}
              </span>
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {is3Oct
                ? 'Layout 3 Oktaf: Baris Bawah (Z–/) & Baris Atas (Q–])'
                : 'Tekan huruf di keyboard Anda sesuai label di bawah & di tuts piano'}
            </p>
          </div>
        </div>

        {/* Octave controls & minimize/close */}
        <div className="flex items-center gap-2">
          {/* Octave Shifter */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 gap-1.5">
            <button
              type="button"
              onClick={handleOctaveDown}
              disabled={keyboardBaseOctave <= 1}
              title="Geser Oktaf Turun (Tombol Panah Kiri ◄)"
              className="p-1 rounded hover:bg-slate-800 active:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-center font-mono text-[11px] leading-tight px-1">
              <span className="text-slate-400 text-[9px] block">RANGE OKTAF</span>
              <span className="text-cyan-300 font-bold">C{keyboardBaseOctave}</span>
              <span className="text-slate-500 text-[10px]"> – </span>
              <span className="text-purple-300 font-bold">
                C{keyboardBaseOctave + (is3Oct ? 3 : 2)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOctaveUp}
              disabled={keyboardBaseOctave >= (is3Oct ? 4 : 6)}
              title="Geser Oktaf Naik (Tombol Panah Kanan ►)"
              className="p-1 rounded hover:bg-slate-800 active:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Minimize / Expand */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Buka Panduan' : 'Perkecil Panduan'}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            {isCollapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setKeyboardGuide(false)}
            title="Tutup Panduan (Bisa diaktifkan lagi di tombol PC Keys atas)"
            className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* Expandable Key Visualizer */}
      {!isCollapsed && (
        <div className="mt-2.5 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Section 1: Lower Keys */}
          <div className="flex-1 bg-slate-900/60 p-2 rounded-lg border border-cyan-950/80">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {is3Oct ? `Oktaf Bawah (C${keyboardBaseOctave}..E${keyboardBaseOctave + 1})` : `Oktaf Bawah (C${keyboardBaseOctave})`}
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {is3Oct ? 'Baris Bawah (Z - /)' : 'Baris Atas (Q - U)'}
              </span>
            </div>

            {/* Black keys row */}
            <div className="flex gap-1 pl-4 mb-1">
              {lowerBlackKeys.map((k, idx) => {
                if (!k) {
                  return <div key={`gap-lower-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex flex-col items-center justify-center font-mono border transition-all ${
                      isPressed
                        ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_10px_#06b6d4] scale-95'
                        : 'bg-slate-950 text-cyan-300 border-cyan-800/80 hover:border-cyan-400'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[7px] sm:text-[8px] opacity-70 leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>

            {/* White keys row */}
            <div className="flex gap-1">
              {lowerWhiteKeys.map((k) => {
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
                    className={`w-7 h-8 sm:w-8 sm:h-9 rounded flex flex-col items-center justify-center font-mono border transition-all ${
                      isPressed
                        ? 'bg-cyan-400 text-slate-950 border-white shadow-[0_0_10px_#22d3ee] scale-95'
                        : 'bg-slate-800/90 text-white border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <span className="text-[11px] sm:text-[12px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[7px] sm:text-[8px] text-cyan-300 font-semibold leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Upper Keys */}
          <div className="flex-1 bg-slate-900/60 p-2 rounded-lg border border-purple-950/80">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {is3Oct ? `Oktaf Atas (F${keyboardBaseOctave + 1}..C${keyboardBaseOctave + 3})` : `Oktaf Atas (C${keyboardBaseOctave + 1})`}
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {is3Oct ? 'Baris Atas (Q - ])' : 'Baris Bawah (C - /)'}
              </span>
            </div>

            {/* Black keys row */}
            <div className="flex gap-1 pl-4 mb-1">
              {upperBlackKeys.map((k, idx) => {
                if (!k) {
                  return <div key={`gap-upper-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex flex-col items-center justify-center font-mono border transition-all ${
                      isPressed
                        ? 'bg-purple-500 text-slate-950 border-white shadow-[0_0_10px_#a855f7] scale-95'
                        : 'bg-slate-950 text-purple-300 border-purple-800/80 hover:border-purple-400'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[7px] sm:text-[8px] opacity-70 leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>

            {/* White keys row */}
            <div className="flex gap-1">
              {upperWhiteKeys.map((k) => {
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
                    className={`w-7 h-8 sm:w-8 sm:h-9 rounded flex flex-col items-center justify-center font-mono border transition-all ${
                      isPressed
                        ? 'bg-purple-400 text-slate-950 border-white shadow-[0_0_10px_#c084fc] scale-95'
                        : 'bg-slate-800/90 text-white border-slate-700 hover:border-purple-400'
                    }`}
                  >
                    <span className="text-[11px] sm:text-[12px] font-bold leading-none">{k.keyLabel}</span>
                    <span className="text-[7px] sm:text-[8px] text-purple-300 font-semibold leading-none mt-0.5">{k.note}{noteOctave}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer shortcut tips */}
      {!isCollapsed && (
        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">◄ ►</span>
            <span>Gunakan tombol panah kiri/kanan di keyboard PC untuk geser oktaf</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-500">
            <Sparkles size={11} className="text-cyan-400" />
            <span>Label huruf juga tampil langsung di tuts piano</span>
          </div>
        </div>
      )}
    </aside>
  );
};
