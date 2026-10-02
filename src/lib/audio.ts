import * as Tone from 'tone';
import { midiToNoteName } from './music';

export interface AudioEngineState {
  isInitialized: boolean;
  isLoading: boolean;
  isReady: boolean;
  loadProgress: number; // 0 - 100
  sustain: boolean;
}

type StateListener = (state: AudioEngineState) => void;

class PianoAudioEngine {
  private sampler: Tone.Sampler | null = null;
  private fallbackSynth: Tone.PolySynth | null = null;
  private isInitialized = false;
  private isReady = false;
  private isLoading = false;
  private loadProgress = 0;
  private sustain = false;

  // Track physically held notes and sustained notes
  private heldNotes = new Set<number>();
  private sustainedNotes = new Set<number>();

  private listeners = new Set<StateListener>();

  public getState(): AudioEngineState {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      isReady: this.isReady,
      loadProgress: this.loadProgress,
      sustain: this.sustain,
    };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      listener(state);
    });
  }

  /**
   * Initializes audio context on first user gesture.
   */
  public async initAudio(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      // Optimize latency
      const ctx = Tone.getContext();
      ctx.lookAhead = 0.015;

      this.isInitialized = true;
      this.isLoading = true;
      this.notify();

      // Create fallback synth for instant sound
      this.fallbackSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.005,
          decay: 1.5,
          sustain: 0.3,
          release: 0.8,
        },
      }).toDestination();
      this.fallbackSynth.volume.value = -6;

      // Sample map matching downloaded Salamander files in /public/audio/piano/
      const sampleMap: Record<string, string> = {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      };

      this.sampler = new Tone.Sampler({
        urls: sampleMap,
        baseUrl: '/audio/piano/',
        release: 1.2,
        onload: () => {
          this.isReady = true;
          this.isLoading = false;
          this.loadProgress = 100;
          this.notify();
        },
        onerror: (err) => {
          console.warn('Tone.Sampler error, using fallback synth:', err);
          this.isReady = true;
          this.isLoading = false;
          this.notify();
        },
      }).toDestination();

      // Soft master reverb for natural piano resonance
      const reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.01, wet: 0.15 }).toDestination();
      this.sampler.connect(reverb);

    } catch (e) {
      console.error('Failed to initialize AudioContext:', e);
    }
  }

  public setSustain(enabled: boolean): void {
    this.sustain = enabled;
    if (!enabled) {
      // Release all notes that were sustained and are no longer physically held
      this.sustainedNotes.forEach((midi) => {
        if (!this.heldNotes.has(midi)) {
          this.releaseNote(midi);
        }
      });
      this.sustainedNotes.clear();
    }
    this.notify();
  }

  public getSustain(): boolean {
    return this.sustain;
  }

  /**
   * Universal noteOn entry point.
   */
  public noteOn(midi: number, velocity: number = 0.85): void {
    if (this.heldNotes.has(midi)) return; // Prevent re-trigger if already held
    this.heldNotes.add(midi);
    this.sustainedNotes.delete(midi);

    const noteName = midiToNoteName(midi);
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));

    if (this.sampler && this.isReady) {
      try {
        this.sampler.triggerAttack(noteName, Tone.now(), clampedVelocity);
      } catch {
        this.fallbackSynth?.triggerAttack(noteName, Tone.now(), clampedVelocity);
      }
    } else if (this.fallbackSynth) {
      this.fallbackSynth.triggerAttack(noteName, Tone.now(), clampedVelocity);
    }
  }

  /**
   * Universal noteOff entry point.
   */
  public noteOff(midi: number): void {
    if (!this.heldNotes.has(midi)) return;
    this.heldNotes.delete(midi);

    if (this.sustain) {
      // Hold note sound until sustain released
      this.sustainedNotes.add(midi);
    } else {
      this.releaseNote(midi);
    }
  }

  private releaseNote(midi: number): void {
    const noteName = midiToNoteName(midi);
    if (this.sampler && this.isReady) {
      try {
        this.sampler.triggerRelease(noteName, Tone.now());
      } catch {
        this.fallbackSynth?.triggerRelease(noteName, Tone.now());
      }
    } else if (this.fallbackSynth) {
      this.fallbackSynth.triggerRelease(noteName, Tone.now());
    }
  }

  /**
   * Safety: Release all currently held and sustained notes.
   */
  public releaseAll(): void {
    this.heldNotes.forEach((midi) => {
      this.releaseNote(midi);
    });
    this.sustainedNotes.forEach((midi) => {
      this.releaseNote(midi);
    });
    this.heldNotes.clear();
    this.sustainedNotes.clear();
  }
}

// Global audio singleton
export const audioEngine = new PianoAudioEngine();
