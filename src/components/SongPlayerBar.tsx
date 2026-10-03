'use client';

import React from 'react';
import { useSongStore } from '../store/songStore';
import { Play, Pause, RotateCcw, X, Music, Headphones, Gamepad2, Gauge, Star } from 'lucide-react';

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
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = () => {
    switch (activeSong.difficulty) {
      case 'Easy':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Mudah (⭐)
          </span>
        );
      case 'Normal':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Sedang (⭐⭐⭐)
          </span>
        );
      case 'Hard':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Sulit (⭐⭐⭐⭐)
          </span>
        );
      case 'Expert':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Ahli (⭐⭐⭐⭐⭐)
          </span>
        );
    }
  };

  return (
    <div className="absolute top-2 left-2 right-2 md:left-auto md:right-4 z-30 max-w-xl md:w-[480px] bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 transition-all">
      {/* Top row: Song info & close */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Music size={12} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-slate-100 truncate">
                {activeSong.title}
              </span>
              {getDifficultyBadge()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate block">
              {activeSong.artist} • {activeSong.bpm} BPM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={openSelector}
            className="px-2 py-1 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 transition"
            title="Ganti Lagu"
          >
            Ganti Lagu
          </button>
          <button
            onClick={closeSong}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Lagu"
            title="Tutup Mode Lagu"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Middle row: Timeline progress scrubber */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0 w-8">
          {formatTime(duration)}
        </span>
      </div>

      {/* Bottom row: Playback controls, Mode switcher, Speed */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60 flex-wrap">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlay}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={12} className="fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play size={12} className="fill-current" />
                <span>Putar</span>
              </>
            )}
          </button>

          <button
            onClick={stop}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Ulangi dari awal"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Mode Toggle: Listen vs Practice */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => setMode('listen')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition ${
              mode === 'listen'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tuts piano berbunyi dan tertekan otomatis"
          >
            <Headphones size={10} />
            <span>Auto</span>
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition ${
              mode === 'practice'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mainkan sendiri mengikuti balok not"
          >
            <Gamepad2 size={10} />
            <span>Latihan</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-0.5 text-[10px] font-mono">
          {[0.75, 1.0, 1.25].map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-1.5 py-0.5 rounded transition ${
                playbackSpeed === spd
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
