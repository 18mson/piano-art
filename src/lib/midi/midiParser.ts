import { Song, SongNote, DifficultyLevel } from '../songs/types';

export const LEAD_IN_SECONDS = 2.4;

export interface ParsedMidiResult {
  song: Song;
  trackCount: number;
  totalNotes: number;
  bpm: number;
}

interface RawNoteOn {
  midi: number;
  channel: number;
  tick: number;
  velocity: number;
}

interface TempoChange {
  tick: number;
  timeSec: number;
  uspqn: number; // microseconds per quarter note
}

class ByteReader {
  private view: DataView;
  private offset: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  get remaining(): number {
    return this.view.byteLength - this.offset;
  }

  get currentOffset(): number {
    return this.offset;
  }

  readUint8(): number {
    if (this.offset >= this.view.byteLength) return 0;
    return this.view.getUint8(this.offset++);
  }

  readUint16(): number {
    if (this.offset + 2 > this.view.byteLength) return 0;
    const val = this.view.getUint16(this.offset);
    this.offset += 2;
    return val;
  }

  readUint32(): number {
    if (this.offset + 4 > this.view.byteLength) return 0;
    const val = this.view.getUint32(this.offset);
    this.offset += 4;
    return val;
  }

  readBytes(length: number): Uint8Array {
    const end = Math.min(this.view.byteLength, this.offset + length);
    const bytes = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, end - this.offset);
    this.offset = end;
    return bytes;
  }

  readString(length: number): string {
    const bytes = this.readBytes(length);
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }

  readVarLength(): number {
    let result = 0;
    let byte = 0;
    do {
      if (this.offset >= this.view.byteLength) break;
      byte = this.readUint8();
      result = (result << 7) | (byte & 0x7f);
    } while (byte & 0x80);
    return result;
  }

  skip(length: number): void {
    this.offset = Math.min(this.view.byteLength, this.offset + length);
  }
}

/**
 * Parses a Standard MIDI File (.mid / .midi) binary buffer into a Piano Art Song object.
 */
export function parseMidiFile(buffer: ArrayBuffer, fileName: string = 'Lagu MIDI Kustom'): ParsedMidiResult {
  const reader = new ByteReader(buffer);

  // 1. Read Header Chunk
  const headerId = reader.readString(4);
  if (headerId !== 'MThd') {
    throw new Error('Format file bukan Standard MIDI File yang valid (header tidak cocok).');
  }

  const headerLength = reader.readUint32();
  if (headerLength < 6) {
    throw new Error('Ukuran header MIDI terlalu kecil.');
  }

  const format = reader.readUint16(); // 0, 1, or 2
  const numTracks = reader.readUint16();
  const division = reader.readUint16();

  // Skip any extra header bytes if headerLength > 6
  if (headerLength > 6) {
    reader.skip(headerLength - 6);
  }

  // Handle Division (Ticks Per Quarter Note)
  let ticksPerQuarterNote = 480;
  if ((division & 0x8000) === 0) {
    ticksPerQuarterNote = division;
  } else {
    // SMPTE time format fallback
    ticksPerQuarterNote = 120;
  }
  if (ticksPerQuarterNote <= 0) ticksPerQuarterNote = 480;

  let trackTitle = '';
  const tempoChanges: TempoChange[] = [{ tick: 0, timeSec: 0, uspqn: 500000 }]; // Default 120 BPM
  const allEvents: {
    type: 'noteOn' | 'noteOff';
    tick: number;
    channel: number;
    midi: number;
    velocity: number;
  }[] = [];

  // 2. Read All Track Chunks
  for (let t = 0; t < numTracks && reader.remaining > 8; t++) {
    const chunkId = reader.readString(4);
    const chunkLength = reader.readUint32();

    if (chunkId !== 'MTrk') {
      reader.skip(chunkLength);
      continue;
    }

    const trackEndOffset = reader.currentOffset + chunkLength;
    let currentTick = 0;
    let runningStatus: number | null = null;

    while (reader.currentOffset < trackEndOffset && reader.remaining > 0) {
      const delta = reader.readVarLength();
      currentTick += delta;

      let statusByte = reader.readUint8();
      if ((statusByte & 0x80) === 0) {
        // Running status: current byte is actually the first data byte
        if (runningStatus === null) {
          continue; // Malformed MIDI
        }
        // Rewind 1 byte and use runningStatus
        reader.skip(-1);
        statusByte = runningStatus;
      } else {
        runningStatus = statusByte;
      }

      if (statusByte === 0xff) {
        // Meta Event
        runningStatus = null;
        const metaType = reader.readUint8();
        const metaLength = reader.readVarLength();

        if (metaType === 0x03 && metaLength > 0 && !trackTitle) {
          // Track Name / Song Title
          const nameBytes = reader.readBytes(metaLength);
          let name = '';
          for (let i = 0; i < nameBytes.length; i++) {
            name += String.fromCharCode(nameBytes[i]);
          }
          if (name.trim()) {
            trackTitle = name.trim();
          }
        } else if (metaType === 0x51 && metaLength === 3) {
          // Set Tempo: 3 bytes us per quarter note
          const b1 = reader.readUint8();
          const b2 = reader.readUint8();
          const b3 = reader.readUint8();
          const uspqn = (b1 << 16) | (b2 << 8) | b3;
          if (uspqn > 0) {
            tempoChanges.push({ tick: currentTick, timeSec: 0, uspqn });
          }
        } else {
          // Skip other meta events
          reader.skip(metaLength);
        }
      } else if (statusByte === 0xf0 || statusByte === 0xf7) {
        // SysEx Event
        runningStatus = null;
        const sysexLength = reader.readVarLength();
        reader.skip(sysexLength);
      } else {
        // Standard Channel Voice Event
        const eventType = statusByte & 0xf0;
        const channel = statusByte & 0x0f;

        if (eventType === 0x90) {
          // Note On
          const midi = reader.readUint8();
          const velocity = reader.readUint8();
          if (velocity > 0) {
            allEvents.push({ type: 'noteOn', tick: currentTick, channel, midi, velocity: velocity / 127 });
          } else {
            // Note On with vel 0 is Note Off
            allEvents.push({ type: 'noteOff', tick: currentTick, channel, midi, velocity: 0 });
          }
        } else if (eventType === 0x80) {
          // Note Off
          const midi = reader.readUint8();
          const velocity = reader.readUint8();
          allEvents.push({ type: 'noteOff', tick: currentTick, channel, midi, velocity: velocity / 127 });
        } else if (eventType === 0xc0 || eventType === 0xd0) {
          // Program Change / Channel Pressure (1 data byte)
          reader.readUint8();
        } else {
          // Polyphonic Pressure (0xA0), Control Change (0xB0), Pitch Bend (0xE0) (2 data bytes)
          reader.readUint8();
          reader.readUint8();
        }
      }
    }

    // Ensure we are at track end offset
    if (reader.currentOffset < trackEndOffset) {
      reader.skip(trackEndOffset - reader.currentOffset);
    }
  }

  // 3. Compute Tempo Changes and Convert Ticks to Exact Real Seconds
  tempoChanges.sort((a, b) => a.tick - b.tick);

  // Compute timeSec for each tempo milestone
  for (let i = 1; i < tempoChanges.length; i++) {
    const prev = tempoChanges[i - 1];
    const curr = tempoChanges[i];
    const deltaTicks = curr.tick - prev.tick;
    const secPerTick = prev.uspqn / 1000000 / ticksPerQuarterNote;
    curr.timeSec = prev.timeSec + deltaTicks * secPerTick;
  }

  const tickToSeconds = (tick: number): number => {
    // Find the active tempo change for this tick
    let activeTempo = tempoChanges[0];
    for (let i = tempoChanges.length - 1; i >= 0; i--) {
      if (tick >= tempoChanges[i].tick) {
        activeTempo = tempoChanges[i];
        break;
      }
    }
    const deltaTicks = tick - activeTempo.tick;
    const secPerTick = activeTempo.uspqn / 1000000 / ticksPerQuarterNote;
    return activeTempo.timeSec + deltaTicks * secPerTick;
  };

  // Calculate primary song BPM
  const initialUspqn = tempoChanges[0]?.uspqn ?? 500000;
  const primaryBpm = Math.round(60000000 / initialUspqn);

  // 4. Pair NoteOn and NoteOff to build SongNote items
  allEvents.sort((a, b) => a.tick - b.tick);

  const openNotes = new Map<string, RawNoteOn>();
  const songNotes: SongNote[] = [];

  for (let i = 0; i < allEvents.length; i++) {
    const ev = allEvents[i];
    const key = `${ev.channel}:${ev.midi}`;

    if (ev.type === 'noteOn') {
      // If note was already open, close it at current tick
      if (openNotes.has(key)) {
        const prev = openNotes.get(key)!;
        const startTime = tickToSeconds(prev.tick) + LEAD_IN_SECONDS;
        const endTime = tickToSeconds(ev.tick) + LEAD_IN_SECONDS;
        const duration = Math.max(0.08, endTime - startTime);
        if (prev.midi >= 21 && prev.midi <= 108) {
          songNotes.push({
            midi: prev.midi,
            time: Math.round(startTime * 1000) / 1000,
            duration: Math.round(duration * 1000) / 1000,
            velocity: Math.max(0.4, Math.min(1.0, prev.velocity)),
          });
        }
      }
      openNotes.set(key, {
        midi: ev.midi,
        channel: ev.channel,
        tick: ev.tick,
        velocity: ev.velocity,
      });
    } else {
      // Note Off
      if (openNotes.has(key)) {
        const prev = openNotes.get(key)!;
        openNotes.delete(key);
        const startTime = tickToSeconds(prev.tick) + LEAD_IN_SECONDS;
        const endTime = tickToSeconds(ev.tick) + LEAD_IN_SECONDS;
        const duration = Math.max(0.08, endTime - startTime);
        if (prev.midi >= 21 && prev.midi <= 108) {
          songNotes.push({
            midi: prev.midi,
            time: Math.round(startTime * 1000) / 1000,
            duration: Math.round(duration * 1000) / 1000,
            velocity: Math.max(0.4, Math.min(1.0, prev.velocity)),
          });
        }
      }
    }
  }

  // Close any leftover dangling notes
  openNotes.forEach((prev) => {
    const startTime = tickToSeconds(prev.tick) + LEAD_IN_SECONDS;
    if (prev.midi >= 21 && prev.midi <= 108) {
      songNotes.push({
        midi: prev.midi,
        time: Math.round(startTime * 1000) / 1000,
        duration: 0.35,
        velocity: Math.max(0.4, Math.min(1.0, prev.velocity)),
      });
    }
  });

  // Sort notes strictly by time
  songNotes.sort((a, b) => a.time - b.time);

  if (songNotes.length === 0) {
    throw new Error('File MIDI tidak berisi not musik piano yang dapat dibaca (rentang 88 tuts).');
  }

  // Calculate total duration (last note end + 3s outro)
  const lastNote = songNotes[songNotes.length - 1];
  const songDuration = Math.ceil(lastNote.time + lastNote.duration + 3);

  // Compute difficulty based on note density
  const effectivePlayDuration = Math.max(5, songDuration - LEAD_IN_SECONDS);
  const notesPerSecond = songNotes.length / effectivePlayDuration;

  let difficulty: DifficultyLevel = 'Normal';
  let stars = 2;
  if (notesPerSecond < 1.8) {
    difficulty = 'Easy';
    stars = 1;
  } else if (notesPerSecond <= 3.8) {
    difficulty = 'Normal';
    stars = 2;
  } else if (notesPerSecond <= 6.5) {
    difficulty = 'Hard';
    stars = 3;
  } else {
    difficulty = 'Expert';
    stars = 5;
  }

  // Compute optimal suggested octave range
  let minNoteMidi = 108;
  let maxNoteMidi = 21;
  for (let i = 0; i < songNotes.length; i++) {
    if (songNotes[i].midi < minNoteMidi) minNoteMidi = songNotes[i].midi;
    if (songNotes[i].midi > maxNoteMidi) maxNoteMidi = songNotes[i].midi;
  }
  const minOct = Math.max(0, Math.floor(minNoteMidi / 12) - 1);
  const maxOct = Math.min(8, Math.floor(maxNoteMidi / 12) - 1);
  const suggestedOctaves = Math.min(5, Math.max(3, maxOct - minOct + 1));
  const suggestedStartOctave = Math.min(8 - suggestedOctaves, Math.max(1, minOct));

  const cleanTitle = (trackTitle || fileName.replace(/\.[^/.]+$/, ''))
    .replace(/[_-]/g, ' ')
    .trim();

  const song: Song = {
    id: `custom-midi-${Date.now()}`,
    title: cleanTitle || 'Lagu MIDI Kustom',
    artist: 'Impor Pengguna',
    difficulty,
    bpm: primaryBpm > 0 && primaryBpm < 300 ? primaryBpm : 120,
    duration: songDuration,
    suggestedOctaves,
    suggestedStartOctave,
    notes: songNotes,
    stars,
    description: `Diimpor otomatis dari file ${fileName}. Berisi ${songNotes.length} not nada piano.`,
  };

  return {
    song,
    trackCount: numTracks,
    totalNotes: songNotes.length,
    bpm: song.bpm,
  };
}
