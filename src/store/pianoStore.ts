import { create } from 'zustand';
import { clampStartOctave } from '../lib/layout';
import { audioEngine } from '../lib/audio';

const STORAGE_KEY = 'piano_art_settings_v1';

export type QualitySetting = 'low' | 'medium' | 'high';

export interface PianoSettings {
  octaves: number | 'all';
  startOctave: number; // 1..7
  showNoteNames: boolean;
  showKeyboardShortcuts: boolean;
  showKeyboardGuide: boolean;
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
  toggleKeyboardShortcuts: () => void;
  toggleKeyboardGuide: () => void;
  setKeyboardShortcuts: (show: boolean) => void;
  setKeyboardGuide: (show: boolean) => void;
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
  const initialOctaves = saved.octaves ?? 4;
  const initialStartOctave = clampStartOctave(saved.startOctave ?? 3, initialOctaves);
  const initialKeyboardBaseOctave = initialOctaves === 'all'
    ? (saved.keyboardBaseOctave ?? 4)
    : Math.max(1, Math.min(6, initialStartOctave));

  const initialSettings: PianoSettings = {
    octaves: initialOctaves,
    startOctave: initialStartOctave,
    showNoteNames: saved.showNoteNames ?? true,
    showKeyboardShortcuts: saved.showKeyboardShortcuts ?? true,
    showKeyboardGuide: saved.showKeyboardGuide ?? true,
    sustain: saved.sustain ?? false,
    keyboardBaseOctave: initialKeyboardBaseOctave,
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
      const keyboardBaseOctave = octaves === 'all'
        ? (state.keyboardBaseOctave || 4)
        : Math.max(1, Math.min(6, clampedStart));
      const nextSettings = {
        ...state,
        octaves,
        startOctave: clampedStart,
        keyboardBaseOctave,
      };
      set({ octaves, startOctave: clampedStart, keyboardBaseOctave });
      persistSettings(nextSettings);
    },

    setStartOctave: (startOctave) => {
      const state = get();
      const clamped = clampStartOctave(startOctave, state.octaves);
      const keyboardBaseOctave = state.octaves === 'all'
        ? state.keyboardBaseOctave
        : Math.max(1, Math.min(6, clamped));
      set({ startOctave: clamped, keyboardBaseOctave });
      persistSettings({ ...state, startOctave: clamped, keyboardBaseOctave });
    },

    shiftStartOctave: (delta) => {
      const state = get();
      if (state.octaves === 'all') return;
      const next = state.startOctave + delta;
      const clamped = clampStartOctave(next, state.octaves);
      const keyboardBaseOctave = Math.max(1, Math.min(6, clamped));
      set({ startOctave: clamped, keyboardBaseOctave });
      persistSettings({ ...state, startOctave: clamped, keyboardBaseOctave });
    },

    toggleNoteNames: () => {
      const state = get();
      const showNoteNames = !state.showNoteNames;
      set({ showNoteNames });
      persistSettings({ ...state, showNoteNames });
    },

    toggleKeyboardShortcuts: () => {
      const state = get();
      const showKeyboardShortcuts = !state.showKeyboardShortcuts;
      set({ showKeyboardShortcuts });
      persistSettings({ ...state, showKeyboardShortcuts });
    },

    toggleKeyboardGuide: () => {
      const state = get();
      const showKeyboardGuide = !state.showKeyboardGuide;
      set({ showKeyboardGuide });
      persistSettings({ ...state, showKeyboardGuide });
    },

    setKeyboardShortcuts: (showKeyboardShortcuts) => {
      set({ showKeyboardShortcuts });
      persistSettings({ ...get(), showKeyboardShortcuts });
    },

    setKeyboardGuide: (showKeyboardGuide) => {
      set({ showKeyboardGuide });
      persistSettings({ ...get(), showKeyboardGuide });
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
      const state = get();
      const clamped = Math.max(1, Math.min(6, keyboardBaseOctave));
      if (state.octaves !== 'all') {
        const clampedStart = clampStartOctave(clamped, state.octaves);
        set({ keyboardBaseOctave: clamped, startOctave: clampedStart });
        persistSettings({ ...state, keyboardBaseOctave: clamped, startOctave: clampedStart });
      } else {
        set({ keyboardBaseOctave: clamped });
        persistSettings({ ...state, keyboardBaseOctave: clamped });
      }
    },

    setAudioStarted: (isAudioStarted) => set({ isAudioStarted }),
    setAudioReady: (audioReady, loadProgress = 100) => set({ audioReady, loadProgress }),
    setWarningMessage: (warningMessage) => set({ warningMessage }),
    setIsMobile: (isMobile) => set({ isMobile }),
  };
});
