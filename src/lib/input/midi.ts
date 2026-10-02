import { audioEngine } from '../audio';
import { inputDispatcher } from './dispatcher';

export interface MidiDeviceState {
  isSupported: boolean;
  isConnected: boolean;
  deviceName?: string;
  errorMessage?: string;
}

type MidiStateListener = (state: MidiDeviceState) => void;

interface MidiInputPort {
  id: string;
  name?: string;
  state?: string;
  onmidimessage: ((event: { data: Uint8Array }) => void) | null;
}

interface MidiAccessObject {
  inputs: Map<string, MidiInputPort>;
  onstatechange: (() => void) | null;
}

export class WebMidiHandler {
  private midiAccess: MidiAccessObject | null = null;
  private state: MidiDeviceState = {
    isSupported: false,
    isConnected: false,
  };
  private listeners = new Set<MidiStateListener>();

  public getState(): MidiDeviceState {
    return { ...this.state };
  }

  public subscribe(listener: MidiStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }

  public async init(): Promise<void> {
    if (typeof window === 'undefined' || !(navigator as any).requestMIDIAccess) {
      this.state = {
        isSupported: false,
        isConnected: false,
        errorMessage: 'Web MIDI is not supported on this browser.',
      };
      this.notify();
      return;
    }

    try {
      this.state.isSupported = true;
      const access = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.midiAccess = access;

      this.updateConnectedDevices();
      access.onstatechange = () => {
        this.updateConnectedDevices();
      };
    } catch (err: unknown) {
      this.state = {
        isSupported: true,
        isConnected: false,
        errorMessage: err instanceof Error ? err.message : 'Web MIDI access denied.',
      };
      this.notify();
    }
  }

  private updateConnectedDevices(): void {
    if (!this.midiAccess) return;

    const inputs: MidiInputPort[] = Array.from(this.midiAccess.inputs.values());
    const connectedInputs = inputs.filter((input) => input.state === 'connected');

    if (connectedInputs.length > 0) {
      const names = connectedInputs.map((i) => i.name || 'MIDI Keyboard').join(', ');
      this.state = {
        isSupported: true,
        isConnected: true,
        deviceName: names,
      };

      for (const input of connectedInputs) {
        input.onmidimessage = (e) => this.handleMidiMessage(e);
      }
    } else {
      this.state = {
        isSupported: true,
        isConnected: false,
      };
    }
    this.notify();
  }

  private handleMidiMessage(e: { data: Uint8Array }): void {
    if (!e.data || e.data.length < 2) return;

    const status = e.data[0] & 0xf0;
    const note = e.data[1];
    const velocity = e.data.length > 2 ? e.data[2] : 0;

    if (status === 0x90 && velocity > 0) {
      // Note On
      const normalizedVelocity = velocity / 127;
      inputDispatcher.noteOn(note, normalizedVelocity);
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      // Note Off
      inputDispatcher.noteOff(note);
    } else if (status === 0xb0 && note === 64) {
      // CC 64: Sustain Pedal
      const sustainOn = velocity >= 64;
      audioEngine.setSustain(sustainOn);
    }
  }

  public disconnect(): void {
    if (this.midiAccess) {
      for (const input of this.midiAccess.inputs.values()) {
        input.onmidimessage = null;
      }
      this.midiAccess.onstatechange = null;
      this.midiAccess = null;
    }
    this.state.isConnected = false;
    this.notify();
  }
}

export const webMidiHandler = new WebMidiHandler();
