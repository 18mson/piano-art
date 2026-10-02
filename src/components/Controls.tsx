'use client';

import React, { useEffect, useState } from 'react';
import { usePianoStore } from '../store/pianoStore';
import { webMidiHandler, MidiDeviceState } from '../lib/input/midi';
import { Volume2, Music, Sparkles, Sliders, Radio, AlertCircle, Keyboard } from 'lucide-react';

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

  const [windowWidth, setWindowWidth] = useState(1024);
  const [midiState, setMidiState] = useState<MidiDeviceState>({
    isSupported: false,
    isConnected: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      const mobile = w < 768 || window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const unsubMidi = webMidiHandler.subscribe((state) => {
      setMidiState(state);
    });
    webMidiHandler.init();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      unsubMidi();
    };
  }, [setIsMobile]);

  // Options configuration
  const mobileOptions: (number | 'all')[] = [1, 2, 3, 4];
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
    <div className="w-full bg-slate-950/90 backdrop-blur-md px-3 py-2 border-b border-slate-800 text-slate-200 flex flex-wrap items-center justify-between gap-2 z-20 select-none">
      {/* Left: Octave Selection & Warning */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sliders size={13} className="text-cyan-400" />
          Octaves:
        </span>
        <div className="flex items-center bg-slate-900/90 rounded border border-slate-800 p-0.5 gap-0.5">
          {options.map((opt) => {
            const isSelected = octaves === opt;
            const w = getKeyWidthForOption(opt);
            const isTooNarrow = w < minKeyWidth;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setOctaves(opt)}
                title={
                  isTooNarrow
                    ? `Warning: Key width (${Math.round(w)}px) is below recommended ${minKeyWidth}px`
                    : `${opt === 'all' ? 'All 88 Keys' : `${opt} Octaves`}`
                }
                className={`px-2.5 py-1 text-xs font-mono rounded transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-bold'
                    : isTooNarrow
                    ? 'text-amber-400/80 hover:bg-slate-800/80 hover:text-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {opt === 'all' ? '88' : `${opt} Oct`}
                {isTooNarrow && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
              </button>
            );
          })}
        </div>

        {isWidthNarrow && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded animate-pulse">
            <AlertCircle size={12} />
            <span>Narrow keys ({Math.round(currentKeyWidth)}px &lt; {minKeyWidth}px)</span>
          </div>
        )}
      </div>

      {/* Right: Sustain, Labels, MIDI status */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sustain Pedal Toggle */}
        <button
          type="button"
          onClick={toggleSustain}
          title="Toggle Sustain Pedal (Holds notes after release)"
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded border transition-all ${
            sustain
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              sustain ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-600'
            }`}
          />
          Sustain
        </button>

        {/* Note Labels Toggle */}
        <button
          type="button"
          onClick={toggleNoteNames}
          title="Toggle Note Names on Keys"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-all ${
            showNoteNames
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Music size={13} className={showNoteNames ? 'text-purple-400' : 'text-slate-500'} />
          Notes
        </button>

        {/* PC Keys On-Canvas Badges Toggle (Desktop) */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleKeyboardShortcuts}
            title="Tampilkan / Sembunyikan Label Huruf Keyboard PC di Tuts Piano"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-all ${
              showKeyboardShortcuts
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-semibold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Keyboard size={13} className={showKeyboardShortcuts ? 'text-cyan-400' : 'text-slate-500'} />
            Tombol PC
          </button>
        )}

        {/* PC Keyboard Guide Panel Toggle (Desktop) */}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleKeyboardGuide}
            title="Tampilkan / Sembunyikan Panduan Visual Keyboard PC"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-all ${
              showKeyboardGuide
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)] font-semibold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles size={13} className={showKeyboardGuide ? 'text-blue-400' : 'text-slate-500'} />
            Panduan
          </button>
        )}

        {/* MIDI Connection Indicator */}
        {midiState.isSupported && (
          <div
            title={midiState.isConnected ? `Connected: ${midiState.deviceName}` : 'Web MIDI ready (connect any USB/Bluetooth MIDI keyboard)'}
            className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono rounded border ${
              midiState.isConnected
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
                : 'bg-slate-900/60 text-slate-500 border-slate-800/60'
            }`}
          >
            <Radio size={12} className={midiState.isConnected ? 'text-cyan-400 animate-pulse' : 'text-slate-600'} />
            <span className="hidden sm:inline">
              {midiState.isConnected ? (midiState.deviceName?.split(' ')[0] || 'MIDI') : 'MIDI'}
            </span>
          </div>
        )}

        {/* Audio Engine Status */}
        <div
          title={audioReady ? 'Salamander Grand Piano samples loaded' : 'Audio engine loading...'}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded border border-slate-800 bg-slate-900/50 text-slate-400"
        >
          <Volume2 size={12} className={audioReady ? 'text-emerald-400' : 'text-amber-400 animate-pulse'} />
          <span className="text-[10px] hidden md:inline">
            {audioReady ? 'Grand Piano' : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
};
