import { Song, SongNote } from './types';

const LEAD_IN_SECONDS = 2.4;

export function buildInterstellarNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 104;
  const beat = 60 / bpm; // ~0.577s
  const eighth = beat / 2; // ~0.288s

  const addR = (step: number, midi: number, durationSteps: number = 1.8, vel: number = 0.85) => {
    notes.push({
      midi,
      time: Math.round((LEAD_IN_SECONDS + step * eighth) * 1000) / 1000,
      duration: Math.round((durationSteps * eighth * 0.95) * 1000) / 1000,
      hand: 'right',
      velocity: vel,
    });
  };

  const addL = (step: number, midi: number, durationSteps: number = 3.5, vel: number = 0.75) => {
    notes.push({
      midi,
      time: Math.round((LEAD_IN_SECONDS + step * eighth) * 1000) / 1000,
      duration: Math.round((durationSteps * eighth * 0.92) * 1000) / 1000,
      hand: 'left',
      velocity: vel,
    });
  };

  // ----------------------------------------------------
  // SECTION 1: INTRO (Atmospheric Clock Ticking Heartbeat)
  // ----------------------------------------------------
  // Iconic E5 paired with alternating notes: E5-D#5, E5-D5, E5-C5, E5-B4
  const introPairs = [
    { a: 76, b: 75 }, // E5 - D#5
    { a: 76, b: 74 }, // E5 - D5
    { a: 76, b: 72 }, // E5 - C5
    { a: 76, b: 71 }, // E5 - B4
    { a: 76, b: 72 }, // E5 - C5
    { a: 76, b: 74 }, // E5 - D5
    { a: 76, b: 76 }, // E5 - E5
    { a: 76, b: 71 }, // E5 - B4
  ];

  let currentStep = 0;
  for (let cycle = 0; cycle < 2; cycle++) {
    introPairs.forEach((pair) => {
      addR(currentStep, pair.a, 1.8, 0.7 + cycle * 0.08);
      addR(currentStep + 2, pair.b, 1.8, 0.75 + cycle * 0.08);

      // Deep atmospheric bass on bar starts
      if (currentStep % 8 === 0) {
        if (currentStep % 32 === 0) {
          addL(currentStep, 33, 7.5, 0.85); // A1 deep pedal
          addL(currentStep, 45, 7.5, 0.8);  // A2
        } else if (currentStep % 32 === 8) {
          addL(currentStep, 41, 7.5, 0.85); // F2
        } else if (currentStep % 32 === 16) {
          addL(currentStep, 36, 7.5, 0.85); // C2
        } else if (currentStep % 32 === 24) {
          addL(currentStep, 43, 7.5, 0.85); // G2
        }
      }
      currentStep += 4;
    });
  }

  // ----------------------------------------------------
  // SECTION 2: THE MAIN THEME (First Step - Harmonic Arpeggios)
  // ----------------------------------------------------
  // Chord progressions: Am -> F -> C -> G
  const renderArpeggioBar = (stepStart: number, rootMidi: number, chordNotes: number[], melodyNote1: number, melodyNote2: number) => {
    // Left hand rolling 8th note arpeggios
    chordNotes.forEach((m, idx) => {
      addL(stepStart + idx * 2, m, 3.8, 0.8);
    });

    // Right hand soaring motif
    addR(stepStart + 0, melodyNote1, 3.8, 0.9);
    addR(stepStart + 4, melodyNote2, 3.8, 0.92);
  };

  // Progression pass 1: Lyrical and emotional
  const pass1Prog = [
    { root: 45, notes: [45, 52, 57, 64], m1: 69, m2: 72 }, // Am: A2, E3, A3, E4 -> A4, C5
    { root: 41, notes: [41, 48, 53, 60], m1: 71, m2: 69 }, // F:  F2, C3, F3, C4 -> B4, A4
    { root: 36, notes: [36, 43, 48, 55], m1: 67, m2: 72 }, // C:  C2, G2, C3, G3 -> G4, C5
    { root: 43, notes: [43, 50, 55, 62], m1: 71, m2: 67 }, // G:  G2, D3, G3, D4 -> B4, G4

    { root: 45, notes: [45, 52, 57, 64], m1: 76, m2: 74 }, // Am: -> E5, D5
    { root: 41, notes: [41, 48, 53, 60], m1: 72, m2: 71 }, // F:  -> C5, B4
    { root: 36, notes: [36, 43, 48, 55], m1: 69, m2: 72 }, // C:  -> A4, C5
    { root: 40, notes: [40, 47, 52, 59], m1: 71, m2: 68 }, // E:  -> B4, G#4
  ];

  pass1Prog.forEach((bar) => {
    renderArpeggioBar(currentStep, bar.root, bar.notes, bar.m1, bar.m2);
    currentStep += 8;
  });

  // ----------------------------------------------------
  // SECTION 3: CORNFIELD CHASE CRESCENDO (Dramatic Climax)
  // ----------------------------------------------------
  // Fast, grand octave chords with dramatic pulsating triplets/eighths
  const climaxProg = [
    { root: 45, chord: [57, 60, 64], oct: [69, 81] }, // Am octave A4..A5
    { root: 41, chord: [53, 57, 60], oct: [65, 77] }, // F  octave F4..F5
    { root: 36, chord: [48, 52, 55], oct: [67, 79] }, // C  octave G4..G5
    { root: 43, chord: [50, 55, 59], oct: [71, 83] }, // G  octave B4..B5

    { root: 45, chord: [57, 60, 64], oct: [72, 84] }, // Am octave C5..C6
    { root: 41, chord: [53, 57, 60], oct: [74, 86] }, // F  octave D5..D6
    { root: 38, chord: [50, 53, 57], oct: [76, 88] }, // Dm octave E5..E6
    { root: 40, chord: [52, 56, 59], oct: [71, 83] }, // E7 octave B4..B5
  ];

  climaxProg.forEach((bar) => {
    // Powerful deep bass
    addL(currentStep, bar.root - 12, 7.0, 0.95);
    addL(currentStep, bar.root, 7.0, 0.9);

    // Left hand inner pulses
    for (let p = 0; p < 4; p++) {
      bar.chord.forEach((cm) => addL(currentStep + p * 2, cm, 1.8, 0.8));
    }

    // Right hand soaring octave bells
    addR(currentStep + 0, bar.oct[0], 3.8, 0.98);
    addR(currentStep + 0, bar.oct[1], 3.8, 0.98);
    addR(currentStep + 4, bar.oct[0], 3.8, 0.95);
    addR(currentStep + 4, bar.oct[1], 3.8, 0.95);

    currentStep += 8;
  });

  // ----------------------------------------------------
  // SECTION 4: OUTRO (Return to the Stars / Peaceful Clock)
  // ----------------------------------------------------
  const outroPairs = [
    { a: 76, b: 72 }, // E5 - C5
    { a: 76, b: 71 }, // E5 - B4
    { a: 76, b: 69 }, // E5 - A4
    { a: 76, b: 67 }, // E5 - G4
    { a: 72, b: 69 }, // C5 - A4
  ];

  outroPairs.forEach((pair) => {
    addR(currentStep, pair.a, 2.5, 0.7);
    addR(currentStep + 2, pair.b, 2.5, 0.65);
    currentStep += 4;
  });

  // Final resolving A minor chord
  addL(currentStep, 33, 10.0, 0.85); // A1
  addL(currentStep, 45, 10.0, 0.8);  // A2
  addL(currentStep, 52, 10.0, 0.75); // E3
  addR(currentStep, 60, 10.0, 0.75); // C4
  addR(currentStep, 64, 10.0, 0.75); // E4
  addR(currentStep, 69, 10.0, 0.8);  // A4

  // Sort notes strictly by start time
  notes.sort((a, b) => a.time - b.time);
  return notes;
}

const interstellarNotes = buildInterstellarNotes();

export const interstellarSong: Song = {
  id: 'interstellar-theme',
  title: 'Interstellar',
  subTitle: 'First Step & Cornfield Chase',
  artist: 'Hans Zimmer',
  difficulty: 'Normal',
  stars: 3,
  bpm: 104,
  duration: Math.ceil(interstellarNotes[interstellarNotes.length - 1].time + interstellarNotes[interstellarNotes.length - 1].duration + 2),
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Soundtrack sinematik legendaris karya Hans Zimmer yang penuh emosi, diawali detak jam atmosferik hingga klimaks arpeggio organ yang megah.',
  notes: interstellarNotes,
};
