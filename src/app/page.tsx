'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MiniMap } from '../components/MiniMap';
import { Controls } from '../components/Controls';
import { KeyboardGuide } from '../components/KeyboardGuide';
import { SongSelectorModal } from '../components/SongSelectorModal';
import { SongPlayerBar } from '../components/SongPlayerBar';
import { usePianoStore } from '../store/pianoStore';
import { audioEngine } from '../lib/audio';
import { isThreeOctavesMode } from '../lib/input/keyboard';
import { Play, Music2, Keyboard } from 'lucide-react';

const DynamicPianoCanvas = dynamic(
  () => import('../components/PianoCanvas').then((m) => m.PianoCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 w-full h-full bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat mesin piano...
      </div>
    ),
  }
);

export default function Home() {
  const {
    octaves,
    isAudioStarted,
    setAudioStarted,
    setAudioReady,
    keyboardBaseOctave,
    isMobile,
  } = usePianoStore();

  const [, setIsPortrait] = useState(false);

  useEffect(() => {
    // Check orientation
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 800;
        setIsPortrait(portrait);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Subscribe to audio engine status
    const unsubAudio = audioEngine.subscribe((state) => {
      setAudioReady(state.isReady, state.loadProgress);
    });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      unsubAudio();
    };
  }, [setAudioReady]);

  const handleStartAudio = async () => {
    setAudioStarted(true);
    await audioEngine.initAudio();
  };

  return (
    <main className="relative flex flex-col w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Section: Unified Header Shell (MiniMap, Controls, and Docked Player Bar) */}
      <header className="flex flex-col shrink-0 z-20">
        <MiniMap />
        <Controls />
        <SongPlayerBar />
      </header>

      {/* Main Piano Canvas - 100% Unobstructed playing area */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        <DynamicPianoCanvas />

        {/* Desktop Keyboard Range Reminder Badge */}
        {!isMobile && (
          <div className="absolute top-2 left-3 pointer-events-none bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-xs text-slate-300 flex items-center gap-2 z-10 shadow-sm">
            <Keyboard size={13} className="text-sky-400 shrink-0" aria-hidden="true" />
            {isThreeOctavesMode(octaves) ? (
              <span className="leading-tight text-[11px]">
                Tombol PC (3 Oktaf):{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-sky-200">
                  Z - /
                </kbd>{' '}
                (C{keyboardBaseOctave}) &amp;{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-purple-200">
                  Q - ]
                </kbd>{' '}
                (F{keyboardBaseOctave + 1}..C{keyboardBaseOctave + 3}) • Geser Oktaf:{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">
                  ◄ ►
                </kbd>
              </span>
            ) : (
              <span className="leading-tight text-[11px]">
                Tombol PC (2 Oktaf):{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-sky-200">
                  Q - U
                </kbd>{' '}
                (C{keyboardBaseOctave}) &amp;{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-purple-200">
                  C - /
                </kbd>{' '}
                (C{keyboardBaseOctave + 1}) • Geser Oktaf:{' '}
                <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">
                  ◄ ►
                </kbd>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialogs (Rendered at top level with full screen backdrops) */}
      <KeyboardGuide />
      <SongSelectorModal />

      {/* Initial User Gesture Audio Overlay */}
      {!isAudioStarted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={handleStartAudio}
          onTouchStart={handleStartAudio}
          className="absolute inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center cursor-pointer p-4 select-none touch-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl space-y-5"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
              <Music2 size={26} aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 id="welcome-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Grand Piano
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Instrumen piano digital dengan sampel autentik Salamander Grand Piano.
                Tekan tombol di bawah atau ketuk layar untuk mengaktifkan suara.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartAudio}
              className="w-full py-3 px-5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Play size={16} className="fill-current" aria-hidden="true" />
              <span>Mulai Memainkan Piano</span>
            </button>

            <div className="pt-2 border-t border-slate-800/80 w-full text-xs text-slate-400 space-y-1">
              <p>Mendukung Multi-touch chords, Keyboard PC, dan MIDI Controller</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
