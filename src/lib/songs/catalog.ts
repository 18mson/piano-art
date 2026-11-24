import { Song, SongNote } from './types';
import { yoasobiBlueSong } from './yoasobiBlue';

const LEAD_IN_SECONDS = 2.4; // Grace period so notes fall gracefully from the top of the canvas

// ========================================================
// 1. Twinkle Twinkle Little Star (Easy - 1 Star) - FULL SONG
// Complete A-B-A-B-A multi-verse arrangement with variation
// ========================================================
function buildTwinkleNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 100;
  const beat = 60 / bpm; // 0.6s

  // VERSE 1: Traditional theme (Beats 0..42)
  const v1Melody = [
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

    { m: 67, b: 24, d: 0.8 }, { m: 67, b: 25, d: 0.8 },
    { m: 65, b: 26, d: 0.8 }, { m: 65, b: 27, d: 0.8 },
    { m: 64, b: 28, d: 0.8 }, { m: 64, b: 29, d: 0.8 },
    { m: 62, b: 30, d: 1.8 },

    // Return
    { m: 60, b: 32, d: 0.8 }, { m: 60, b: 33, d: 0.8 },
    { m: 67, b: 34, d: 0.8 }, { m: 67, b: 35, d: 0.8 },
    { m: 69, b: 36, d: 0.8 }, { m: 69, b: 37, d: 0.8 },
    { m: 67, b: 38, d: 1.8 },
    { m: 65, b: 40, d: 0.8 }, { m: 65, b: 41, d: 0.8 },
    { m: 64, b: 42, d: 0.8 }, { m: 64, b: 43, d: 0.8 },
    { m: 62, b: 44, d: 0.8 }, { m: 62, b: 45, d: 0.8 },
    { m: 60, b: 46, d: 2.5 },
  ];

  // VERSE 2: Higher octave variation + lilting rhythm (Beats 50..96)
  const v2Offset = 50;
  const v2Melody = [
    { m: 72, b: v2Offset + 0, d: 0.8 }, { m: 72, b: v2Offset + 1, d: 0.8 },
    { m: 79, b: v2Offset + 2, d: 0.8 }, { m: 79, b: v2Offset + 3, d: 0.8 },
    { m: 81, b: v2Offset + 4, d: 0.8 }, { m: 81, b: v2Offset + 5, d: 0.8 },
    { m: 79, b: v2Offset + 6, d: 1.8 },

    { m: 77, b: v2Offset + 8, d: 0.8 }, { m: 77, b: v2Offset + 9, d: 0.8 },
    { m: 76, b: v2Offset + 10, d: 0.8 }, { m: 76, b: v2Offset + 11, d: 0.8 },
    { m: 74, b: v2Offset + 12, d: 0.8 }, { m: 74, b: v2Offset + 13, d: 0.8 },
    { m: 72, b: v2Offset + 14, d: 1.8 },

    // Middle verse 2
    { m: 79, b: v2Offset + 16, d: 0.8 }, { m: 79, b: v2Offset + 17, d: 0.8 },
    { m: 77, b: v2Offset + 18, d: 0.8 }, { m: 77, b: v2Offset + 19, d: 0.8 },
    { m: 76, b: v2Offset + 20, d: 0.8 }, { m: 76, b: v2Offset + 21, d: 0.8 },
    { m: 74, b: v2Offset + 22, d: 1.8 },

    { m: 79, b: v2Offset + 24, d: 0.8 }, { m: 79, b: v2Offset + 25, d: 0.8 },
    { m: 77, b: v2Offset + 26, d: 0.8 }, { m: 77, b: v2Offset + 27, d: 0.8 },
    { m: 76, b: v2Offset + 28, d: 0.8 }, { m: 76, b: v2Offset + 29, d: 0.8 },
    { m: 74, b: v2Offset + 30, d: 1.8 },

    // Grand Finale Return
    { m: 72, b: v2Offset + 32, d: 0.8 }, { m: 72, b: v2Offset + 33, d: 0.8 },
    { m: 79, b: v2Offset + 34, d: 0.8 }, { m: 79, b: v2Offset + 35, d: 0.8 },
    { m: 81, b: v2Offset + 36, d: 0.8 }, { m: 81, b: v2Offset + 37, d: 0.8 },
    { m: 79, b: v2Offset + 38, d: 1.8 },
    { m: 77, b: v2Offset + 40, d: 0.8 }, { m: 77, b: v2Offset + 41, d: 0.8 },
    { m: 76, b: v2Offset + 42, d: 0.8 }, { m: 76, b: v2Offset + 43, d: 0.8 },
    { m: 74, b: v2Offset + 44, d: 0.8 }, { m: 74, b: v2Offset + 45, d: 0.8 },
    { m: 72, b: v2Offset + 46, d: 3.5 },
  ];

  // Rich bass progression across both verses
  const bass = [
    // Verse 1
    { m: 48, b: 0, d: 1.8 }, { m: 48, b: 2, d: 1.8 }, { m: 45, b: 4, d: 1.8 }, { m: 48, b: 6, d: 1.8 },
    { m: 41, b: 8, d: 1.8 }, { m: 48, b: 10, d: 1.8 }, { m: 43, b: 12, d: 1.8 }, { m: 48, b: 14, d: 1.8 },
    { m: 48, b: 16, d: 1.8 }, { m: 41, b: 18, d: 1.8 }, { m: 48, b: 20, d: 1.8 }, { m: 43, b: 22, d: 1.8 },
    { m: 48, b: 24, d: 1.8 }, { m: 41, b: 26, d: 1.8 }, { m: 48, b: 28, d: 1.8 }, { m: 43, b: 30, d: 1.8 },
    { m: 48, b: 32, d: 1.8 }, { m: 48, b: 34, d: 1.8 }, { m: 45, b: 36, d: 1.8 }, { m: 48, b: 38, d: 1.8 },
    { m: 41, b: 40, d: 1.8 }, { m: 48, b: 42, d: 1.8 }, { m: 43, b: 44, d: 1.8 }, { m: 48, b: 46, d: 2.5 },

    // Verse 2
    { m: 48, b: v2Offset + 0, d: 1.8 }, { m: 52, b: v2Offset + 2, d: 1.8 }, { m: 45, b: v2Offset + 4, d: 1.8 }, { m: 48, b: v2Offset + 6, d: 1.8 },
    { m: 41, b: v2Offset + 8, d: 1.8 }, { m: 48, b: v2Offset + 10, d: 1.8 }, { m: 43, b: v2Offset + 12, d: 1.8 }, { m: 48, b: v2Offset + 14, d: 1.8 },
    { m: 48, b: v2Offset + 16, d: 1.8 }, { m: 41, b: v2Offset + 18, d: 1.8 }, { m: 48, b: v2Offset + 20, d: 1.8 }, { m: 43, b: v2Offset + 22, d: 1.8 },
    { m: 48, b: v2Offset + 24, d: 1.8 }, { m: 41, b: v2Offset + 26, d: 1.8 }, { m: 48, b: v2Offset + 28, d: 1.8 }, { m: 43, b: v2Offset + 30, d: 1.8 },
    { m: 48, b: v2Offset + 32, d: 1.8 }, { m: 52, b: v2Offset + 34, d: 1.8 }, { m: 45, b: v2Offset + 36, d: 1.8 }, { m: 48, b: v2Offset + 38, d: 1.8 },
    { m: 41, b: v2Offset + 40, d: 1.8 }, { m: 48, b: v2Offset + 42, d: 1.8 }, { m: 43, b: v2Offset + 44, d: 1.8 }, { m: 36, b: v2Offset + 46, d: 4.0 },
  ];

  [...v1Melody, ...v2Melody].forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'right',
      velocity: 0.85,
    });
  });

  bass.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
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
  subTitle: 'Bintang Kecil (Full)',
  artist: 'Tradisional / Mozart',
  difficulty: 'Easy',
  stars: 1,
  bpm: 100,
  duration: Math.ceil(twinkleNotes[twinkleNotes.length - 1].time + twinkleNotes[twinkleNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 3,
  description: 'Lagu klasik lengkap dengan dua bait melodi dan variasi oktaf tinggi yang ramah pemula.',
  notes: twinkleNotes,
};

// ========================================================
// 2. Ode to Joy (Beethoven - Symphony No. 9) - FULL THEME
// Complete with Beethoven Bridge, Verse 2, and Grand Coda
// ========================================================
function buildOdeToJoyNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 112;
  const beat = 60 / bpm; // ~0.535s

  const melody = [
    // PART 1: Main Theme (Beats 0..14)
    { m: 64, b: 0, d: 0.9 }, { m: 64, b: 1, d: 0.9 }, { m: 65, b: 2, d: 0.9 }, { m: 67, b: 3, d: 0.9 },
    { m: 67, b: 4, d: 0.9 }, { m: 65, b: 5, d: 0.9 }, { m: 64, b: 6, d: 0.9 }, { m: 62, b: 7, d: 0.9 },
    { m: 60, b: 8, d: 0.9 }, { m: 60, b: 9, d: 0.9 }, { m: 62, b: 10, d: 0.9 }, { m: 64, b: 11, d: 0.9 },
    { m: 64, b: 12, d: 1.4 }, { m: 62, b: 13.5, d: 0.5 }, { m: 62, b: 14, d: 1.8 },

    // PART 2: Second phrase
    { m: 64, b: 16, d: 0.9 }, { m: 64, b: 17, d: 0.9 }, { m: 65, b: 18, d: 0.9 }, { m: 67, b: 19, d: 0.9 },
    { m: 67, b: 20, d: 0.9 }, { m: 65, b: 21, d: 0.9 }, { m: 64, b: 22, d: 0.9 }, { m: 62, b: 23, d: 0.9 },
    { m: 60, b: 24, d: 0.9 }, { m: 60, b: 25, d: 0.9 }, { m: 62, b: 26, d: 0.9 }, { m: 64, b: 27, d: 0.9 },
    { m: 62, b: 28, d: 1.4 }, { m: 60, b: 29.5, d: 0.5 }, { m: 60, b: 30, d: 1.8 },

    // PART 3: The Famous Beethoven Bridge (Beats 32..46)
    // "D D E C | D E/F E C | D E/F E D | C D G..."
    { m: 62, b: 32, d: 0.9 }, { m: 62, b: 33, d: 0.9 }, { m: 64, b: 34, d: 0.9 }, { m: 60, b: 35, d: 0.9 },
    { m: 62, b: 36, d: 0.9 }, { m: 64, b: 37, d: 0.45 }, { m: 65, b: 37.5, d: 0.45 }, { m: 64, b: 38, d: 0.9 }, { m: 60, b: 39, d: 0.9 },
    { m: 62, b: 40, d: 0.9 }, { m: 64, b: 41, d: 0.45 }, { m: 65, b: 41.5, d: 0.45 }, { m: 64, b: 42, d: 0.9 }, { m: 62, b: 43, d: 0.9 },
    { m: 60, b: 44, d: 0.9 }, { m: 62, b: 45, d: 0.9 }, { m: 55, b: 46, d: 1.8 },

    // PART 4: Theme Return
    { m: 64, b: 48, d: 0.9 }, { m: 64, b: 49, d: 0.9 }, { m: 65, b: 50, d: 0.9 }, { m: 67, b: 51, d: 0.9 },
    { m: 67, b: 52, d: 0.9 }, { m: 65, b: 53, d: 0.9 }, { m: 64, b: 54, d: 0.9 }, { m: 62, b: 55, d: 0.9 },
    { m: 60, b: 56, d: 0.9 }, { m: 60, b: 57, d: 0.9 }, { m: 62, b: 58, d: 0.9 }, { m: 64, b: 59, d: 0.9 },
    { m: 62, b: 60, d: 1.4 }, { m: 60, b: 61.5, d: 0.5 }, { m: 60, b: 62, d: 2.2 },

    // PART 5: Triumphant Climax in Octave (Beats 64..94)
    { m: 76, b: 64, d: 0.9 }, { m: 76, b: 65, d: 0.9 }, { m: 77, b: 66, d: 0.9 }, { m: 79, b: 67, d: 0.9 },
    { m: 79, b: 68, d: 0.9 }, { m: 77, b: 69, d: 0.9 }, { m: 76, b: 70, d: 0.9 }, { m: 74, b: 71, d: 0.9 },
    { m: 72, b: 72, d: 0.9 }, { m: 72, b: 73, d: 0.9 }, { m: 74, b: 74, d: 0.9 }, { m: 76, b: 75, d: 0.9 },
    { m: 74, b: 76, d: 1.4 }, { m: 72, b: 77.5, d: 0.5 }, { m: 72, b: 78, d: 2.0 },

    // Final Grand Coda (Beats 80..96)
    { m: 74, b: 80, d: 0.9 }, { m: 74, b: 81, d: 0.9 }, { m: 76, b: 82, d: 0.9 }, { m: 72, b: 83, d: 0.9 },
    { m: 74, b: 84, d: 0.9 }, { m: 76, b: 85, d: 0.9 }, { m: 77, b: 86, d: 0.9 }, { m: 79, b: 87, d: 1.8 },
    { m: 76, b: 89, d: 0.9 }, { m: 74, b: 90, d: 0.9 }, { m: 72, b: 91, d: 3.0 },
  ];

  const bass = [
    { m: 48, b: 0, d: 3.5 }, { m: 48, b: 4, d: 3.5 }, { m: 48, b: 8, d: 3.5 }, { m: 43, b: 12, d: 3.5 },
    { m: 48, b: 16, d: 3.5 }, { m: 48, b: 20, d: 3.5 }, { m: 48, b: 24, d: 3.5 }, { m: 48, b: 28, d: 3.5 },
    { m: 43, b: 32, d: 3.5 }, { m: 48, b: 36, d: 3.5 }, { m: 43, b: 40, d: 3.5 }, { m: 43, b: 44, d: 3.5 },
    { m: 48, b: 48, d: 3.5 }, { m: 48, b: 52, d: 3.5 }, { m: 48, b: 56, d: 3.5 }, { m: 48, b: 60, d: 3.5 },
    { m: 48, b: 64, d: 3.5 }, { m: 48, b: 68, d: 3.5 }, { m: 48, b: 72, d: 3.5 }, { m: 48, b: 76, d: 3.5 },
    { m: 43, b: 80, d: 3.5 }, { m: 48, b: 84, d: 3.5 }, { m: 48, b: 88, d: 3.5 }, { m: 36, b: 91, d: 4.0 },
  ];

  melody.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'right',
      velocity: 0.85,
    });
  });

  bass.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'left',
      velocity: 0.7,
    });
  });

  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const odeToJoyNotes = buildOdeToJoyNotes();
export const odeToJoySong: Song = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  subTitle: 'Simfoni No. 9 (Lengkap)',
  artist: 'Ludwig van Beethoven',
  difficulty: 'Easy',
  stars: 1,
  bpm: 112,
  duration: Math.ceil(odeToJoyNotes[odeToJoyNotes.length - 1].time + odeToJoyNotes[odeToJoyNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 3,
  description: 'Komposisi agung Beethoven berdurasi lengkap mencakup jembatan melodi orisinal dan klimaks akord piano.',
  notes: odeToJoyNotes,
};

// ========================================================
// 3. Happy Birthday to You - FULL CELEBRATION (2 Rounds)
// ========================================================
function buildHappyBirthdayNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 105;
  const beat = 60 / bpm; // ~0.571s

  // Round 1 (Beats 0..48)
  const round1 = [
    { m: 60, b: 0, d: 0.75 }, { m: 60, b: 1, d: 0.75 }, { m: 62, b: 2, d: 1.5 }, { m: 60, b: 4, d: 1.5 },
    { m: 65, b: 6, d: 1.5 }, { m: 64, b: 8, d: 2.8 },

    { m: 60, b: 12, d: 0.75 }, { m: 60, b: 13, d: 0.75 }, { m: 62, b: 14, d: 1.5 }, { m: 60, b: 16, d: 1.5 },
    { m: 67, b: 18, d: 1.5 }, { m: 65, b: 20, d: 2.8 },

    { m: 60, b: 24, d: 0.75 }, { m: 60, b: 25, d: 0.75 }, { m: 72, b: 26, d: 1.5 }, { m: 69, b: 28, d: 1.5 },
    { m: 65, b: 30, d: 1.5 }, { m: 64, b: 32, d: 1.5 }, { m: 62, b: 34, d: 2.5 },

    { m: 70, b: 38, d: 0.75 }, { m: 70, b: 39, d: 0.75 }, { m: 69, b: 40, d: 1.5 }, { m: 65, b: 42, d: 1.5 },
    { m: 67, b: 44, d: 1.5 }, { m: 65, b: 46, d: 3.0 },
  ];

  // Round 2 (Higher Octave with Jazz Harmonies, Beats 52..100)
  const r2Offset = 52;
  const round2 = [
    { m: 72, b: r2Offset + 0, d: 0.75 }, { m: 72, b: r2Offset + 1, d: 0.75 }, { m: 74, b: r2Offset + 2, d: 1.5 }, { m: 72, b: r2Offset + 4, d: 1.5 },
    { m: 77, b: r2Offset + 6, d: 1.5 }, { m: 76, b: r2Offset + 8, d: 2.8 },

    { m: 72, b: r2Offset + 12, d: 0.75 }, { m: 72, b: r2Offset + 13, d: 0.75 }, { m: 74, b: r2Offset + 14, d: 1.5 }, { m: 72, b: r2Offset + 16, d: 1.5 },
    { m: 79, b: r2Offset + 18, d: 1.5 }, { m: 77, b: r2Offset + 20, d: 2.8 },

    // Grand wish: Dear friend!
    { m: 72, b: r2Offset + 24, d: 0.75 }, { m: 72, b: r2Offset + 25, d: 0.75 }, { m: 84, b: r2Offset + 26, d: 1.8 }, { m: 81, b: r2Offset + 28, d: 1.5 },
    { m: 77, b: r2Offset + 30, d: 1.5 }, { m: 76, b: r2Offset + 32, d: 1.5 }, { m: 74, b: r2Offset + 34, d: 2.5 },

    // Grand resolution
    { m: 82, b: r2Offset + 38, d: 0.75 }, { m: 82, b: r2Offset + 39, d: 0.75 }, { m: 81, b: r2Offset + 40, d: 1.5 }, { m: 77, b: r2Offset + 42, d: 1.5 },
    { m: 79, b: r2Offset + 44, d: 1.5 }, { m: 77, b: r2Offset + 46, d: 4.0 },
  ];

  const bass = [
    // Round 1
    { m: 48, b: 0, d: 5.5 }, { m: 43, b: 6, d: 5.5 },
    { m: 43, b: 12, d: 5.5 }, { m: 48, b: 18, d: 5.5 },
    { m: 48, b: 24, d: 5.5 }, { m: 41, b: 30, d: 5.5 },
    { m: 41, b: 38, d: 3.5 }, { m: 43, b: 42, d: 3.5 }, { m: 48, b: 46, d: 4.0 },

    // Round 2
    { m: 48, b: r2Offset + 0, d: 5.5 }, { m: 43, b: r2Offset + 6, d: 5.5 },
    { m: 43, b: r2Offset + 12, d: 5.5 }, { m: 48, b: r2Offset + 18, d: 5.5 },
    { m: 48, b: r2Offset + 24, d: 5.5 }, { m: 41, b: r2Offset + 30, d: 5.5 },
    { m: 41, b: r2Offset + 38, d: 3.5 }, { m: 43, b: r2Offset + 42, d: 3.5 }, { m: 36, b: r2Offset + 46, d: 5.0 },
  ];

  [...round1, ...round2].forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'right',
      velocity: 0.85,
    });
  });

  bass.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'left',
      velocity: 0.7,
    });
  });

  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const happyBirthdayNotes = buildHappyBirthdayNotes();
export const happyBirthdaySong: Song = {
  id: 'happy-birthday',
  title: 'Happy Birthday to You',
  subTitle: 'Selamat Ulang Tahun (Lengkap)',
  artist: 'Patty & Mildred Hill',
  difficulty: 'Easy',
  stars: 1,
  bpm: 105,
  duration: Math.ceil(happyBirthdayNotes[happyBirthdayNotes.length - 1].time + happyBirthdayNotes[happyBirthdayNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 3,
  description: 'Versi perayaan lengkap 2 bait dengan harmoni piano kaya dan penutup megah.',
  notes: happyBirthdayNotes,
};

// ========================================================
// 4. Canon in D (Pachelbel) - FULL MASTERPIECE (4 Cycles)
// Complete classic variations through the famous 8-bar progression
// ========================================================
function buildCanonInDNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 90;
  const beat = 60 / bpm; // ~0.667s

  // CYCLE 1: Iconic Stately Theme (Beats 0..16)
  const c1 = [
    { m: 76, b: 0, d: 1.8 }, { m: 74, b: 2, d: 1.8 },
    { m: 72, b: 4, d: 1.8 }, { m: 71, b: 6, d: 1.8 },
    { m: 69, b: 8, d: 1.8 }, { m: 67, b: 10, d: 1.8 },
    { m: 69, b: 12, d: 1.8 }, { m: 71, b: 14, d: 1.8 },
  ];

  // CYCLE 2: Lilting Countermelody (Beats 16..32)
  const c2 = [
    { m: 72, b: 16, d: 0.9 }, { m: 71, b: 17, d: 0.9 }, { m: 72, b: 18, d: 0.9 }, { m: 60, b: 19, d: 0.9 },
    { m: 67, b: 20, d: 0.9 }, { m: 65, b: 21, d: 0.9 }, { m: 67, b: 22, d: 0.9 }, { m: 64, b: 23, d: 0.9 },
    { m: 65, b: 24, d: 0.9 }, { m: 64, b: 25, d: 0.9 }, { m: 65, b: 26, d: 0.9 }, { m: 60, b: 27, d: 0.9 },
    { m: 65, b: 28, d: 0.9 }, { m: 67, b: 29, d: 0.9 }, { m: 71, b: 30, d: 1.8 },
  ];

  // CYCLE 3: Flowing Arpeggiated Melody (Beats 32..48)
  const c3 = [
    { m: 76, b: 32, d: 0.5 }, { m: 79, b: 32.5, d: 0.5 }, { m: 74, b: 33, d: 0.5 }, { m: 77, b: 33.5, d: 0.5 },
    { m: 72, b: 34, d: 0.5 }, { m: 76, b: 34.5, d: 0.5 }, { m: 71, b: 35, d: 0.5 }, { m: 74, b: 35.5, d: 0.5 },
    { m: 69, b: 36, d: 0.5 }, { m: 72, b: 36.5, d: 0.5 }, { m: 67, b: 37, d: 0.5 }, { m: 71, b: 37.5, d: 0.5 },
    { m: 69, b: 38, d: 0.5 }, { m: 72, b: 38.5, d: 0.5 }, { m: 71, b: 39, d: 0.5 }, { m: 74, b: 39.5, d: 0.5 },

    { m: 72, b: 40, d: 0.9 }, { m: 74, b: 41, d: 0.9 }, { m: 76, b: 42, d: 0.9 }, { m: 77, b: 43, d: 0.9 },
    { m: 79, b: 44, d: 0.9 }, { m: 77, b: 45, d: 0.9 }, { m: 76, b: 46, d: 0.9 }, { m: 74, b: 47, d: 0.9 },
  ];

  // CYCLE 4: Soaring High Climax & Resolution (Beats 48..68)
  const c4 = [
    { m: 84, b: 48, d: 1.8 }, { m: 83, b: 50, d: 1.8 },
    { m: 81, b: 52, d: 1.8 }, { m: 79, b: 54, d: 1.8 },
    { m: 77, b: 56, d: 1.8 }, { m: 76, b: 58, d: 1.8 },
    { m: 77, b: 60, d: 1.8 }, { m: 79, b: 62, d: 1.8 },

    // Resolving Coda
    { m: 76, b: 64, d: 1.8 }, { m: 74, b: 66, d: 1.8 },
    { m: 72, b: 68, d: 4.0 },
  ];

  // Ground bass loop repeating over 4 cycles (C - G - Am - Em - F - C - F - G)
  const bass: { m: number; b: number; d: number }[] = [];
  const bassProgression = [
    { m: 48, d: 1.8 }, { m: 43, d: 1.8 },
    { m: 45, d: 1.8 }, { m: 40, d: 1.8 },
    { m: 41, d: 1.8 }, { m: 48, d: 1.8 },
    { m: 41, d: 1.8 }, { m: 43, d: 1.8 },
  ];

  for (let cycle = 0; cycle < 4; cycle++) {
    const cycleOffset = cycle * 16;
    bassProgression.forEach((ch, idx) => {
      bass.push({
        m: ch.m,
        b: cycleOffset + idx * 2,
        d: ch.d,
      });
    });
  }
  // Final root
  bass.push({ m: 36, b: 68, d: 5.0 });

  [...c1, ...c2, ...c3, ...c4].forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'right',
      velocity: 0.85,
    });
  });

  bass.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.b * beat) * 1000) / 1000,
      duration: Math.round(item.d * beat * 1000) / 1000,
      hand: 'left',
      velocity: 0.7,
    });
  });

  notes.sort((a, b) => a.time - b.time || a.midi - b.midi);
  return notes;
}

const canonInDNotes = buildCanonInDNotes();
export const canonInDSong: Song = {
  id: 'canon-in-d',
  title: 'Canon in D',
  subTitle: 'Pachelbel Canon (Full)',
  artist: 'Johann Pachelbel',
  difficulty: 'Easy',
  stars: 2,
  bpm: 90,
  duration: Math.ceil(canonInDNotes[canonInDNotes.length - 1].time + canonInDNotes[canonInDNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Mahakarya Pachelbel berdurasi penuh melewati 4 siklus variasi arpeggio dan klimaks melodi tinggi.',
  notes: canonInDNotes,
};

// ========================================================
// 5. Für Elise (Beethoven) - FULL PIANO PIECE
// Complete with Section A, Section B (F Major), Return, and Coda
// ========================================================
function buildFurEliseNotes(): SongNote[] {
  const notes: SongNote[] = [];
  const bpm = 126;
  const beat = 60 / bpm; // ~0.476s
  const sixteenth = beat / 4;

  const sequence: { m: number; t: number; d: number; hand?: 'left' | 'right' }[] = [
    // PART A1 (Sixteenths 0..48)
    { m: 76, t: 0, d: 1.5 }, { m: 75, t: 1.5, d: 1.5 },
    { m: 76, t: 3, d: 1.5 }, { m: 75, t: 4.5, d: 1.5 },
    { m: 76, t: 6, d: 1.5 }, { m: 71, t: 7.5, d: 1.5 },
    { m: 74, t: 9, d: 1.5 }, { m: 72, t: 10.5, d: 1.5 },
    { m: 69, t: 12, d: 4 },

    { m: 45, t: 12, d: 4, hand: 'left' },
    { m: 52, t: 14, d: 3, hand: 'left' },
    { m: 57, t: 15, d: 3, hand: 'left' },
    { m: 60, t: 16, d: 3, hand: 'left' },

    { m: 60, t: 16, d: 2 }, { m: 64, t: 18, d: 2 }, { m: 69, t: 20, d: 2 }, { m: 71, t: 22, d: 4 },

    { m: 40, t: 22, d: 4, hand: 'left' },
    { m: 52, t: 24, d: 3, hand: 'left' },
    { m: 56, t: 25, d: 3, hand: 'left' },
    { m: 59, t: 26, d: 3, hand: 'left' },

    { m: 64, t: 26, d: 2 }, { m: 68, t: 28, d: 2 }, { m: 71, t: 30, d: 2 }, { m: 72, t: 32, d: 4 },

    // PART A2 Repeat
    { m: 76, t: 36, d: 1.5 }, { m: 75, t: 37.5, d: 1.5 },
    { m: 76, t: 39, d: 1.5 }, { m: 75, t: 40.5, d: 1.5 },
    { m: 76, t: 42, d: 1.5 }, { m: 71, t: 43.5, d: 1.5 },
    { m: 74, t: 45, d: 1.5 }, { m: 72, t: 46.5, d: 1.5 },
    { m: 69, t: 48, d: 4 },
    { m: 45, t: 48, d: 4, hand: 'left' },
    { m: 52, t: 50, d: 3, hand: 'left' },
    { m: 57, t: 51, d: 3, hand: 'left' },

    { m: 60, t: 52, d: 2 }, { m: 64, t: 54, d: 2 }, { m: 69, t: 56, d: 2 }, { m: 71, t: 58, d: 4 },
    { m: 40, t: 58, d: 4, hand: 'left' },
    { m: 52, t: 60, d: 3, hand: 'left' },
    { m: 56, t: 61, d: 3, hand: 'left' },

    { m: 64, t: 62, d: 2 }, { m: 72, t: 64, d: 2 }, { m: 71, t: 66, d: 2 }, { m: 69, t: 68, d: 6 },
    { m: 45, t: 68, d: 6, hand: 'left' },

    // PART B: The Bright Sunny F Major Episode (Sixteenths 76..120)
    // C5 F5 A5 C6 | Bb5 A5 G5 | F5...
    { m: 72, t: 76, d: 2 }, { m: 76, t: 78, d: 2 }, { m: 79, t: 80, d: 2 }, { m: 81, t: 82, d: 4 },
    { m: 41, t: 76, d: 6, hand: 'left' }, { m: 48, t: 80, d: 4, hand: 'left' },

    { m: 84, t: 86, d: 3 }, { m: 83, t: 89, d: 1.5 }, { m: 81, t: 90.5, d: 1.5 }, { m: 79, t: 92, d: 4 },
    { m: 43, t: 86, d: 6, hand: 'left' }, { m: 50, t: 90, d: 4, hand: 'left' },

    { m: 77, t: 96, d: 2 }, { m: 76, t: 98, d: 2 }, { m: 74, t: 100, d: 2 }, { m: 72, t: 102, d: 4 },
    { m: 45, t: 96, d: 6, hand: 'left' },

    // Dramatic descending chromatic bridge back to A minor
    { m: 76, t: 106, d: 1.5 }, { m: 75, t: 107.5, d: 1.5 }, { m: 74, t: 109, d: 1.5 }, { m: 73, t: 110.5, d: 1.5 },
    { m: 72, t: 112, d: 1.5 }, { m: 71, t: 113.5, d: 1.5 }, { m: 70, t: 115, d: 1.5 }, { m: 69, t: 116.5, d: 1.5 },

    // PART A3: Grand Return of the Main Theme (Sixteenths 120..168)
    { m: 76, t: 120, d: 1.5 }, { m: 75, t: 121.5, d: 1.5 },
    { m: 76, t: 123, d: 1.5 }, { m: 75, t: 124.5, d: 1.5 },
    { m: 76, t: 126, d: 1.5 }, { m: 71, t: 127.5, d: 1.5 },
    { m: 74, t: 129, d: 1.5 }, { m: 72, t: 130.5, d: 1.5 },
    { m: 69, t: 132, d: 4 },
    { m: 45, t: 132, d: 6, hand: 'left' },
    { m: 52, t: 134, d: 4, hand: 'left' },
    { m: 57, t: 136, d: 4, hand: 'left' },

    { m: 60, t: 138, d: 2 }, { m: 64, t: 140, d: 2 }, { m: 69, t: 142, d: 2 }, { m: 71, t: 144, d: 4 },
    { m: 40, t: 144, d: 6, hand: 'left' },

    { m: 64, t: 148, d: 2 }, { m: 68, t: 150, d: 2 }, { m: 71, t: 152, d: 2 }, { m: 72, t: 154, d: 4 },
    { m: 76, t: 158, d: 1.5 }, { m: 75, t: 159.5, d: 1.5 }, { m: 76, t: 161, d: 1.5 }, { m: 71, t: 162.5, d: 1.5 },
    { m: 69, t: 164, d: 6 },
    { m: 45, t: 164, d: 8, hand: 'left' },
    { m: 33, t: 164, d: 8, hand: 'left' },
  ];

  sequence.forEach((item) => {
    notes.push({
      midi: item.m,
      time: Math.round((LEAD_IN_SECONDS + item.t * sixteenth) * 1000) / 1000,
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
  subTitle: 'Bagatelle No. 25 in A Minor (Full)',
  artist: 'Ludwig van Beethoven',
  difficulty: 'Normal',
  stars: 3,
  bpm: 126,
  duration: Math.ceil(furEliseNotes[furEliseNotes.length - 1].time + furEliseNotes[furEliseNotes.length - 1].duration + 1),
  suggestedOctaves: 4,
  suggestedStartOctave: 2,
  description: 'Mahakarya klasik Beethoven berdurasi lengkap, merangkul tema arpeggio romantis dan bagian F mayor yang cerah.',
  notes: furEliseNotes,
};

// Master catalog: All songs now featured in full extended arrangements
export const SONGS_CATALOG: Song[] = [
  twinkleSong,
  odeToJoySong,
  happyBirthdaySong,
  canonInDSong,
  furEliseSong,
  yoasobiBlueSong,
];

export function getSongById(id: string): Song | undefined {
  return SONGS_CATALOG.find((s) => s.id === id);
}
