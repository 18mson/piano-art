export type DifficultyLevel = 'Easy' | 'Normal' | 'Hard' | 'Expert';

export interface SongNote {
  midi: number;          // MIDI pitch (21..108)
  time: number;          // Start time in seconds
  duration: number;      // Duration in seconds
  hand?: 'left' | 'right';
  velocity?: number;     // 0..1
}

export interface Song {
  id: string;
  title: string;
  subTitle?: string;
  artist: string;
  difficulty: DifficultyLevel;
  stars: number;         // 1..5
  bpm: number;
  duration: number;      // Total duration in seconds
  suggestedOctaves: number; // e.g. 3 or 4
  suggestedStartOctave: number; // e.g. 3
  notes: SongNote[];
  description?: string;
}
