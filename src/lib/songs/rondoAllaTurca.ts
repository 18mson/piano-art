import { Song, SongNote } from './types';

const LEAD_IN_SECONDS = 2.4;

export function buildRondoAllaTurcaNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 126;
  const beat = 60 / bpm; // ~0.476s per beat
  const sixteenth = beat / 2; // ~0.238s

  // Helper to add note with time in sixteenths
  const addR = (step: number, midi: number, durationSteps: number = 1, vel: number = 0.85) => {
    notes.push({
      midi,
      time: Math.round((LEAD_IN_SECONDS + step * sixteenth) * 1000) / 1000,
      duration: Math.round((durationSteps * sixteenth * 0.92) * 1000) / 1000,
      hand: 'right',
      velocity: vel,
    });
  };

  const addL = (step: number, midi: number, durationSteps: number = 2, vel: number = 0.78) => {
    notes.push({
      midi,
      time: Math.round((LEAD_IN_SECONDS + step * sixteenth) * 1000) / 1000,
      duration: Math.round((durationSteps * sixteenth * 0.88) * 1000) / 1000,
      hand: 'left',
      velocity: vel,
    });
  };

  // Helper to add a 4-note Alberti / march bass chord
  const addMarchBass = (startStep: number, rootMidi: number, chordMidi1: number, chordMidi2: number, repetitions: number = 2) => {
    for (let r = 0; r < repetitions; r++) {
      const s = startStep + r * 4;
      addL(s + 0, rootMidi, 2);
      addL(s + 2, chordMidi1, 1.8);
      addL(s + 2, chordMidi2, 1.8);
    }
  };

  // ----------------------------------------------------
  // SECTION 1: THEME A (A Minor Allegretto Theme)
  // ----------------------------------------------------
  const renderThemeA = (baseStep: number) => {
    // Motif 1: B4-A4-G#4-A4 -> C5
    addR(baseStep + 0, 71, 0.9); // B4
    addR(baseStep + 1, 69, 0.9); // A4
    addR(baseStep + 2, 68, 0.9); // G#4
    addR(baseStep + 3, 69, 0.9); // A4
    addR(baseStep + 4, 72, 3.5, 0.92); // C5 (held)
    addMarchBass(baseStep + 4, 45, 52, 57, 1); // A2 + (E3, A3)

    // Motif 2: D5-C5-B4-C5 -> E5
    addR(baseStep + 8, 74, 0.9); // D5
    addR(baseStep + 9, 72, 0.9); // C5
    addR(baseStep + 10, 71, 0.9); // B4
    addR(baseStep + 11, 72, 0.9); // C5
    addR(baseStep + 12, 76, 3.5, 0.92); // E5 (held)
    addMarchBass(baseStep + 12, 48, 52, 60, 1); // C3 + (E3, C4)

    // Motif 3: F5-E5-D#5-E5 -> B5-A5-G#5-A5-B5
    addR(baseStep + 16, 77, 0.9); // F5
    addR(baseStep + 17, 76, 0.9); // E5
    addR(baseStep + 18, 75, 0.9); // D#5
    addR(baseStep + 19, 76, 0.9); // E5
    addR(baseStep + 20, 83, 0.9); // B5
    addR(baseStep + 21, 81, 0.9); // A5
    addR(baseStep + 22, 80, 0.9); // G#5
    addR(baseStep + 23, 81, 0.9); // A5
    addMarchBass(baseStep + 16, 52, 56, 59, 2); // E3 + (G#3, B3)

    // Cadence to A5
    addR(baseStep + 24, 83, 1.8); // B5
    addR(baseStep + 26, 84, 1.8); // C6
    addR(baseStep + 28, 83, 1.8); // B5
    addR(baseStep + 30, 81, 3.5, 0.95); // A5
    addMarchBass(baseStep + 24, 45, 52, 57, 2); // A2 + (E3, A3)
  };

  // Render Theme A first pass (Steps 0..32)
  renderThemeA(0);

  // Repeat Theme A with subtle octave variation (Steps 34..66)
  renderThemeA(34);

  // ----------------------------------------------------
  // SECTION 2: THEME B (A Major Turkish March Fanfare!)
  // ----------------------------------------------------
  const renderThemeB = (baseStep: number) => {
    // Bright A major fanfare: C#5 - D5 - E5 - F#5 - E5 - D5 - C#5 - B4 - A4
    const fanfareR = [
      { step: 0, m: 73 }, { step: 1, m: 74 }, { step: 2, m: 76 }, { step: 3, m: 78 },
      { step: 4, m: 76 }, { step: 5, m: 74 }, { step: 6, m: 73 }, { step: 7, m: 71 },
      { step: 8, m: 69 }, { step: 10, m: 73 }, { step: 12, m: 76 }, { step: 14, m: 81 },
      { step: 16, m: 81 }, { step: 18, m: 78 }, { step: 20, m: 76 }, { step: 22, m: 73 },
      { step: 24, m: 74 }, { step: 25, m: 76 }, { step: 26, m: 74 }, { step: 27, m: 73 },
      { step: 28, m: 71 }, { step: 30, m: 69 },
    ];

    fanfareR.forEach((f) => {
      addR(baseStep + f.step, f.m, 1.6, 0.92);
      // Double octave effect for authentic Turkish march power
      addR(baseStep + f.step, f.m - 12, 1.4, 0.75);
    });

    // Booming march bass in A major
    addMarchBass(baseStep + 0, 45, 54, 57, 2); // A2 + (F#3, A3)
    addMarchBass(baseStep + 8, 45, 52, 57, 2); // A2 + (E3, A3)
    addMarchBass(baseStep + 16, 50, 54, 57, 2); // D3 + (F#3, A3)
    addMarchBass(baseStep + 24, 40, 52, 56, 2); // E2 + (E3, G#3)
  };

  renderThemeB(70);
  renderThemeB(104);

  // ----------------------------------------------------
  // SECTION 3: F# MINOR DEVELOPMENT / PASSAGE
  // ----------------------------------------------------
  const baseF = 140;
  const passageR = [
    { step: 0, m: 66 }, { step: 1, m: 68 }, { step: 2, m: 69 }, { step: 3, m: 71 },
    { step: 4, m: 73 }, { step: 5, m: 74 }, { step: 6, m: 76 }, { step: 7, m: 78 },
    { step: 8, m: 78 }, { step: 10, m: 76 }, { step: 12, m: 74 }, { step: 14, m: 73 },
    { step: 16, m: 71 }, { step: 18, m: 69 }, { step: 20, m: 68 }, { step: 22, m: 69 },
    { step: 24, m: 71 }, { step: 26, m: 73 }, { step: 28, m: 71 }, { step: 30, m: 68 },
    { step: 32, m: 69 },
  ];

  passageR.forEach((p) => {
    addR(baseF + p.step, p.m, 1.7, 0.88);
  });

  addMarchBass(baseF + 0, 42, 49, 54, 2); // F#2 + (C#3, F#3)
  addMarchBass(baseF + 8, 45, 49, 57, 2); // A2 + (C#3, A3)
  addMarchBass(baseF + 16, 47, 50, 54, 2); // B2 + (D3, F#3)
  addMarchBass(baseF + 24, 40, 47, 52, 2); // E2 + (B2, E3)

  // ----------------------------------------------------
  // SECTION 4: THEME A GRAND RETURN & CODA FINALE
  // ----------------------------------------------------
  const codaStep = 180;
  renderThemeA(codaStep);

  // Grand bravura finale chords
  const finaleStep = codaStep + 36;
  const finaleChords = [
    { s: 0, r: [69, 73, 76, 81], l: [33, 45] },
    { s: 4, r: [71, 74, 76, 83], l: [40, 52] },
    { s: 8, r: [69, 73, 76, 81], l: [33, 45] },
    { s: 12, r: [71, 74, 76, 83], l: [40, 52] },
    { s: 16, r: [81, 85, 88, 93], l: [33, 45, 57] }, // High A6 octave
  ];

  finaleChords.forEach((c) => {
    c.r.forEach((midi) => addR(finaleStep + c.s, midi, c.s === 16 ? 6 : 2.5, 0.98));
    c.l.forEach((midi) => addL(finaleStep + c.s, midi, c.s === 16 ? 6 : 2.5, 0.95));
  });

  // Sort notes strictly by start time
  notes.sort((a, b) => a.time - b.time);
  return notes;
}

const rondoNotes = buildRondoAllaTurcaNotes();

export const rondoAllaTurcaSong: Song = {
  id: 'rondo-alla-turca',
  title: 'Rondo alla Turca',
  subTitle: 'Turkish March • Piano Sonata No. 11 K. 331',
  artist: 'Wolfgang Amadeus Mozart',
  difficulty: 'Hard',
  stars: 4,
  bpm: 126,
  duration: Math.ceil(rondoNotes[rondoNotes.length - 1].time + rondoNotes[rondoNotes.length - 1].duration + 2),
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Karya klasik Mozart yang lincah dan berenergi tinggi, memadukan melodi Allegretto yang riang dengan gaya mars A Mayor.',
  notes: rondoNotes,
};
