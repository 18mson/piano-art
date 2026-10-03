import { Song, SongNote } from './types';

// YOASOBI - Blue (群青 / Gunjou)
// Key: Bb Major / G minor
// BPM: 132
// Signature Chorus section with melody & left-hand chord progression

const BPM = 132;
const beat = 60 / BPM; // ~0.4545s
const eighth = beat / 2; // ~0.227s
const quarter = beat;    // ~0.455s
const half = beat * 2;   // ~0.909s

// MIDI helper note constants for Bb Major
const Bb2 = 46, C3 = 48, D3 = 50, Eb3 = 51, F3 = 53, G3 = 55, A3 = 57, Bb3 = 58;
const C4 = 60, D4 = 62, Eb4 = 63, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70;
const C5 = 72, D5 = 74, Eb5 = 75, F5 = 77, G5 = 79, A5 = 81, Bb5 = 82;

function buildYoasobiBlueNotes(): SongNote[] {
  const notes: SongNote[] = [];

  const add = (midi: number, tBeats: number, dBeats: number, hand: 'left' | 'right' = 'right', vel: number = 0.85) => {
    notes.push({
      midi,
      time: Math.round(tBeats * beat * 1000) / 1000,
      duration: Math.round(dBeats * beat * 1000) / 1000,
      hand,
      velocity: vel,
    });
  };

  // --- Intro Chorus Hook (Ah... subete o kakete...) ---
  // Pickup: "Ah..."
  add(Bb4, 2.0, 1.5, 'right', 0.9);

  // Measure 1: "su - be - te o" | Left: Eb3 + Bb3 + G4 (Eb Major)
  add(Eb3, 4.0, 3.5, 'left', 0.75);
  add(Bb3, 4.0, 3.5, 'left', 0.7);
  add(G4, 4.0, 1.8, 'left', 0.65);
  add(Bb4, 4.0, 0.5, 'right');
  add(C5, 4.5, 0.5, 'right');
  add(D5, 5.0, 0.75, 'right');
  add(F5, 5.75, 1.0, 'right');

  // Measure 2: "ka - ke - te" | Left: F3 + C4 + A4 (F Major)
  add(F3, 8.0, 3.5, 'left', 0.75);
  add(C4, 8.0, 3.5, 'left', 0.7);
  add(A4, 8.0, 1.8, 'left', 0.65);
  add(D5, 8.0, 0.5, 'right');
  add(C5, 8.5, 0.5, 'right');
  add(Bb4, 9.0, 1.5, 'right');

  // Measure 3: "bo - ku ni shi - ka" | Left: D3 + A3 + F4 (D minor)
  add(D3, 12.0, 3.5, 'left', 0.75);
  add(A3, 12.0, 3.5, 'left', 0.7);
  add(F4, 12.0, 1.8, 'left', 0.65);
  add(Bb4, 12.0, 0.5, 'right');
  add(C5, 12.5, 0.5, 'right');
  add(D5, 13.0, 0.5, 'right');
  add(F5, 13.5, 0.5, 'right');
  add(G5, 14.0, 1.0, 'right');

  // Measure 4: "de - ki - na - i ko - to o" | Left: G3 + D4 + Bb4 (G minor)
  add(G3, 16.0, 3.5, 'left', 0.75);
  add(D4, 16.0, 3.5, 'left', 0.7);
  add(Bb3, 16.0, 1.8, 'left', 0.65);
  add(F5, 16.0, 0.5, 'right');
  add(D5, 16.5, 0.5, 'right');
  add(C5, 17.0, 0.5, 'right');
  add(Bb4, 17.5, 0.5, 'right');
  add(C5, 18.0, 1.5, 'right');

  // Measure 5: "I - ma" | Left: Eb3 + Bb3 + G4
  add(Eb3, 20.0, 3.5, 'left', 0.75);
  add(Bb3, 20.0, 3.5, 'left', 0.7);
  add(G4, 20.0, 1.8, 'left', 0.65);
  add(D5, 20.0, 0.75, 'right');
  add(F5, 20.75, 1.5, 'right');

  // Measure 6: "ji - bun no te de" | Left: F3 + C4 + A4
  add(F3, 24.0, 3.5, 'left', 0.75);
  add(C4, 24.0, 3.5, 'left', 0.7);
  add(A4, 24.0, 1.8, 'left', 0.65);
  add(G5, 24.0, 0.5, 'right');
  add(F5, 24.5, 0.5, 'right');
  add(D5, 25.0, 0.5, 'right');
  add(C5, 25.5, 0.5, 'right');
  add(Bb4, 26.0, 1.0, 'right');
  add(G4, 27.0, 0.75, 'right');

  // Measure 7: "tsu - ka - mi - to - ru ta - me ni" | Left: D3 + A3 + F4
  add(D3, 28.0, 3.5, 'left', 0.75);
  add(A3, 28.0, 3.5, 'left', 0.7);
  add(F4, 28.0, 1.8, 'left', 0.65);
  add(Bb4, 28.0, 0.5, 'right');
  add(C5, 28.5, 0.5, 'right');
  add(D5, 29.0, 0.5, 'right');
  add(F5, 29.5, 0.5, 'right');
  add(D5, 30.0, 0.5, 'right');
  add(C5, 30.5, 0.5, 'right');
  add(Bb4, 31.0, 0.5, 'right');
  add(C5, 31.5, 0.5, 'right');

  // Measure 8: "a - ru - ki - da - shi - ta" | Left: G3 + D4 + Bb4
  add(G3, 32.0, 3.5, 'left', 0.75);
  add(D4, 32.0, 3.5, 'left', 0.7);
  add(Bb3, 32.0, 1.8, 'left', 0.65);
  add(D5, 32.0, 1.0, 'right');
  add(Bb4, 33.0, 0.5, 'right');
  add(C5, 33.5, 0.5, 'right');
  add(D5, 34.0, 0.5, 'right');
  add(F5, 34.5, 0.75, 'right');
  add(G5, 35.25, 0.5, 'right');

  // Measure 9: "o - wa - ri no na - i" | Left: Eb3 + Bb3 + G4
  add(Eb3, 36.0, 3.5, 'left', 0.75);
  add(Bb3, 36.0, 3.5, 'left', 0.7);
  add(G4, 36.0, 1.8, 'left', 0.65);
  add(F5, 36.0, 0.5, 'right');
  add(D5, 36.5, 0.5, 'right');
  add(C5, 37.0, 0.5, 'right');
  add(Bb4, 37.5, 1.0, 'right');
  add(G4, 38.5, 0.5, 'right');
  add(Bb4, 39.0, 0.75, 'right');

  // Measure 10: "a - o no se - ka - i e" | Left: F3 + C4 + A4
  add(F3, 40.0, 3.5, 'left', 0.75);
  add(C4, 40.0, 3.5, 'left', 0.7);
  add(A4, 40.0, 1.8, 'left', 0.65);
  add(C5, 40.0, 0.5, 'right');
  add(D5, 40.5, 0.5, 'right');
  add(F5, 41.0, 0.5, 'right');
  add(G5, 41.5, 0.5, 'right');
  add(F5, 42.0, 0.5, 'right');
  add(D5, 42.5, 0.5, 'right');
  add(C5, 43.0, 0.75, 'right');

  // Measure 11: Final Resolution chord | Left: Bb2 + F3 + Bb3, Right: D4 + F4 + Bb4
  add(Bb2, 44.0, 4.0, 'left', 0.85);
  add(F3, 44.0, 4.0, 'left', 0.8);
  add(Bb3, 44.0, 4.0, 'left', 0.75);
  add(D4, 44.0, 4.0, 'right', 0.75);
  add(F4, 44.0, 4.0, 'right', 0.75);
  add(Bb4, 44.0, 4.0, 'right', 0.9);

  // Sort notes chronologically
  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const notes = buildYoasobiBlueNotes();
const lastNote = notes[notes.length - 1];
const totalDuration = lastNote ? Math.ceil(lastNote.time + lastNote.duration + 1.0) : 25;

export const yoasobiBlueSong: Song = {
  id: 'yoasobi-blue',
  title: 'Blue (Gunjou)',
  subTitle: '群青',
  artist: 'YOASOBI',
  difficulty: 'Hard',
  stars: 4,
  bpm: BPM,
  duration: totalDuration,
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Lagu hit emosional YOASOBI dengan ritme energik dan harmoni piano chorus yang memukau.',
  notes,
};
