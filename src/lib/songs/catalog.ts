import { Song, SongNote } from './types';
import { yoasobiBlueSong } from './yoasobiBlue';

// 1. Twinkle Twinkle Little Star (Easy - 1 Star)
// Key: C Major, simple single melody with light accompaniment
function buildTwinkleNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 100;
  const beat = 60 / bpm; // 0.6s

  // Melody: C C G G A A G - F F E E D D C
  const melody = [
    { m: 60, b: 0, d: 0.8 }, { m: 60, b: 1, d: 0.8 },
    { m: 67, b: 2, d: 0.8 }, { m: 67, b: 3, d: 0.8 },
    { m: 69, b: 4, d: 0.8 }, { m: 69, b: 5, d: 0.8 },
    { m: 67, b: 6, d: 1.8 },

    { m: 65, b: 8, d: 0.8 }, { m: 65, b: 9, d: 0.8 },
    { m: 64, b: 10, d: 0.8 }, { m: 64, b: 11, d: 0.8 },
    { m: 62, b: 12, d: 0.8 }, { m: 62, b: 13, d: 0.8 },
    { m: 60, b: 14, d: 1.8 },

    // Middle verse
    { m: 67, b: 16, d: 0.8 }, { m: 67, b: 17, d: 0.8 },
    { m: 65, b: 18, d: 0.8 }, { m: 65, b: 19, d: 0.8 },
    { m: 64, b: 20, d: 0.8 }, { m: 64, b: 21, d: 0.8 },
    { m: 62, b: 22, d: 1.8 },

    // Return to main
    { m: 60, b: 24, d: 0.8 }, { m: 60, b: 25, d: 0.8 },
    { m: 67, b: 26, d: 0.8 }, { m: 67, b: 27, d: 0.8 },
    { m: 69, b: 28, d: 0.8 }, { m: 69, b: 29, d: 0.8 },
    { m: 67, b: 30, d: 1.8 },
    { m: 65, b: 32, d: 0.8 }, { m: 65, b: 33, d: 0.8 },
    { m: 64, b: 34, d: 0.8 }, { m: 64, b: 35, d: 0.8 },
    { m: 62, b: 36, d: 0.8 }, { m: 62, b: 37, d: 0.8 },
    { m: 60, b: 38, d: 2.5 },
  ];

  // Bass chords
  const bass = [
    { m: 48, b: 0, d: 1.8 }, { m: 48, b: 2, d: 1.8 }, { m: 45, b: 4, d: 1.8 }, { m: 48, b: 6, d: 1.8 },
    { m: 41, b: 8, d: 1.8 }, { m: 48, b: 10, d: 1.8 }, { m: 43, b: 12, d: 1.8 }, { m: 48, b: 14, d: 1.8 },
    { m: 48, b: 16, d: 1.8 }, { m: 41, b: 18, d: 1.8 }, { m: 48, b: 20, d: 1.8 }, { m: 43, b: 22, d: 1.8 },
    { m: 48, b: 24, d: 1.8 }, { m: 48, b: 26, d: 1.8 }, { m: 45, b: 28, d: 1.8 }, { m: 48, b: 30, d: 1.8 },
    { m: 41, b: 32, d: 1.8 }, { m: 48, b: 34, d: 1.8 }, { m: 43, b: 36, d: 1.8 }, { m: 48, b: 38, d: 2.5 },
  ];

  melody.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round(item.b * beat * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'right',
      velocity: 0.85,
    });
  });

  bass.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round(item.b * beat * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'left',
      velocity: 0.65,
    });
  });

  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const twinkleNotes = buildTwinkleNotes();
export const twinkleSong: Song = {
  id: 'twinkle-twinkle',
  title: 'Twinkle Twinkle Little Star',
  subTitle: 'Bintang Kecil',
  artist: 'Traditional / Mozart',
  difficulty: 'Easy',
  stars: 1,
  bpm: 100,
  duration: Math.ceil(twinkleNotes[twinkleNotes.length - 1].time + twinkleNotes[twinkleNotes.length - 1].duration + 1),
  suggestedOctaves: 3,
  suggestedStartOctave: 3,
  description: 'Lagu klasik sederhana yang sangat ramah untuk pemula mempelajari dasar not jatuh.',
  notes: twinkleNotes,
};

// 2. Für Elise (Normal - 3 Stars)
// Key: A minor, famous romantic theme
function buildFurEliseNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 126;
  const beat = 60 / bpm; // ~0.476s
  const sixteenth = beat / 4;

  const sequence = [
    // Famous motif: E5 D#5 E5 D#5 E5 B4 D5 C5 A4
    { m: 76, t: 0, d: 1.5 }, { m: 75, t: 1.5, d: 1.5 },
    { m: 76, t: 3, d: 1.5 }, { m: 75, t: 4.5, d: 1.5 },
    { m: 76, t: 6, d: 1.5 }, { m: 71, t: 7.5, d: 1.5 },
    { m: 74, t: 9, d: 1.5 }, { m: 72, t: 10.5, d: 1.5 },
    { m: 69, t: 12, d: 4 },

    // Left hand arpeggio: A2 E3 A3 C4 E4
    { m: 45, t: 12, d: 4, hand: 'left' as const },
    { m: 52, t: 14, d: 3, hand: 'left' as const },
    { m: 57, t: 15, d: 3, hand: 'left' as const },
    { m: 60, t: 16, d: 3, hand: 'left' as const },

    // Right: C4 E4 A4 B4
    { m: 60, t: 16, d: 2 }, { m: 64, t: 18, d: 2 }, { m: 69, t: 20, d: 2 }, { m: 71, t: 22, d: 4 },

    // Left hand: E2 E3 G#3 B3 E4
    { m: 40, t: 22, d: 4, hand: 'left' as const },
    { m: 52, t: 24, d: 3, hand: 'left' as const },
    { m: 56, t: 25, d: 3, hand: 'left' as const },
    { m: 59, t: 26, d: 3, hand: 'left' as const },

    // Right: E4 G#4 B4 C5
    { m: 64, t: 26, d: 2 }, { m: 68, t: 28, d: 2 }, { m: 71, t: 30, d: 2 }, { m: 72, t: 32, d: 4 },

    // Repeat motif
    { m: 76, t: 36, d: 1.5 }, { m: 75, t: 37.5, d: 1.5 },
    { m: 76, t: 39, d: 1.5 }, { m: 75, t: 40.5, d: 1.5 },
    { m: 76, t: 42, d: 1.5 }, { m: 71, t: 43.5, d: 1.5 },
    { m: 74, t: 45, d: 1.5 }, { m: 72, t: 46.5, d: 1.5 },
    { m: 69, t: 48, d: 6 },
    { m: 45, t: 48, d: 6, hand: 'left' as const },
    { m: 57, t: 48, d: 6, hand: 'left' as const },
  ];

  sequence.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round(item.t * sixteenth * 1000) / 1000,
      duration: Math.round(item.d * sixteenth * 1000) / 1000,
      hand: item.hand ?? 'right',
      velocity: 0.8,
    });
  });

  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const furEliseNotes = buildFurEliseNotes();
export const furEliseSong: Song = {
  id: 'fur-elise',
  title: 'Für Elise',
  subTitle: 'Bagatelle No. 25 in A Minor',
  artist: 'Ludwig van Beethoven',
  difficulty: 'Normal',
  stars: 3,
  bpm: 126,
  duration: Math.ceil(furEliseNotes[furEliseNotes.length - 1].time + furEliseNotes[furEliseNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Karya mahakarya klasik Beethoven dengan melodi arpeggio yang anggun dan ritme moderat.',
  notes: furEliseNotes,
};

// Master catalog: Yoasobi Blue is the featured first song
export const SONGS_CATALOG: Song[] = [
  yoasobiBlueSong,
  furEliseSong,
  twinkleSong,
];

export function getSongById(id: string): Song | undefined {
  return SONGS_CATALOG.find((s) => s.id === id);
}
