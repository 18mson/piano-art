'use client';

import React, { useState } from 'react';
import { useSongStore } from '../store/songStore';
import { SONGS_CATALOG } from '../lib/songs/catalog';
import { DifficultyLevel, Song } from '../lib/songs/types';
import { Music, X, Play, Clock, Sparkles, Star, Flame, BarChart2 } from 'lucide-react';

export const SongSelectorModal: React.FC = () => {
  const { isSelectorOpen, closeSelector, selectSong, activeSong } = useSongStore();
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'All'>('All');

  if (!isSelectorOpen) return null;

  const filteredSongs = SONGS_CATALOG.filter((song) => {
    if (filterDifficulty === 'All') return true;
    return song.difficulty === filterDifficulty;
  });

  const getDifficultyBadge = (difficulty: DifficultyLevel, stars: number) => {
    const starIcons = Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        className={i < stars ? 'fill-current' : 'opacity-25'}
      />
    ));

    switch (difficulty) {
      case 'Easy':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Mudah
            </span>
            <div className="flex text-emerald-400">{starIcons}</div>
          </div>
        );
      case 'Normal':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              Sedang
            </span>
            <div className="flex text-sky-400">{starIcons}</div>
          </div>
        );
      case 'Hard':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Sulit
            </span>
            <div className="flex text-purple-400">{starIcons}</div>
          </div>
        );
      case 'Expert':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Ahli
            </span>
            <div className="flex text-rose-400">{starIcons}</div>
          </div>
        );
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                Pilih Lagu (Falling Notes)
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                  Synthesia
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pilih lagu favorit untuk panduan not jatuh dan belajar piano
              </p>
            </div>
          </div>
          <button
            onClick={closeSelector}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-800/60 bg-slate-950/30 overflow-x-auto">
          {(['All', 'Easy', 'Normal', 'Hard'] as const).map((tab) => {
            const isActive = filterDifficulty === tab;
            const labels: Record<string, string> = {
              All: 'Semua Lagu',
              Easy: 'Mudah',
              Normal: 'Sedang',
              Hard: 'Sulit',
            };
            return (
              <button
                key={tab}
                onClick={() => setFilterDifficulty(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Song Cards List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
          {filteredSongs.map((song) => {
            const isSelected = activeSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-950/40 to-cyan-950/30 border-purple-500/50 shadow-lg shadow-purple-950/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm md:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                        {song.title}
                      </h3>
                      {song.subTitle && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({song.subTitle})
                        </span>
                      )}
                      {getDifficultyBadge(song.difficulty, song.stars)}
                    </div>

                    <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-2">
                      <span className="text-cyan-400">{song.artist}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock size={12} className="text-slate-500" />
                        {formatDuration(song.duration)}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {song.bpm} BPM
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {song.notes.length} Not
                      </span>
                    </div>

                    {song.description && (
                      <p className="text-[11px] text-slate-400/90 line-clamp-2">
                        {song.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center sm:self-center">
                    <button
                      onClick={() => selectSong(song)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/25 ring-2 ring-purple-400/30'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-500/20'
                      }`}
                    >
                      <Play size={13} className="fill-current" />
                      <span>{isSelected ? 'Sedang Diputar' : 'Pilih & Mainkan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tersedia 2 Mode: Mode Dengar (Auto) &amp; Mode Latihan (Play-along)</span>
          <button
            onClick={closeSelector}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
