import { inputDispatcher } from './dispatcher';

// Keyboard semitone offsets relative to base octave C note (0..23)
// Lower octave (C rendah): QWERTY row (Q..U, 2..7)
// Higher octave (C di atasnya): Bottom row shifted (V.. /, G.. ;)
export const KEY_MAP: Record<string, number> = {
  // Lower octave (QWERTY row) - C{baseOctave}
  KeyQ: 0,   // C
  Digit2: 1, // C#
  KeyW: 2,   // D
  Digit3: 3, // D#
  KeyE: 4,   // E
  KeyR: 5,   // F
  Digit5: 6, // F#
  KeyT: 7,   // G
  Digit6: 8, // G#
  KeyY: 9,   // A
  Digit7: 10,// A#
  KeyU: 11,  // B

  // Higher octave (Bottom row: C.. / and black keys F, G, J, K, L) - C{baseOctave + 1}
  KeyC: 12,   // C
  KeyF: 13,   // C#
  KeyV: 14,   // D
  KeyG: 15,   // D#
  KeyB: 16,   // E
  KeyN: 17,   // F
  KeyJ: 18,   // F#
  KeyM: 19,   // G
  KeyK: 20,   // G#
  Comma: 21,  // A
  KeyL: 22,   // A#
  Period: 23, // B
  Slash: 24,  // Closing C (C{baseOctave + 2})
};

export interface KeyBindingInfo {
  offset: number; // 0..24
  code: string;
  keyLabel: string;
  noteNameWithoutOctave: string;
  row: 'lower' | 'upper';
  isBlack: boolean;
  octaveOffset: number; // 0 for base octave, 1 for base octave + 1, 2 for closing C
}

export const OFFSET_TO_KEY_BINDING: Record<number, KeyBindingInfo> = {
  // Lower octave (QWERTY - base octave)
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

  // Higher octave (C.. / and black keys F, G, J, K, L) - base octave + 1 and closing C
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

/**
 * Returns PC keyboard key binding information for a given MIDI note number and base octave.
 * Returns null if the note is outside the 2-octave + closing C keyboard mapping.
 */
export function getKeyboardKeyForMidi(midi: number, baseOctave: number): KeyBindingInfo | null {
  const baseMidi = (baseOctave + 1) * 12; // C of base octave
  const offset = midi - baseMidi;
  if (offset >= 0 && offset <= 24) {
    return OFFSET_TO_KEY_BINDING[offset] || null;
  }
  return null;
}

/**
 * Returns all 25 key bindings with calculated MIDI numbers for the given base octave.
 */
export function getAllKeyboardBindings(baseOctave: number): (KeyBindingInfo & { midi: number; noteName: string })[] {
  const baseMidi = (baseOctave + 1) * 12;
  return Object.values(OFFSET_TO_KEY_BINDING).map((info) => {
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

      const offset = KEY_MAP[e.code];
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
