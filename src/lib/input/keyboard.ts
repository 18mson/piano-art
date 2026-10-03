import { inputDispatcher } from './dispatcher';

export interface KeyBindingInfo {
  offset: number; // Semitone offset from base octave C note
  code: string;
  keyLabel: string;
  noteNameWithoutOctave: string;
  row: 'lower' | 'upper';
  isBlack: boolean;
  octaveOffset: number; // 0, 1, 2, or 3
}

// ==========================================
// 1. 2-OCTAVE LAYOUT (For 1 & 2 octaves view)
// Lower octave: Q..U (2..7), Upper octave: C.. / (F..L)
// ==========================================
export const KEY_MAP_2_OCTAVES: Record<string, number> = {
  // Lower octave (QWERTY)
  KeyQ: 0, Digit2: 1, KeyW: 2, Digit3: 3, KeyE: 4, KeyR: 5,
  Digit5: 6, KeyT: 7, Digit6: 8, KeyY: 9, Digit7: 10, KeyU: 11,

  // Upper octave (C - /)
  KeyC: 12, KeyF: 13, KeyV: 14, KeyG: 15, KeyB: 16, KeyN: 17,
  KeyJ: 18, KeyM: 19, KeyK: 20, Comma: 21, KeyL: 22, Period: 23,
  Slash: 24,
};

export const OFFSET_TO_KEY_BINDING_2_OCTAVES: Record<number, KeyBindingInfo> = {
  0: { offset: 0, code: 'KeyQ', keyLabel: 'Q', noteNameWithoutOctave: 'C', row: 'lower', isBlack: false, octaveOffset: 0 },
  1: { offset: 1, code: 'Digit2', keyLabel: '2', noteNameWithoutOctave: 'C#', row: 'lower', isBlack: true, octaveOffset: 0 },
  2: { offset: 2, code: 'KeyW', keyLabel: 'W', noteNameWithoutOctave: 'D', row: 'lower', isBlack: false, octaveOffset: 0 },
  3: { offset: 3, code: 'Digit3', keyLabel: '3', noteNameWithoutOctave: 'D#', row: 'lower', isBlack: true, octaveOffset: 0 },
  4: { offset: 4, code: 'KeyE', keyLabel: 'E', noteNameWithoutOctave: 'E', row: 'lower', isBlack: false, octaveOffset: 0 },
  5: { offset: 5, code: 'KeyR', keyLabel: 'R', noteNameWithoutOctave: 'F', row: 'lower', isBlack: false, octaveOffset: 0 },
  6: { offset: 6, code: 'Digit5', keyLabel: '5', noteNameWithoutOctave: 'F#', row: 'lower', isBlack: true, octaveOffset: 0 },
  7: { offset: 7, code: 'KeyT', keyLabel: 'T', noteNameWithoutOctave: 'G', row: 'lower', isBlack: false, octaveOffset: 0 },
  8: { offset: 8, code: 'Digit6', keyLabel: '6', noteNameWithoutOctave: 'G#', row: 'lower', isBlack: true, octaveOffset: 0 },
  9: { offset: 9, code: 'KeyY', keyLabel: 'Y', noteNameWithoutOctave: 'A', row: 'lower', isBlack: false, octaveOffset: 0 },
  10: { offset: 10, code: 'Digit7', keyLabel: '7', noteNameWithoutOctave: 'A#', row: 'lower', isBlack: true, octaveOffset: 0 },
  11: { offset: 11, code: 'KeyU', keyLabel: 'U', noteNameWithoutOctave: 'B', row: 'lower', isBlack: false, octaveOffset: 0 },

  12: { offset: 12, code: 'KeyC', keyLabel: 'C', noteNameWithoutOctave: 'C', row: 'upper', isBlack: false, octaveOffset: 1 },
  13: { offset: 13, code: 'KeyF', keyLabel: 'F', noteNameWithoutOctave: 'C#', row: 'upper', isBlack: true, octaveOffset: 1 },
  14: { offset: 14, code: 'KeyV', keyLabel: 'V', noteNameWithoutOctave: 'D', row: 'upper', isBlack: false, octaveOffset: 1 },
  15: { offset: 15, code: 'KeyG', keyLabel: 'G', noteNameWithoutOctave: 'D#', row: 'upper', isBlack: true, octaveOffset: 1 },
  16: { offset: 16, code: 'KeyB', keyLabel: 'B', noteNameWithoutOctave: 'E', row: 'upper', isBlack: false, octaveOffset: 1 },
  17: { offset: 17, code: 'KeyN', keyLabel: 'N', noteNameWithoutOctave: 'F', row: 'upper', isBlack: false, octaveOffset: 1 },
  18: { offset: 18, code: 'KeyJ', keyLabel: 'J', noteNameWithoutOctave: 'F#', row: 'upper', isBlack: true, octaveOffset: 1 },
  19: { offset: 19, code: 'KeyM', keyLabel: 'M', noteNameWithoutOctave: 'G', row: 'upper', isBlack: false, octaveOffset: 1 },
  20: { offset: 20, code: 'KeyK', keyLabel: 'K', noteNameWithoutOctave: 'G#', row: 'upper', isBlack: true, octaveOffset: 1 },
  21: { offset: 21, code: 'Comma', keyLabel: ',', noteNameWithoutOctave: 'A', row: 'upper', isBlack: false, octaveOffset: 1 },
  22: { offset: 22, code: 'KeyL', keyLabel: 'L', noteNameWithoutOctave: 'A#', row: 'upper', isBlack: true, octaveOffset: 1 },
  23: { offset: 23, code: 'Period', keyLabel: '.', noteNameWithoutOctave: 'B', row: 'upper', isBlack: false, octaveOffset: 1 },
  24: { offset: 24, code: 'Slash', keyLabel: '/', noteNameWithoutOctave: 'C', row: 'upper', isBlack: false, octaveOffset: 2 },
};

// ==========================================
// 2. 3-OCTAVE CHROMATIC LAYOUT (For 3+ octaves view)
// Lower Octave & Half (Offsets 0..16): Z - / (white), A - ; (black)
// Upper Octave & Half (Offsets 17..36): Q - ] (white), 1 - = (black)
// ==========================================
export const KEY_MAP_3_OCTAVES: Record<string, number> = {
  // --- Lower Pair (Z.. / and S.. ;) ---
  KeyZ: 0,      // C
  KeyS: 1,      // C#
  KeyX: 2,      // D
  KeyD: 3,      // D#
  KeyC: 4,      // E
  KeyV: 5,      // F
  KeyG: 6,      // F#
  KeyB: 7,      // G
  KeyH: 8,      // G#
  KeyN: 9,      // A
  KeyJ: 10,     // A#
  KeyM: 11,     // B
  Comma: 12,    // C (Octave 2)
  KeyL: 13,     // C#
  Period: 14,   // D
  Semicolon: 15,// D#
  Slash: 16,    // E

  // --- Upper Pair (Q.. ] and 2.. -) ---
  KeyQ: 17,        // F (Octave 2)
  Digit2: 18,      // F#
  KeyW: 19,        // G
  Digit3: 20,      // G#
  KeyE: 21,        // A
  Digit4: 22,      // A#
  KeyR: 23,        // B
  KeyT: 24,        // C (Octave 3)
  Digit6: 25,      // C#
  KeyY: 26,        // D
  Digit7: 27,      // D#
  KeyU: 28,        // E
  KeyI: 29,        // F
  Digit9: 30,      // F#
  KeyO: 31,        // G
  Digit0: 32,      // G#
  KeyP: 33,        // A
  Minus: 34,       // A#
  BracketLeft: 35, // B
  BracketRight: 36,// C (Closing C - Octave 4)
};

export const OFFSET_TO_KEY_BINDING_3_OCTAVES: Record<number, KeyBindingInfo> = {
  // Lower pair
  0: { offset: 0, code: 'KeyZ', keyLabel: 'Z', noteNameWithoutOctave: 'C', row: 'lower', isBlack: false, octaveOffset: 0 },
  1: { offset: 1, code: 'KeyS', keyLabel: 'S', noteNameWithoutOctave: 'C#', row: 'lower', isBlack: true, octaveOffset: 0 },
  2: { offset: 2, code: 'KeyX', keyLabel: 'X', noteNameWithoutOctave: 'D', row: 'lower', isBlack: false, octaveOffset: 0 },
  3: { offset: 3, code: 'KeyD', keyLabel: 'D', noteNameWithoutOctave: 'D#', row: 'lower', isBlack: true, octaveOffset: 0 },
  4: { offset: 4, code: 'KeyC', keyLabel: 'C', noteNameWithoutOctave: 'E', row: 'lower', isBlack: false, octaveOffset: 0 },
  5: { offset: 5, code: 'KeyV', keyLabel: 'V', noteNameWithoutOctave: 'F', row: 'lower', isBlack: false, octaveOffset: 0 },
  6: { offset: 6, code: 'KeyG', keyLabel: 'G', noteNameWithoutOctave: 'F#', row: 'lower', isBlack: true, octaveOffset: 0 },
  7: { offset: 7, code: 'KeyB', keyLabel: 'B', noteNameWithoutOctave: 'G', row: 'lower', isBlack: false, octaveOffset: 0 },
  8: { offset: 8, code: 'KeyH', keyLabel: 'H', noteNameWithoutOctave: 'G#', row: 'lower', isBlack: true, octaveOffset: 0 },
  9: { offset: 9, code: 'KeyN', keyLabel: 'N', noteNameWithoutOctave: 'A', row: 'lower', isBlack: false, octaveOffset: 0 },
  10: { offset: 10, code: 'KeyJ', keyLabel: 'J', noteNameWithoutOctave: 'A#', row: 'lower', isBlack: true, octaveOffset: 0 },
  11: { offset: 11, code: 'KeyM', keyLabel: 'M', noteNameWithoutOctave: 'B', row: 'lower', isBlack: false, octaveOffset: 0 },
  12: { offset: 12, code: 'Comma', keyLabel: ',', noteNameWithoutOctave: 'C', row: 'lower', isBlack: false, octaveOffset: 1 },
  13: { offset: 13, code: 'KeyL', keyLabel: 'L', noteNameWithoutOctave: 'C#', row: 'lower', isBlack: true, octaveOffset: 1 },
  14: { offset: 14, code: 'Period', keyLabel: '.', noteNameWithoutOctave: 'D', row: 'lower', isBlack: false, octaveOffset: 1 },
  15: { offset: 15, code: 'Semicolon', keyLabel: ';', noteNameWithoutOctave: 'D#', row: 'lower', isBlack: true, octaveOffset: 1 },
  16: { offset: 16, code: 'Slash', keyLabel: '/', noteNameWithoutOctave: 'E', row: 'lower', isBlack: false, octaveOffset: 1 },

  // Upper pair
  17: { offset: 17, code: 'KeyQ', keyLabel: 'Q', noteNameWithoutOctave: 'F', row: 'upper', isBlack: false, octaveOffset: 1 },
  18: { offset: 18, code: 'Digit2', keyLabel: '2', noteNameWithoutOctave: 'F#', row: 'upper', isBlack: true, octaveOffset: 1 },
  19: { offset: 19, code: 'KeyW', keyLabel: 'W', noteNameWithoutOctave: 'G', row: 'upper', isBlack: false, octaveOffset: 1 },
  20: { offset: 20, code: 'Digit3', keyLabel: '3', noteNameWithoutOctave: 'G#', row: 'upper', isBlack: true, octaveOffset: 1 },
  21: { offset: 21, code: 'KeyE', keyLabel: 'E', noteNameWithoutOctave: 'A', row: 'upper', isBlack: false, octaveOffset: 1 },
  22: { offset: 22, code: 'Digit4', keyLabel: '4', noteNameWithoutOctave: 'A#', row: 'upper', isBlack: true, octaveOffset: 1 },
  23: { offset: 23, code: 'KeyR', keyLabel: 'R', noteNameWithoutOctave: 'B', row: 'upper', isBlack: false, octaveOffset: 1 },
  24: { offset: 24, code: 'KeyT', keyLabel: 'T', noteNameWithoutOctave: 'C', row: 'upper', isBlack: false, octaveOffset: 2 },
  25: { offset: 25, code: 'Digit6', keyLabel: '6', noteNameWithoutOctave: 'C#', row: 'upper', isBlack: true, octaveOffset: 2 },
  26: { offset: 26, code: 'KeyY', keyLabel: 'Y', noteNameWithoutOctave: 'D', row: 'upper', isBlack: false, octaveOffset: 2 },
  27: { offset: 27, code: 'Digit7', keyLabel: '7', noteNameWithoutOctave: 'D#', row: 'upper', isBlack: true, octaveOffset: 2 },
  28: { offset: 28, code: 'KeyU', keyLabel: 'U', noteNameWithoutOctave: 'E', row: 'upper', isBlack: false, octaveOffset: 2 },
  29: { offset: 29, code: 'KeyI', keyLabel: 'I', noteNameWithoutOctave: 'F', row: 'upper', isBlack: false, octaveOffset: 2 },
  30: { offset: 30, code: 'Digit9', keyLabel: '9', noteNameWithoutOctave: 'F#', row: 'upper', isBlack: true, octaveOffset: 2 },
  31: { offset: 31, code: 'KeyO', keyLabel: 'O', noteNameWithoutOctave: 'G', row: 'upper', isBlack: false, octaveOffset: 2 },
  32: { offset: 32, code: 'Digit0', keyLabel: '0', noteNameWithoutOctave: 'G#', row: 'upper', isBlack: true, octaveOffset: 2 },
  33: { offset: 33, code: 'KeyP', keyLabel: 'P', noteNameWithoutOctave: 'A', row: 'upper', isBlack: false, octaveOffset: 2 },
  34: { offset: 34, code: 'Minus', keyLabel: '-', noteNameWithoutOctave: 'A#', row: 'upper', isBlack: true, octaveOffset: 2 },
  35: { offset: 35, code: 'BracketLeft', keyLabel: '[', noteNameWithoutOctave: 'B', row: 'upper', isBlack: false, octaveOffset: 2 },
  36: { offset: 36, code: 'BracketRight', keyLabel: ']', noteNameWithoutOctave: 'C', row: 'upper', isBlack: false, octaveOffset: 3 },
};

// Default export alias for backwards compatibility
export const KEY_MAP = KEY_MAP_2_OCTAVES;
export const OFFSET_TO_KEY_BINDING = OFFSET_TO_KEY_BINDING_2_OCTAVES;

export function isThreeOctavesMode(octaves?: number | 'all'): boolean {
  return octaves === 'all' || (typeof octaves === 'number' && octaves >= 3);
}

/**
 * Returns PC keyboard key binding information for a given MIDI note number and base octave,
 * dynamically selecting the 2-octave or 3-octave map according to the active octave count.
 */
export function getKeyboardKeyForMidi(
  midi: number,
  baseOctave: number,
  octaves?: number | 'all'
): KeyBindingInfo | null {
  const baseMidi = (baseOctave + 1) * 12; // C of base octave
  const offset = midi - baseMidi;
  const use3Oct = isThreeOctavesMode(octaves);

  if (use3Oct) {
    if (offset >= 0 && offset <= 36) {
      return OFFSET_TO_KEY_BINDING_3_OCTAVES[offset] || null;
    }
  } else {
    if (offset >= 0 && offset <= 24) {
      return OFFSET_TO_KEY_BINDING_2_OCTAVES[offset] || null;
    }
  }
  return null;
}

/**
 * Returns all active key bindings with calculated MIDI numbers for the given base octave and layout mode.
 */
export function getAllKeyboardBindings(
  baseOctave: number,
  octaves?: number | 'all'
): (KeyBindingInfo & { midi: number; noteName: string })[] {
  const baseMidi = (baseOctave + 1) * 12;
  const use3Oct = isThreeOctavesMode(octaves);
  const map = use3Oct ? OFFSET_TO_KEY_BINDING_3_OCTAVES : OFFSET_TO_KEY_BINDING_2_OCTAVES;

  return Object.values(map).map((info) => {
    const midi = baseMidi + info.offset;
    const noteOctave = baseOctave + info.octaveOffset;
    return {
      ...info,
      midi,
      noteName: `${info.noteNameWithoutOctave}${noteOctave}`,
    };
  });
}

export class KeyboardInputHandler {
  private baseOctave = 4; // Default C4
  private octaves: number | 'all' = 4; // Defaults to current store value
  private activeKeys = new Map<string, number>(); // code -> midi
  private onOctaveShift?: (newOctave: number) => void;

  public setBaseOctave(octave: number): void {
    const clamped = Math.max(1, Math.min(6, octave));
    if (clamped !== this.baseOctave) {
      this.baseOctave = clamped;
      this.releaseAll();
    }
  }

  public getBaseOctave(): number {
    return this.baseOctave;
  }

  public setOctaves(octaves: number | 'all'): void {
    if (this.octaves !== octaves) {
      this.octaves = octaves;
      this.releaseAll();
    }
  }

  public getOctaves(): number | 'all' {
    return this.octaves;
  }

  public bind(onOctaveShift?: (newOctave: number) => void): () => void {
    this.onOctaveShift = onOctaveShift;

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Ignore auto-repeat
      if (e.repeat) return;

      // Handle Arrow keys for base octave shift
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const next = Math.max(1, this.baseOctave - 1);
        if (next !== this.baseOctave) {
          this.setBaseOctave(next);
          this.onOctaveShift?.(next);
        }
        return;
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(6, this.baseOctave + 1);
        if (next !== this.baseOctave) {
          this.setBaseOctave(next);
          this.onOctaveShift?.(next);
        }
        return;
      }

      const use3Oct = isThreeOctavesMode(this.octaves);
      const activeMap = use3Oct ? KEY_MAP_3_OCTAVES : KEY_MAP_2_OCTAVES;
      const offset = activeMap[e.code];

      if (offset !== undefined) {
        e.preventDefault();
        const baseMidi = (this.baseOctave + 1) * 12; // C of base octave
        const midi = baseMidi + offset;

        this.activeKeys.set(e.code, midi);
        inputDispatcher.noteOn(midi, 0.85);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (this.activeKeys.has(e.code)) {
        e.preventDefault();
        const midi = this.activeKeys.get(e.code)!;
        inputDispatcher.noteOff(midi);
        this.activeKeys.delete(e.code);
      }
    };

    const onWindowBlur = () => {
      this.releaseAll();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      this.releaseAll();
    };
  }

  public releaseAll(): void {
    this.activeKeys.forEach((midi) => {
      inputDispatcher.noteOff(midi);
    });
    this.activeKeys.clear();
  }
}
