import { create } from 'zustand';
import { Song } from '../lib/songs/types';
import { SONGS_CATALOG, getSongById } from '../lib/songs/catalog';
import { inputDispatcher } from '../lib/input/dispatcher';

export type PlaybackMode = 'listen' | 'practice';

export interface SongStore {
  // State
  activeSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number; // 0.75, 1, 1.25
  mode: PlaybackMode;
  fallDuration: number; // seconds for a note to fall from top to piano hit line (default 2.2)
  isSelectorOpen: boolean;

  // Practice score state
  score: number;
  combo: number;
  maxCombo: number;

  // Actions
  openSelector: () => void;
  closeSelector: () => void;
  selectSong: (songOrId: Song | string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
  closeSong: () => void;
  setMode: (mode: PlaybackMode) => void;
  setSpeed: (speed: number) => void;
  setFallDuration: (duration: number) => void;
  recordHit: (accuracy: 'perfect' | 'good' | 'miss') => void;
  resetScore: () => void;
}

export const useSongStore = create<SongStore>((set, get) => ({
  activeSong: null,
  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1.0,
  mode: 'listen',
  fallDuration: 2.2,
  isSelectorOpen: false,

  score: 0,
  combo: 0,
  maxCombo: 0,

  openSelector: () => set({ isSelectorOpen: true }),
  closeSelector: () => set({ isSelectorOpen: false }),

  selectSong: (songOrId) => {
    const song = typeof songOrId === 'string' ? getSongById(songOrId) : songOrId;
    if (!song) return;

    // Release any currently sustained/playing notes
    inputDispatcher.releaseAll();

    set({
      activeSong: song,
      currentTime: 0,
      isPlaying: true, // auto-start playback upon selection
      isSelectorOpen: false,
      score: 0,
      combo: 0,
      maxCombo: 0,
    });
  },

  play: () => set({ isPlaying: true }),

  pause: () => {
    inputDispatcher.releaseAll();
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      inputDispatcher.releaseAll();
      set({ isPlaying: false });
    } else {
      set({ isPlaying: true });
    }
  },

  stop: () => {
    inputDispatcher.releaseAll();
    set({ isPlaying: false, currentTime: 0 });
  },

  seek: (time) => {
    inputDispatcher.releaseAll();
    const song = get().activeSong;
    const maxDuration = song ? song.duration : 0;
    const clamped = Math.max(0, Math.min(time, maxDuration));
    set({ currentTime: clamped });
  },

  closeSong: () => {
    inputDispatcher.releaseAll();
    set({
      activeSong: null,
      isPlaying: false,
      currentTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
    });
  },

  setMode: (mode) => {
    inputDispatcher.releaseAll();
    set({ mode });
  },

  setSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setFallDuration: (fallDuration) => set({ fallDuration }),

  recordHit: (accuracy) => {
    set((state) => {
      if (accuracy === 'miss') {
        return { combo: 0 };
      }
      const points = accuracy === 'perfect' ? 100 : 50;
      const nextCombo = state.combo + 1;
      return {
        score: state.score + points * (1 + Math.floor(nextCombo / 10) * 0.2),
        combo: nextCombo,
        maxCombo: Math.max(state.maxCombo, nextCombo),
      };
    });
  },

  resetScore: () => set({ score: 0, combo: 0, maxCombo: 0 }),
}));
