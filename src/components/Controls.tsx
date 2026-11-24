'use client';

import React, { useEffect, useState } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { useSongStore } from '../store/songStore';
import { webMidiHandler, MidiDeviceState } from '../lib/input/midi';
import {
  Volume2,
  Music,
  SlidersHorizontal,
  Radio,
  AlertCircle,
  Keyboard,
  Maximize,
  Minimize,
  Disc3,
  BookOpen,
} from 'lucide-react';

export const Controls: React.FC = () => {
  const {
    octaves,
    setOctaves,
    showNoteNames,
    toggleNoteNames,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts,
    showKeyboardGuide,
    toggleKeyboardGuide,
    sustain,
    toggleSustain,
    audioReady,
    isMobile,
    setIsMobile,
  } = usePianoStore();

  const { openSelector, activeSong } = useSongStore();

  const [windowWidth, setWindowWidth] = useState(1024);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [midiState, setMidiState] = useState<MidiDeviceState>({
    isSupported: false,
    isConnected: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWindowWidth(w);
      const mobile = w < 768 || window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
      setIsPortrait(h > w && mobile);
      setIsFullscreen(!!document.fullscreenElement);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    const unsubMidi = webMidiHandler.subscribe((state) => {
      setMidiState(state);
    });
    webMidiHandler.init();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      unsubMidi();
    };
  }, [setIsMobile]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
        if ('orientation' in screen && 'lock' in (screen.orientation as any)) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {}
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e);
    }
  };

  // Options configuration
  const mobilePortraitOptions: (number | 'all')[] = [1, 2, 3];
  const mobileLandscapeOptions: (number | 'all')[] = [1, 2, 3, 4, 5];
  const mobileOptions: (number | 'all')[] = isPortrait ? mobilePortraitOptions : mobileLandscapeOptions;
  const desktopOptions: (number | 'all')[] = [1, 2, 3, 4, 5, 6, 7, 'all'];
  const options = isMobile ? mobileOptions : desktopOptions;

  // Key width warning threshold
  const minKeyWidth = isMobile ? 32 : 24;

  const getKeyWidthForOption = (opt: number | 'all') => {
    const whiteKeys = opt === 'all' ? 52 : opt * 7 + 1;
    return windowWidth / whiteKeys;
  };

  const currentKeyWidth = getKeyWidthForOption(octaves);
  const isWidthNarrow = currentKeyWidth < minKeyWidth;

  return (
    <nav
      aria-label="Pengaturan Instrumen"
      className="w-full bg-slate-900/95 border-b border-slate-800/90 px-3 py-1.5 text-slate-200 flex flex-wrap items-center justify-between gap-2 z-20 select-none safe-p-left safe-p-right"
    >
      {/* Left: Octave Selection & Warning */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <SlidersHorizontal size={14} className="text-slate-400" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">
            Oktaf
          </span>
        </div>

        <div
          role="group"
          aria-label="Pilihan rentang oktaf"
          className="flex items-center bg-slate-950/80 rounded-md border border-slate-800 p-0.5 gap-0.5"
        >
          {options.map((opt) => {
            const isSelected = octaves === opt;
            const w = getKeyWidthForOption(opt);
            const isTooNarrow = w < minKeyWidth;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setOctaves(opt)}
                aria-pressed={isSelected}
                title={
                  isTooNarrow
                    ? `Perhatian: Lebar tuts (${Math.round(w)}px) di bawah anjuran ${minKeyWidth}px`
                    : opt === 'all'
                    ? '88 Tuts Lengkap'
                    : `${opt} Oktaf`
                }
                className={`min-h-[32px] sm:min-h-[28px] px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                  isSelected
                    ? 'bg-slate-800 text-sky-300 border border-sky-400/60 font-semibold'
                    : isTooNarrow
                    ? 'text-amber-400/90 hover:bg-slate-800/80 hover:text-amber-300'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <span className="font-mono text-[11px]">
                  {opt === 'all' ? '88' : `${opt} Oct`}
                </span>
                {isTooNarrow && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
              </button>
            );
          })}
        </div>

        {isWidthNarrow && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/50 border border-amber-800/70 px-2 py-0.5 rounded">
            <AlertCircle size={13} aria-hidden="true" />
            <span>Tuts rapat ({Math.round(currentKeyWidth)}px)</span>
          </div>
        )}
      </div>

      {/* Right: Songs, Sustain, Labels, MIDI status */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Falling Notes Song Selection Button */}
        <button
          type="button"
          onClick={openSelector}
          aria-haspopup="dialog"
          title="Buka pilihan lagu untuk panduan not jatuh"
          className={`min-h-[32px] sm:min-h-[28px] flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
            activeSong
              ? 'bg-slate-800 text-sky-200 border-sky-500/70'
              : 'bg-slate-950/70 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600 hover:bg-slate-800/70'
          }`}
        >
          <Disc3
            size={13}
            className={`text-sky-400 ${activeSong ? 'animate-spin' : ''}`}
            style={{ animationDuration: '4s' }}
            aria-hidden="true"
          />
          <span>{activeSong ? (activeSong.title.length > 14 ? `${activeSong.title.slice(0, 12)}…` : activeSong.title) : 'Pilih Lagu'}</span>
        </button>

        {/* Sustain Pedal Toggle */}
        <button
          type="button"
          onClick={toggleSustain}
          aria-pressed={sustain}
          title="Pedal Sustain (tahan nada setelah tuts dilepas)"
          className={`min-h-[32px] sm:min-h-[28px] flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
            sustain
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/70 font-semibold'
              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              sustain ? 'bg-emerald-400' : 'bg-slate-600'
            }`}
            aria-hidden="true"
          />
          <span>Sustain</span>
        </button>

        {/* Note Labels Toggle */}
        <button
          type="button"
          onClick={toggleNoteNames}
          aria-pressed={showNoteNames}
          title="Tampilkan label nama not pada tuts piano"
          className={`min-h-[32px] sm:min-h-[28px] flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
            showNoteNames
              ? 'bg-slate-800 text-sky-200 border-sky-500/60 font-semibold'
              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Music size={13} className={showNoteNames ? 'text-sky-400' : 'text-slate-500'} aria-hidden="true" />
          <span>Nama Not</span>
        </button>

        {/* PC Keys On-Canvas Badges Toggle (Desktop) */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleKeyboardShortcuts}
            aria-pressed={showKeyboardShortcuts}
            title="Tampilkan huruf keyboard PC di atas tuts piano"
            className={`min-h-[28px] flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
              showKeyboardShortcuts
                ? 'bg-slate-800 text-sky-200 border-sky-500/60 font-semibold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Keyboard size={13} className={showKeyboardShortcuts ? 'text-sky-400' : 'text-slate-500'} aria-hidden="true" />
            <span>Label PC</span>
          </button>
        )}

        {/* PC Keyboard Guide Panel Toggle (Desktop) */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleKeyboardGuide}
            aria-pressed={showKeyboardGuide}
            title="Buka panduan visual tuts keyboard PC"
            className={`min-h-[28px] flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
              showKeyboardGuide
                ? 'bg-slate-800 text-sky-200 border-sky-500/60 font-semibold'
                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen size={13} className={showKeyboardGuide ? 'text-sky-400' : 'text-slate-500'} aria-hidden="true" />
            <span>Panduan</span>
          </button>
        )}

        {/* Fullscreen / Rotate Toggle for Mobile */}
        {isMobile && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Keluar Layar Penuh' : (isPortrait ? 'Putar ke Layar Penuh Horizontal' : 'Layar Penuh')}
            title={isFullscreen ? 'Keluar Layar Penuh' : (isPortrait ? 'Putar ke Layar Penuh Horizontal' : 'Layar Penuh')}
            className={`min-h-[32px] flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
              isFullscreen
                ? 'bg-slate-800 text-sky-200 border-sky-500/60 font-semibold'
                : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            {isFullscreen ? <Minimize size={14} aria-hidden="true" /> : <Maximize size={14} aria-hidden="true" />}
            <span>{isPortrait ? 'Miring' : 'Penuh'}</span>
          </button>
        )}

        {/* MIDI Connection Indicator */}
        {midiState.isSupported && (
          <div
            title={midiState.isConnected ? `Terhubung: ${midiState.deviceName}` : 'Web MIDI siap (sambungkan keyboard MIDI USB atau Bluetooth)'}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border ${
              midiState.isConnected
                ? 'bg-sky-950/60 text-sky-300 border-sky-800/80 font-medium'
                : 'bg-slate-950/50 text-slate-500 border-slate-800'
            }`}
          >
            <Radio size={12} className={midiState.isConnected ? 'text-sky-400' : 'text-slate-600'} aria-hidden="true" />
            <span className="hidden sm:inline">
              {midiState.isConnected ? (midiState.deviceName?.split(' ')[0] || 'MIDI') : 'MIDI'}
            </span>
          </div>
        )}

        {/* Audio Engine Status */}
        <div
          title={audioReady ? 'Sampel Salamander Grand Piano siap' : 'Memuat sampel audio...'}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-slate-800 bg-slate-950/50 text-slate-400"
        >
          <Volume2 size={13} className={audioReady ? 'text-emerald-400' : 'text-amber-400'} aria-hidden="true" />
          <span className="text-[11px] hidden md:inline">
            {audioReady ? 'Grand Piano' : 'Memuat audio...'}
          </span>
        </div>
      </div>
    </nav>
  );
};
