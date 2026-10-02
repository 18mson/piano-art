import { create } from 'zustand';
import { clampStartOctave } from '../lib/layout';
import { audioEngine } from '../lib/audio';

const STORAGE_KEY = 'piano_art_settings_v1';

export type QualitySetting = 'low' | 'medium' | 'high';

export interface PianoSettings {
  octaves: number | 'all';
  startOctave: number; // 1..7
  showNoteNames: boolean;
  sustain: boolean;
  keyboardBaseOctave: number;
  quality: QualitySetting;
}

export interface PianoStore extends PianoSettings {
  // Runtime state
  isAudioStarted: boolean;
  audioReady: boolean;
  loadProgress: number;
  isMobile: boolean;
  warningMessage: string | null;

  // Actions
  setOctaves: (octaves: number | 'all') => void;
  setStartOctave: (startOctave: number) => void;
  shiftStartOctave: (delta: number) => void;
  toggleNoteNames: () => void;
  setSustain: (sustain: boolean) => void;
  toggleSustain: () => void;
  setKeyboardBaseOctave: (octave: number) => void;
  setAudioStarted: (started: boolean) => void;
  setAudioReady: (ready: boolean, progress?: number) => void;
  setWarningMessage: (msg: string | null) => void;
  setIsMobile: (isMobile: boolean) => void;
}

function loadPersistedSettings(): Partial<PianoSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read localStorage settings:', e);
    return {};
  }
}

function persistSettings(settings: PianoSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to persist settings:', e);
  }
}

export const usePianoStore = create<PianoStore>((set, get) => {
  const saved = loadPersistedSettings();

  const initialSettings: PianoSettings = {
    octaves: saved.octaves ?? 4,
    startOctave: saved.startOctave ?? 3,
    showNoteNames: saved.showNoteNames ?? true,
    sustain: saved.sustain ?? false,
    keyboardBaseOctave: saved.keyboardBaseOctave ?? 4,
    quality: saved.quality ?? 'high',
  };

  return {
    ...initialSettings,
    isAudioStarted: false,
    audioReady: false,
    loadProgress: 0,
    isMobile: false,
    warningMessage: null,

    setOctaves: (octaves) => {
      const state = get();
      const clampedStart = clampStartOctave(state.startOctave, octaves);
      const nextSettings = {
        ...state,
        octaves,
        startOctave: clampedStart,
      };
      set({ octaves, startOctave: clampedStart });
      persistSettings(nextSettings);
    },

    setStartOctave: (startOctave) => {
      const state = get();
      const clamped = clampStartOctave(startOctave, state.octaves);
      set({ startOctave: clamped });
      persistSettings({ ...state, startOctave: clamped });
    },

    shiftStartOctave: (delta) => {
      const state = get();
      if (state.octaves === 'all') return;
      const next = state.startOctave + delta;
      const clamped = clampStartOctave(next, state.octaves);
      set({ startOctave: clamped });
      persistSettings({ ...state, startOctave: clamped });
    },

    toggleNoteNames: () => {
      const state = get();
      const showNoteNames = !state.showNoteNames;
      set({ showNoteNames });
      persistSettings({ ...state, showNoteNames });
    },

    setSustain: (sustain) => {
      audioEngine.setSustain(sustain);
      set({ sustain });
      persistSettings({ ...get(), sustain });
    },

    toggleSustain: () => {
      const next = !get().sustain;
      audioEngine.setSustain(next);
      set({ sustain: next });
      persistSettings({ ...get(), sustain: next });
    },

    setKeyboardBaseOctave: (keyboardBaseOctave) => {
      const clamped = Math.max(1, Math.min(6, keyboardBaseOctave));
      set({ keyboardBaseOctave: clamped });
      persistSettings({ ...get(), keyboardBaseOctave: clamped });
    },

    setAudioStarted: (isAudioStarted) => set({ isAudioStarted }),
    setAudioReady: (audioReady, loadProgress = 100) => set({ audioReady, loadProgress }),
    setWarningMessage: (warningMessage) => set({ warningMessage }),
    setIsMobile: (isMobile) => set({ isMobile }),
  };
});
