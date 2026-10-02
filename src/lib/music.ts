// Piano pitch definitions and music theory helpers

export const MIN_MIDI = 21; // A0
export const MAX_MIDI = 108; // C8
export const TOTAL_KEYS = 88;
export const WHITE_KEY_TOTAL = 52;
export const BLACK_KEY_TOTAL = 36;

export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Black key pattern in an octave starting at C: C#(1), D#(3), F#(6), G#(8), A#(10)
const BLACK_KEY_OFFSETS = new Set([1, 3, 6, 8, 10]);

/**
 * Returns true if the given MIDI number is a black key (sharp/flat).
 */
export function isBlackKey(midi: number): boolean {
  const pitchClass = midi % 12;
  return BLACK_KEY_OFFSETS.has(pitchClass);
}

/**
 * Converts a MIDI number (e.g. 60) to a note name with octave (e.g. "C4").
 */
export function midiToNoteName(midi: number): string {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

/**
 * Returns just the pitch class note name (e.g. "C", "C#", "F").
 */
export function midiToPitchClass(midi: number): NoteName {
  return NOTE_NAMES[midi % 12];
}

/**
 * Converts MIDI number to standard frequency in Hz (A4 = 440Hz).
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Chromatic color mapping for pitch classes (Sea of Stars soft neon glow palette).
 * Returns RGB hex number for Pixi and hex string for CSS.
 */
export interface PitchColor {
  hex: number;
  css: string;
}

export const PITCH_COLORS: Record<number, PitchColor> = {
  0:  { hex: 0x38bdf8, css: '#38bdf8' }, // C  - Sky cyan
  1:  { hex: 0x818cf8, css: '#818cf8' }, // C# - Indigo soft
  2:  { hex: 0xa855f7, css: '#a855f7' }, // D  - Purple
  3:  { hex: 0xd946ef, css: '#d946ef' }, // D# - Fuchsia
  4:  { hex: 0xf43f5e, css: '#f43f5e' }, // E  - Rose
  5:  { hex: 0xf97316, css: '#f97316' }, // F  - Orange
  6:  { hex: 0xfbbf24, css: '#fbbf24' }, // F# - Amber warm
  7:  { hex: 0xfacc15, css: '#facc15' }, // G  - Gold / yellow
  8:  { hex: 0xa3e635, css: '#a3e635' }, // G# - Lime
  9:  { hex: 0x34d399, css: '#34d399' }, // A  - Emerald
  10: { hex: 0x2dd4bf, css: '#2dd4bf' }, // A# - Teal
  11: { hex: 0x06b6d4, css: '#06b6d4' }, // B  - Cyan
};

export function getPitchColor(midi: number): PitchColor {
  const pitchClass = midi % 12;
  return PITCH_COLORS[pitchClass] ?? { hex: 0xffffff, css: '#ffffff' };
}
