import { Song, SongNote } from './types';

// YOASOBI - Blue (群青 / Gunjou)
// Key: Bb Major / G minor
// BPM: 132
// Full extended arrangement: Intro Chorus -> Verse -> Pre-Chorus -> Climactic Chorus -> Outro

const BPM = 132;
const beat = 60 / BPM; // ~0.4545s
const LEAD_IN = 2.4;   // Grace period so notes fall from the top of the canvas

// MIDI helper note constants for Bb Major
const Bb2 = 46, C3 = 48, D3 = 50, Eb3 = 51, F3 = 53, G3 = 55, A3 = 57, Bb3 = 58;
const C4 = 60, D4 = 62, Eb4 = 63, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70;
const C5 = 72, D5 = 74, Eb5 = 75, F5 = 77, G5 = 79, A5 = 81, Bb5 = 82;
const C6 = 84, D6 = 86;

function buildYoasobiBlueNotes(): SongNote[] {
  const notes: SongNote[] = [];

  const add = (midi: number, tBeats: number, dBeats: number, hand: 'left' | 'right' = 'right', vel: number = 0.85) => {
    notes.push({
      midi,
      time: Math.round((LEAD_IN + tBeats * beat) * 1000) / 1000,
      duration: Math.round(dBeats * beat * 1000) / 1000,
      hand,
      velocity: vel,
    });
  };

  // ==========================================
  // SECTION 1: Intro Chorus Hook (Beats 0..44)
  // ==========================================
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

  // Transition bridge (Beats 44..48)
  add(Bb2, 44.0, 3.5, 'left', 0.8);
  add(F3, 44.0, 3.5, 'left', 0.75);
  add(D4, 44.0, 1.5, 'right', 0.8);
  add(F4, 45.5, 1.5, 'right', 0.8);
  add(Bb4, 47.0, 1.0, 'right', 0.85);

  // ==========================================
  // SECTION 2: Verse 1 - Groovy Piano (Beats 48..80)
  // "Ah, itsumo no you ni sugite iku hibi ni..."
  // ==========================================
  // M12: Eb chord
  add(Eb3, 48.0, 1.8, 'left', 0.7);
  add(G3, 50.0, 1.8, 'left', 0.7);
  add(G4, 48.0, 0.5, 'right');
  add(G4, 48.5, 0.5, 'right');
  add(F4, 49.0, 0.5, 'right');
  add(Eb4, 49.5, 0.5, 'right');
  add(F4, 50.0, 1.0, 'right');
  add(G4, 51.0, 0.75, 'right');

  // M13: F chord
  add(F3, 52.0, 1.8, 'left', 0.7);
  add(A3, 54.0, 1.8, 'left', 0.7);
  add(F4, 52.0, 0.5, 'right');
  add(F4, 52.5, 0.5, 'right');
  add(Eb4, 53.0, 0.5, 'right');
  add(D4, 53.5, 0.5, 'right');
  add(Eb4, 54.0, 1.0, 'right');
  add(F4, 55.0, 0.75, 'right');

  // M14: Gm chord
  add(G3, 56.0, 1.8, 'left', 0.7);
  add(Bb3, 58.0, 1.8, 'left', 0.7);
  add(D4, 56.0, 0.5, 'right');
  add(D4, 56.5, 0.5, 'right');
  add(C4, 57.0, 0.5, 'right');
  add(Bb3, 57.5, 0.5, 'right');
  add(C4, 58.0, 1.0, 'right');
  add(D4, 59.0, 0.75, 'right');

  // M15: Bb chord
  add(Bb2, 60.0, 1.8, 'left', 0.75);
  add(F3, 62.0, 1.8, 'left', 0.7);
  add(F4, 60.0, 0.5, 'right');
  add(G4, 60.5, 0.5, 'right');
  add(Bb4, 61.0, 1.0, 'right');
  add(C5, 62.0, 0.5, 'right');
  add(D5, 63.0, 1.0, 'right');

  // M16: Eb chord repeat verse phrase
  add(Eb3, 64.0, 1.8, 'left', 0.7);
  add(G4, 64.0, 0.5, 'right');
  add(G4, 64.5, 0.5, 'right');
  add(F4, 65.0, 0.5, 'right');
  add(Eb4, 65.5, 0.5, 'right');
  add(F4, 66.0, 1.0, 'right');
  add(G4, 67.0, 0.75, 'right');

  // M17: F chord
  add(F3, 68.0, 1.8, 'left', 0.7);
  add(A4, 68.0, 0.5, 'right');
  add(G4, 68.5, 0.5, 'right');
  add(F4, 69.0, 0.5, 'right');
  add(G4, 69.5, 0.5, 'right');
  add(A4, 70.0, 1.5, 'right');

  // M18: Pre-chorus rise
  add(G3, 72.0, 1.8, 'left', 0.75);
  add(D4, 72.0, 1.8, 'left', 0.7);
  add(Bb4, 72.0, 0.5, 'right');
  add(C5, 72.5, 0.5, 'right');
  add(D5, 73.0, 0.5, 'right');
  add(F5, 73.5, 0.5, 'right');
  add(G5, 74.0, 1.5, 'right');

  // M19: Build up drums/bass into Chorus 2
  add(F3, 76.0, 0.75, 'left', 0.8);
  add(F3, 77.0, 0.75, 'left', 0.85);
  add(F3, 78.0, 0.75, 'left', 0.9);
  add(F3, 79.0, 0.75, 'left', 0.95);
  add(A4, 76.0, 0.5, 'right');
  add(Bb4, 77.0, 0.5, 'right');
  add(C5, 78.0, 0.5, 'right');
  add(D5, 79.0, 0.75, 'right');

  // ==========================================
  // SECTION 3: Grand Climax Chorus (Beats 80..120)
  // Full energetic octave chords in right hand
  // ==========================================
  // "Ah... subete o kakete!"
  add(Bb4, 80.0, 1.5, 'right', 0.95);
  add(Bb5, 80.0, 1.5, 'right', 0.9);

  // M21: Eb Major
  add(Eb3, 82.0, 3.5, 'left', 0.85);
  add(Bb3, 82.0, 3.5, 'left', 0.8);
  add(G4, 82.0, 1.8, 'left', 0.75);
  add(Bb4, 82.0, 0.5, 'right', 0.9);
  add(C5, 82.5, 0.5, 'right', 0.9);
  add(D5, 83.0, 0.75, 'right', 0.95);
  add(F5, 83.75, 1.0, 'right', 0.95);

  // M22: F Major
  add(F3, 86.0, 3.5, 'left', 0.85);
  add(C4, 86.0, 3.5, 'left', 0.8);
  add(A4, 86.0, 1.8, 'left', 0.75);
  add(D5, 86.0, 0.5, 'right', 0.9);
  add(C5, 86.5, 0.5, 'right', 0.9);
  add(Bb4, 87.0, 1.5, 'right', 0.95);

  // M23: D minor
  add(D3, 90.0, 3.5, 'left', 0.85);
  add(A3, 90.0, 3.5, 'left', 0.8);
  add(F4, 90.0, 1.8, 'left', 0.75);
  add(Bb4, 90.0, 0.5, 'right');
  add(C5, 90.5, 0.5, 'right');
  add(D5, 91.0, 0.5, 'right');
  add(F5, 91.5, 0.5, 'right');
  add(G5, 92.0, 1.0, 'right', 0.95);

  // M24: G minor
  add(G3, 94.0, 3.5, 'left', 0.85);
  add(D4, 94.0, 3.5, 'left', 0.8);
  add(F5, 94.0, 0.5, 'right');
  add(D5, 94.5, 0.5, 'right');
  add(C5, 95.0, 0.5, 'right');
  add(Bb4, 95.5, 0.5, 'right');
  add(C5, 96.0, 1.5, 'right');

  // M25: Soaring high phrase "I-ma!"
  add(Eb3, 98.0, 3.5, 'left', 0.85);
  add(D5, 98.0, 0.75, 'right');
  add(F5, 98.75, 1.0, 'right');
  add(Bb5, 99.75, 1.5, 'right', 0.95);

  // M26: "ji - bun no te de"
  add(F3, 102.0, 3.5, 'left', 0.85);
  add(G5, 102.0, 0.5, 'right');
  add(F5, 102.5, 0.5, 'right');
  add(D5, 103.0, 0.5, 'right');
  add(C5, 103.5, 0.5, 'right');
  add(Bb4, 104.0, 1.0, 'right');
  add(G4, 105.0, 0.75, 'right');

  // M27: "a - o no se - ka - i e"
  add(D3, 106.0, 3.5, 'left', 0.85);
  add(Bb4, 106.0, 0.5, 'right');
  add(C5, 106.5, 0.5, 'right');
  add(D5, 107.0, 0.5, 'right');
  add(F5, 107.5, 0.5, 'right');
  add(G5, 108.0, 0.5, 'right');
  add(F5, 108.5, 0.5, 'right');
  add(D5, 109.0, 0.75, 'right');
  add(C5, 109.75, 1.0, 'right');

  // ==========================================
  // SECTION 4: Grand Outro Coda (Beats 110..130)
  // ==========================================
  add(Eb3, 112.0, 3.5, 'left', 0.8);
  add(Bb3, 112.0, 3.5, 'left', 0.75);
  add(D5, 112.0, 1.0, 'right');
  add(Bb4, 113.0, 1.0, 'right');
  add(G4, 114.0, 1.5, 'right');

  add(F3, 116.0, 3.5, 'left', 0.8);
  add(C4, 116.0, 3.5, 'left', 0.75);
  add(C5, 116.0, 1.0, 'right');
  add(A4, 117.0, 1.0, 'right');
  add(F4, 118.0, 1.5, 'right');

  // Final resounding concert grand chord
  add(Bb2, 120.0, 6.0, 'left', 0.9);
  add(F3, 120.0, 6.0, 'left', 0.85);
  add(Bb3, 120.0, 6.0, 'left', 0.8);
  add(D4, 120.0, 6.0, 'right', 0.8);
  add(F4, 120.0, 6.0, 'right', 0.85);
  add(Bb4, 120.0, 6.0, 'right', 0.95);
  add(D5, 120.0, 6.0, 'right', 0.9);

  // Sort notes chronologically
  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const notes = buildYoasobiBlueNotes();
const lastNote = notes[notes.length - 1];
const totalDuration = lastNote ? Math.ceil(lastNote.time + lastNote.duration + 1.0) : 62;

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
  description: 'Lagu hit emosional YOASOBI berdurasi lengkap dengan intro chorus, verse piano dinamis, dan klimaks megah.',
  notes,
};
