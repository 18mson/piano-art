'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MiniMap } from '../components/MiniMap';
import { Controls } from '../components/Controls';
import { KeyboardGuide } from '../components/KeyboardGuide';
import { usePianoStore } from '../store/pianoStore';
import { audioEngine } from '../lib/audio';
import { Play, Sparkles, Keyboard, RotateCcw } from 'lucide-react';

const DynamicPianoCanvas = dynamic(
  () => import('../components/PianoCanvas').then((m) => m.PianoCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 w-full h-full bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-sm">
        Initializing PixiJS Engine...
      </div>
    ),
  }
);

export default function Home() {
  const {
    isAudioStarted,
    setAudioStarted,
    audioReady,
    setAudioReady,
    keyboardBaseOctave,
    isMobile,
  } = usePianoStore();

  const [isPortrait, setIsPortrait] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);

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
      setLoadPercent(state.loadProgress);
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
      {/* Top Section: Mini-map 88-key strip with auto-snap range selector */}
      <MiniMap />

      {/* Middle Top: Controls Bar */}
      <Controls />

      {/* Main Piano Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        <DynamicPianoCanvas />

        {/* Desktop Interactive Keyboard Guide */}
        <KeyboardGuide />

        {/* Keyboard Tracker Bar Hint (Desktop / Large Viewport) */}
        {!isMobile && (
          <div className="absolute top-2 left-3 pointer-events-none bg-slate-950/70 backdrop-blur-sm border border-slate-800/80 px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 flex items-center gap-2 z-10">
            <Keyboard size={13} className="text-cyan-400" />
            <span>
              Tombol PC: <strong className="text-cyan-300 font-normal">Z–M</strong> (C{keyboardBaseOctave}) &amp; <strong className="text-purple-300 font-normal">Q–U</strong> (C{keyboardBaseOctave + 1}) • Geser Oktaf: <strong className="text-amber-300 font-normal">◄ ►</strong>
            </span>
          </div>
        )}

        {/* Portrait Mode Advisory Hint */}
        {isPortrait && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-amber-300 flex items-center gap-2 shadow-lg animate-pulse z-30 pointer-events-none">
            <RotateCcw size={14} />
            <span>Rotate to landscape for the best piano experience</span>
          </div>
        )}
      </div>

      {/* Initial User Gesture Audio Overlay */}
      {!isAudioStarted && (
        <div
          onClick={handleStartAudio}
          className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all p-4 select-none"
        >
          <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-xl p-8 flex flex-col items-center text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Play size={28} className="translate-x-0.5" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center justify-center gap-2">
                <span>PIXEL PIANO</span>
                <Sparkles size={18} className="text-cyan-400" />
              </h1>
              <p className="text-sm font-mono text-slate-400">
                Salamander Grand Piano engine ready.
                <br />
                Tap anywhere to start audio.
              </p>
            </div>

            <button
              type="button"
              className="w-full py-3 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold font-mono text-sm tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"
            >
              START PIANO
            </button>

            <div className="text-[11px] font-mono text-slate-500 space-y-1">
              <p>Supports Multitouch chords, Glissando, Web MIDI, and PC Keyboard</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
