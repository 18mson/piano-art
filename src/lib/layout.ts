import { isBlackKey, midiToNoteName, MIN_MIDI, MAX_MIDI } from './music';

export interface KeyLayout {
  midi: number;
  noteName: string;
  isBlack: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PianoLayout {
  width: number;
  height: number;
  pianoY: number;
  pianoHeight: number;
  whiteKeyWidth: number;
  whiteKeyHeight: number;
  blackKeyWidth: number;
  blackKeyHeight: number;
  whiteKeys: KeyLayout[];
  blackKeys: KeyLayout[];
  allKeys: KeyLayout[];
  keyByMidi: Map<number, KeyLayout>;
  startMidi: number;
  endMidi: number;
  whiteKeyCount: number;
}

export interface LayoutOptions {
  screenWidth: number;
  screenHeight: number;
  octaves: number | 'all';
  startOctave: number; // 0 to 7 (0 = A0, 1 = C1, 2 = C2...)
  pianoHeightRatio?: number; // portion of screen for piano keys (default 0.6)
}

/**
 * Clamp startOctave into valid bounds for a given octave count.
 * 0 represents starting from lowest note A0.
 */
export function clampStartOctave(startOctave: number, octaves: number | 'all'): number {
  if (octaves === 'all') return 0;
  const maxStart = Math.max(0, 8 - octaves);
  return Math.max(0, Math.min(maxStart, startOctave));
}

/**
 * Single source of truth for piano geometry and hit-testing.
 */
export function computePianoLayout(options: LayoutOptions): PianoLayout {
  const {
    screenWidth,
    screenHeight,
    octaves,
    pianoHeightRatio = 0.60,
  } = options;

  const validStartOctave = clampStartOctave(options.startOctave, octaves);

  let startMidi: number;
  let endMidi: number;

  if (octaves === 'all') {
    startMidi = MIN_MIDI; // 21 (A0)
    endMidi = MAX_MIDI;   // 108 (C8)
  } else if (validStartOctave === 0) {
    startMidi = MIN_MIDI; // 21 (A0)
    endMidi = MIN_MIDI + (octaves * 12); // A{octaves}
  } else {
    startMidi = (validStartOctave + 1) * 12; // C{startOctave}
    endMidi = startMidi + (octaves * 12);    // C{startOctave + octaves}
  }

  // Find all white keys in the range to determine whiteKeyCount and indexing
  const whiteKeyMidis: number[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    if (!isBlackKey(m)) {
      whiteKeyMidis.push(m);
    }
  }

  const whiteKeyCount = whiteKeyMidis.length;
  const pianoHeight = Math.max(120, screenHeight * pianoHeightRatio);
  const pianoY = screenHeight - pianoHeight;

  // White key width fills screen width
  const whiteKeyWidth = screenWidth / whiteKeyCount;
  const whiteKeyHeight = pianoHeight;

  // Black key dimensions: 60% of white key width, 62% of white key height
  const blackKeyWidth = whiteKeyWidth * 0.60;
  const blackKeyHeight = whiteKeyHeight * 0.62;

  // Map each white key MIDI to its column index
  const whiteKeyIndexMap = new Map<number, number>();
  whiteKeyMidis.forEach((midi, idx) => {
    whiteKeyIndexMap.set(midi, idx);
  });

  const whiteKeys: KeyLayout[] = [];
  const blackKeys: KeyLayout[] = [];
  const allKeys: KeyLayout[] = [];
  const keyByMidi = new Map<number, KeyLayout>();

  // Compute white keys
  for (let i = 0; i < whiteKeyMidis.length; i++) {
    const midi = whiteKeyMidis[i];
    const key: KeyLayout = {
      midi,
      noteName: midiToNoteName(midi),
      isBlack: false,
      x: i * whiteKeyWidth,
      y: pianoY,
      width: whiteKeyWidth,
      height: whiteKeyHeight,
    };
    whiteKeys.push(key);
    allKeys.push(key);
    keyByMidi.set(midi, key);
  }

  // Compute black keys
  for (let m = startMidi; m <= endMidi; m++) {
    if (isBlackKey(m)) {
      // Find the white key immediately preceding this black key
      const prevWhiteMidi = m - 1;
      const prevIndex = whiteKeyIndexMap.get(prevWhiteMidi);

      if (prevIndex !== undefined) {
        // Center the black key over the boundary between prevIndex and prevIndex + 1
        const boundaryX = (prevIndex + 1) * whiteKeyWidth;
        const key: KeyLayout = {
          midi: m,
          noteName: midiToNoteName(m),
          isBlack: true,
          x: boundaryX - (blackKeyWidth / 2),
          y: pianoY,
          width: blackKeyWidth,
          height: blackKeyHeight,
        };
        blackKeys.push(key);
        allKeys.push(key);
        keyByMidi.set(m, key);
      }
    }
  }

  return {
    width: screenWidth,
    height: screenHeight,
    pianoY,
    pianoHeight,
    whiteKeyWidth,
    whiteKeyHeight,
    blackKeyWidth,
    blackKeyHeight,
    whiteKeys,
    blackKeys,
    allKeys,
    keyByMidi,
    startMidi,
    endMidi,
    whiteKeyCount,
  };
}

/**
 * Hit test function: black keys take priority over white keys.
 */
export function getKeyAtPoint(x: number, y: number, layout: PianoLayout): KeyLayout | null {
  if (y < layout.pianoY || y > layout.pianoY + layout.pianoHeight) {
    return null;
  }

  // 1. Check black keys first (hit priority)
  for (let i = 0; i < layout.blackKeys.length; i++) {
    const k = layout.blackKeys[i];
    if (x >= k.x && x < k.x + k.width && y >= k.y && y < k.y + k.height) {
      return k;
    }
  }

  // 2. Check white keys
  for (let i = 0; i < layout.whiteKeys.length; i++) {
    const k = layout.whiteKeys[i];
    if (x >= k.x && x < k.x + k.width && y >= k.y && y < k.y + k.height) {
      return k;
    }
  }

  return null;
}

const SEMITONE_TO_WHITE_INDEX = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

/**
 * Computes the exact geometric bounds of any MIDI note in the coordinate space of a given layout.
 * Works for notes inside the layout as well as notes off-screen to the left or right.
 */
export function getMidiKeyBoundsInLayout(
  midi: number,
  layout: PianoLayout
): { x: number; y: number; width: number; height: number; isBlack: boolean } {
  const existing = layout.keyByMidi.get(midi);
  if (existing) {
    return {
      x: existing.x,
      y: existing.y,
      width: existing.width,
      height: existing.height,
      isBlack: existing.isBlack,
    };
  }

  const isBlack = isBlackKey(midi);
  const octave = Math.floor(midi / 12) - 1;
  const semitone = ((midi % 12) + 12) % 12;
  const whiteIdx = octave * 7 + SEMITONE_TO_WHITE_INDEX[semitone];

  const startOctave = Math.floor(layout.startMidi / 12) - 1;
  const startSemitone = ((layout.startMidi % 12) + 12) % 12;
  const startWhiteIdx = startOctave * 7 + SEMITONE_TO_WHITE_INDEX[startSemitone];

  const relWhiteIdx = whiteIdx - startWhiteIdx;

  if (!isBlack) {
    return {
      x: relWhiteIdx * layout.whiteKeyWidth,
      y: layout.pianoY,
      width: layout.whiteKeyWidth,
      height: layout.whiteKeyHeight,
      isBlack: false,
    };
  } else {
    const boundaryX = (relWhiteIdx + 1) * layout.whiteKeyWidth;
    return {
      x: boundaryX - layout.blackKeyWidth / 2,
      y: layout.pianoY,
      width: layout.blackKeyWidth,
      height: layout.blackKeyHeight,
      isBlack: true,
    };
  }
}

