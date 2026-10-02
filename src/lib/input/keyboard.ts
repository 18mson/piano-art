import { inputDispatcher } from './dispatcher';

// Tracker layout semitone offsets relative to base octave C note (0..23)
const KEY_MAP: Record<string, number> = {
  // Lower row (base octave)
  KeyZ: 0,  // C
  KeyS: 1,  // C#
  KeyX: 2,  // D
  KeyD: 3,  // D#
  KeyC: 4,  // E
  KeyV: 5,  // F
  KeyG: 6,  // F#
  KeyB: 7,  // G
  KeyH: 8,  // G#
  KeyN: 9,  // A
  KeyJ: 10, // A#
  KeyM: 11, // B

  // Upper row (base octave + 1)
  KeyQ: 12, // C
  Digit2: 13, // C#
  KeyW: 14, // D
  Digit3: 15, // D#
  KeyE: 16, // E
  KeyR: 17, // F
  Digit5: 18, // F#
  KeyT: 19, // G
  Digit6: 20, // G#
  KeyY: 21, // A
  Digit7: 22, // A#
  KeyU: 23, // B
};

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
