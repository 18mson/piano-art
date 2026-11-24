'use client';

import React from 'react';
import { useSongStore } from '../store/songStore';
import { Play, Pause, RotateCcw, X, Disc3, Headphones, Gamepad2 } from 'lucide-react';

export const SongPlayerBar: React.FC = () => {
  const {
    activeSong,
    isPlaying,
    currentTime,
    playbackSpeed,
    mode,
    togglePlay,
    stop,
    seek,
    closeSong,
    setMode,
    setSpeed,
    openSelector,
  } = useSongStore();

  if (!activeSong) return null;

  const duration = activeSong.duration || 1;

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = () => {
    switch (activeSong.difficulty) {
      case 'Easy':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Mudah
          </span>
        );
      case 'Normal':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
            Sedang
          </span>
        );
      case 'Hard':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            Sulit
          </span>
        );
      case 'Expert':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
            Ahli
          </span>
        );
    }
  };

  return (
    <div
      aria-label="Panel Kontrol Pemutar Lagu"
      className="w-full bg-slate-950 border-b border-slate-800/90 px-3 py-1.5 text-slate-200 flex flex-wrap items-center justify-between gap-2 z-20 select-none safe-p-left safe-p-right"
    >
      {/* Track metadata */}
      <div className="flex items-center gap-2 min-w-0 max-w-full sm:max-w-xs">
        <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          <Disc3
            size={15}
            className={`text-sky-400 ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '3s' }}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs font-semibold text-slate-100 truncate">
              {activeSong.title}
            </span>
            {getDifficultyBadge()}
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {activeSong.artist} • <span className="font-mono">{activeSong.bpm} BPM</span>
          </span>
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-[200px] max-w-xl order-3 sm:order-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Jeda pemutaran lagu' : 'Putar lagu'}
          className={`min-h-[28px] px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 shrink-0 ${
            isPlaying
              ? 'bg-amber-950 text-amber-200 border border-amber-700/80 hover:bg-amber-900'
              : 'bg-sky-600 text-white hover:bg-sky-500'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={12} className="fill-current" aria-hidden="true" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play size={12} className="fill-current" aria-hidden="true" />
              <span>Putar</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={stop}
          className="min-h-[28px] p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 shrink-0"
          aria-label="Ulangi dari awal"
          title="Ulangi dari awal"
        >
          <RotateCcw size={13} aria-hidden="true" />
        </button>

        <span className="text-[11px] font-mono text-slate-400 shrink-0 w-8 text-right">
          {formatTime(currentTime)}
        </span>

        <div className="relative flex-1 flex items-center min-w-[80px]">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={Math.max(0, currentTime)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Posisi waktu pemutaran lagu"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          />
        </div>

        <span className="text-[11px] font-mono text-slate-500 shrink-0 w-8">
          {formatTime(duration)}
        </span>
      </div>

      {/* Mode, Speed, Change, Close */}
      <div className="flex items-center gap-1.5 shrink-0 order-2 sm:order-3">
        {/* Mode Toggle: Listen vs Practice */}
        <div
          role="group"
          aria-label="Pilihan mode pemutaran lagu"
          className="flex items-center rounded-md bg-slate-900 border border-slate-800 p-0.5"
        >
          <button
            type="button"
            onClick={() => setMode('listen')}
            aria-pressed={mode === 'listen'}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
              mode === 'listen'
                ? 'bg-slate-800 text-sky-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tuts piano berbunyi otomatis mengikuti lagu"
          >
            <Headphones size={11} aria-hidden="true" />
            <span className="hidden xs:inline">Otomatis</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('practice')}
            aria-pressed={mode === 'practice'}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
              mode === 'practice'
                ? 'bg-slate-800 text-sky-200 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Latihan bermain mengikuti balok not yang jatuh"
          >
            <Gamepad2 size={11} aria-hidden="true" />
            <span className="hidden xs:inline">Latihan</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div
          role="group"
          aria-label="Kecepatan lagu"
          className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5"
        >
          {[0.75, 1.0, 1.25].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setSpeed(spd)}
              aria-pressed={playbackSpeed === spd}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                playbackSpeed === spd
                  ? 'bg-slate-800 text-sky-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Change song */}
        <button
          type="button"
          onClick={openSelector}
          className="px-2 py-1 rounded text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          title="Ganti Lagu"
        >
          Ganti
        </button>

        {/* Close song mode */}
        <button
          type="button"
          onClick={closeSong}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          aria-label="Tutup Pemutar Lagu"
          title="Tutup Mode Lagu"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
