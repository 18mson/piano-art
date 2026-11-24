'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSongStore } from '../store/songStore';
import { parseMidiFile } from '../lib/midi/midiParser';
import { transcribeAudioToPiano } from '../lib/audio/audioTranscriber';
import { Upload, Music, FileAudio, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface FileDropZoneProps {
  onProcessingChange?: (isProcessing: boolean) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onProcessingChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const { importCustomSong } = useSongStore();

  const updateProcessing = useCallback(
    (processing: boolean) => {
      setIsProcessing(processing);
      onProcessingChange?.(processing);
    },
    [onProcessingChange]
  );

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    updateProcessing(true);
    setProgressPercent(10);
    setStatusMessage(`Membaca file ${file.name}...`);

    try {
      const fileNameLower = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();

      if (fileNameLower.endsWith('.mid') || fileNameLower.endsWith('.midi')) {
        // Fast MIDI parsing
        setStatusMessage('Membaca partitur MIDI dan menyusun 88 tuts...');
        setProgressPercent(50);
        // Small delay to allow UI to render status
        await new Promise((r) => setTimeout(r, 60));

        const result = parseMidiFile(arrayBuffer, file.name);
        setProgressPercent(100);
        setStatusMessage(`Berhasil! Terdeteksi ${result.totalNotes} not piano.`);
        await new Promise((r) => setTimeout(r, 300));

        importCustomSong(result.song);
        updateProcessing(false);
      } else if (
        fileNameLower.endsWith('.mp3') ||
        fileNameLower.endsWith('.wav') ||
        fileNameLower.endsWith('.ogg') ||
        fileNameLower.endsWith('.m4a')
      ) {
        // Audio to Piano transcription
        setStatusMessage('Menyiapkan penganalisis audio...');
        const song = await transcribeAudioToPiano(arrayBuffer, file.name, (pct, text) => {
          setProgressPercent(pct);
          setStatusMessage(text);
        });

        setStatusMessage(`Selesai! Berhasil mengonversi ${song.notes.length} not piano.`);
        await new Promise((r) => setTimeout(r, 350));

        importCustomSong(song);
        updateProcessing(false);
      } else {
        throw new Error(
          'Format file tidak didukung. Silakan gunakan file MIDI (.mid, .midi) atau Audio (.mp3, .wav, .ogg).'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file lagu.';
      setErrorMessage(msg);
      updateProcessing(false);
    }
  };

  // Global drag & drop listeners on window
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleProcessFile(file);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  // Do not render anything if not dragging, not processing, and no error
  if (!isDragOver && !isProcessing && !errorMessage) {
    return (
      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi,.mp3,.wav,.ogg,.m4a"
        onChange={handleManualFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi,.mp3,.wav,.ogg,.m4a"
        onChange={handleManualFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Area Unggah dan Konversi Lagu Piano"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      >
        <div className="relative w-full max-w-lg bg-slate-900 border-2 border-dashed rounded-xl p-6 shadow-2xl flex flex-col items-center text-center transition-all border-sky-400 bg-slate-900/95">
          {/* Close / Dismiss button (when not processing) */}
          {!isProcessing && (
            <button
              type="button"
              onClick={() => {
                setIsDragOver(false);
                setErrorMessage(null);
              }}
              aria-label="Tutup panel"
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}

          {/* Processing State */}
          {isProcessing ? (
            <div className="flex flex-col items-center w-full py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-950/80 border border-sky-700/80 flex items-center justify-center text-sky-400 animate-pulse">
                <Loader2 size={24} className="animate-spin" aria-hidden="true" />
              </div>
              <div className="space-y-1 w-full">
                <h3 className="text-base font-semibold text-slate-100">
                  Mengonversi Lagu ke Piano...
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {statusMessage || 'Menganalisis harmoni dan menyusun tuts piano...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-sky-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-sky-300 font-semibold">
                {progressPercent}%
              </span>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="flex flex-col items-center w-full py-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                <AlertCircle size={24} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-rose-200">
                  Gagal Mengonversi Lagu
                </h3>
                <p className="text-xs text-rose-300/90 max-w-md mx-auto leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
                >
                  Pilih File Lain
                </button>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Active Drag Over State */
            <div className="flex flex-col items-center w-full py-4 space-y-4 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-sky-950/80 border-2 border-sky-500 flex items-center justify-center text-sky-400 animate-bounce">
                <Upload size={28} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Lepaskan Lagu di Sini
                </h3>
                <p className="text-xs text-slate-300">
                  Piano Art akan mengonversinya secara otomatis ke versi piano interaktif.
                </p>
              </div>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200">
                  <Music size={13} className="text-emerald-400" aria-hidden="true" />
                  <span>MIDI (.mid, .midi)</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Instan</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200">
                  <FileAudio size={13} className="text-sky-400" aria-hidden="true" />
                  <span>Audio (.mp3, .wav, .ogg)</span>
                  <span className="text-[10px] text-sky-400 font-semibold">Audio AI</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
