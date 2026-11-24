'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSongStore } from '../store/songStore';
import { SONGS_CATALOG } from '../lib/songs/catalog';
import { DifficultyLevel } from '../lib/songs/types';
import { parseMidiFile } from '../lib/midi/midiParser';
import { transcribeAudioToPiano } from '../lib/audio/audioTranscriber';
import { Music, X, Play, Clock, Star, Upload, FileAudio, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const SongSelectorModal: React.FC = () => {
  const { isSelectorOpen, closeSelector, selectSong, activeSong, customSongs, importCustomSong } = useSongStore();
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'All' | 'Custom'>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key (R-32)
  useEffect(() => {
    if (!isSelectorOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSelector();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectorOpen, closeSelector]);

  const handleModalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = '';

    setUploadError(null);
    setIsUploading(true);
    setUploadStatus(`Membaca ${file.name}...`);

    try {
      const fileNameLower = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();

      if (fileNameLower.endsWith('.mid') || fileNameLower.endsWith('.midi')) {
        setUploadStatus('Membaca partitur MIDI dan menyusun 88 tuts...');
        await new Promise((r) => setTimeout(r, 60));
        const result = parseMidiFile(arrayBuffer, file.name);
        importCustomSong(result.song);
        setIsUploading(false);
      } else if (
        fileNameLower.endsWith('.mp3') ||
        fileNameLower.endsWith('.wav') ||
        fileNameLower.endsWith('.ogg') ||
        fileNameLower.endsWith('.m4a')
      ) {
        setUploadStatus('Menganalisis audio...');
        const song = await transcribeAudioToPiano(arrayBuffer, file.name, (pct, text) => {
          setUploadStatus(`${text} (${pct}%)`);
        });
        importCustomSong(song);
        setIsUploading(false);
      } else {
        throw new Error('Format tidak didukung. Gunakan file MIDI (.mid) atau Audio (.mp3, .wav).');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file lagu.';
      setUploadError(msg);
      setIsUploading(false);
    }
  };

  if (!isSelectorOpen) return null;

  const allAvailableSongs = [...customSongs, ...SONGS_CATALOG];
  const filteredSongs = allAvailableSongs.filter((song) => {
    if (filterDifficulty === 'All') return true;
    if (filterDifficulty === 'Custom') return customSongs.some((cs) => cs.id === song.id);
    return song.difficulty === filterDifficulty;
  });

  const getDifficultyBadge = (difficulty: DifficultyLevel, stars: number) => {
    const starIcons = Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        className={i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
        aria-hidden="true"
      />
    ));

    switch (difficulty) {
      case 'Easy':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              Mudah
            </span>
            <div className="flex gap-0.5">{starIcons}</div>
          </div>
        );
      case 'Normal':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-950/80 text-sky-300 border border-sky-800/80">
              Sedang
            </span>
            <div className="flex gap-0.5">{starIcons}</div>
          </div>
        );
      case 'Hard':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/80">
              Sulit
            </span>
            <div className="flex gap-0.5">{starIcons}</div>
          </div>
        );
      case 'Expert':
        return (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800/80">
              Ahli
            </span>
            <div className="flex gap-0.5">{starIcons}</div>
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-catalog-title"
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-5"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
              <Music size={16} aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-catalog-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Katalog Lagu
              </h2>
              <p className="text-xs text-slate-400">
                Pilih lagu untuk panduan not jatuh atau latihan memainkan piano
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSelector}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            aria-label="Tutup jendela katalog lagu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <input
          ref={modalFileInputRef}
          type="file"
          accept=".mid,.midi,.mp3,.wav,.ogg,.m4a"
          onChange={handleModalFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {/* Difficulty Filter Tabs */}
        <nav
          aria-label="Filter Tingkat Kesulitan"
          className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-800 bg-slate-950/50 overflow-x-auto"
        >
          {([
            'All',
            ...(customSongs.length > 0 ? (['Custom'] as const) : []),
            'Easy',
            'Normal',
            'Hard',
          ] as const).map((tab) => {
            const isActive = filterDifficulty === tab;
            const labels: Record<string, string> = {
              All: 'Semua Lagu',
              Custom: `Lagu Saya (${customSongs.length})`,
              Easy: 'Mudah',
              Normal: 'Sedang',
              Hard: 'Sulit',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterDifficulty(tab)}
                aria-pressed={isActive}
                className={`min-h-[30px] px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                  isActive
                    ? 'bg-slate-800 text-sky-200 border border-sky-500/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </nav>

        {/* Song Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {/* Upload / Drag & Drop CTA Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                <Upload size={17} aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200">
                  Impor Lagu Sendiri (MIDI atau Audio)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tarik file langsung ke layar atau klik tombol untuk memilih file (.mid, .mp3, .wav).
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => modalFileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Upload size={13} aria-hidden="true" />
                  <span>Pilih File</span>
                </>
              )}
            </button>
          </div>

          {/* Upload Status / Error alert */}
          {uploadStatus && isUploading && (
            <div className="rounded-md border border-sky-800 bg-sky-950/50 p-2.5 text-xs text-sky-200 flex items-center gap-2 animate-pulse">
              <Loader2 size={14} className="animate-spin text-sky-400 shrink-0" aria-hidden="true" />
              <span>{uploadStatus}</span>
            </div>
          )}
          {uploadError && (
            <div className="rounded-md border border-rose-800 bg-rose-950/50 p-2.5 text-xs text-rose-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-400 shrink-0" aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-rose-400 hover:text-white text-xs"
              >
                Tutup
              </button>
            </div>
          )}
          {filteredSongs.map((song) => {
            const isSelected = activeSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`rounded-lg border p-3.5 transition-colors ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500/70'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        {song.title}
                      </h3>
                      {song.subTitle && (
                        <span className="text-xs text-slate-400">
                          ({song.subTitle})
                        </span>
                      )}
                      {getDifficultyBadge(song.difficulty, song.stars)}
                    </div>

                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-2 flex-wrap">
                      <span className="text-slate-300 font-medium">{song.artist}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock size={12} className="text-slate-500" aria-hidden="true" />
                        {formatDuration(song.duration)}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {song.bpm} BPM
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {song.notes.length} Not
                      </span>
                    </div>

                    {song.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {song.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => selectSong(song)}
                      className={`w-full sm:w-auto px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                        isSelected
                          ? 'bg-slate-800 text-sky-200 border border-sky-500/70'
                          : 'bg-sky-600 hover:bg-sky-500 text-white'
                      }`}
                    >
                      <Play size={13} className="fill-current" aria-hidden="true" />
                      <span>{isSelected ? 'Sedang Diputar' : 'Pilih & Mainkan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Dukungan Mode: Otomatis (Dengar) &amp; Latihan (Play-along)</span>
          <button
            type="button"
            onClick={closeSelector}
            className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          >
            Tutup
          </button>
        </footer>
      </div>
    </div>
  );
};
