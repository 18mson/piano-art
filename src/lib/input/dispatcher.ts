import { audioEngine } from '../audio';

export type NoteEventListener = (
  midi: number,
  pressed: boolean,
  velocity?: number,
  x?: number,
  y?: number
) => void;

class InputDispatcher {
  private listeners = new Set<NoteEventListener>();
  private activeNotes = new Set<number>();

  public addListener(listener: NoteEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public noteOn(midi: number, velocity: number = 0.85, x?: number, y?: number): void {
    // Check bounds (A0 = 21, C8 = 108)
    if (midi < 21 || midi > 108) return;

    if (!audioEngine.getState().isInitialized) {
      audioEngine.initAudio().catch(() => {});
    }

    this.activeNotes.add(midi);
    audioEngine.noteOn(midi, velocity);

    this.listeners.forEach((listener) => {
      listener(midi, true, velocity, x, y);
    });
  }

  public noteOff(midi: number): void {
    if (!this.activeNotes.has(midi)) return;

    this.activeNotes.delete(midi);
    audioEngine.noteOff(midi);

    this.listeners.forEach((listener) => {
      listener(midi, false);
    });
  }

  public releaseAll(): void {
    this.activeNotes.forEach((midi) => {
      audioEngine.noteOff(midi);
      this.listeners.forEach((listener) => {
        listener(midi, false);
      });
    });
    this.activeNotes.clear();
    audioEngine.releaseAll();
  }

  public isNotePressed(midi: number): boolean {
    return this.activeNotes.has(midi);
  }

  public getActiveNotes(): Set<number> {
    return this.activeNotes;
  }
}

export const inputDispatcher = new InputDispatcher();
