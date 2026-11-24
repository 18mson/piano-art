import * as assert from 'assert';
import { parseMidiFile, LEAD_IN_SECONDS } from '../src/lib/midi/midiParser';

console.log('--- Testing MIDI Parser Engine ---');

function createVarLength(val: number): number[] {
  const bytes: number[] = [];
  bytes.push(val & 0x7f);
  val >>= 7;
  while (val > 0) {
    bytes.unshift((val & 0x7f) | 0x80);
    val >>= 7;
  }
  return bytes;
}

/**
 * Creates a minimal valid Standard MIDI File (Format 0) binary buffer for testing
 */
function createSyntheticMidiFormat0(): ArrayBuffer {
  // Track events:
  // 1. Delta 0: Meta Set Tempo (120 BPM = 500,000 uspqn: 0x07, 0xA1, 0x20)
  // 2. Delta 0: Meta Track Name "Test Piano Tune"
  // 3. Delta 0: Note On MIDI 60 (C4), vel 90
  // 4. Delta 480 (1 beat): Note Off MIDI 60, vel 0
  // 5. Delta 0: Note On MIDI 64 (E4), vel 85
  // 6. Delta 480 (1 beat): Note Off MIDI 64, vel 0
  // 7. Delta 0: End of Track (FF 2F 00)
  const trackData: number[] = [
    // Delta 0, Tempo Meta (0xFF 0x51 0x03 0x07 0xA1 0x20)
    0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
    // Delta 0, Track Name Meta (0xFF 0x03 len string)
    0x00, 0xff, 0x03, 0x0f, ...Buffer.from('Test Piano Tune', 'ascii'),
    // Delta 0, Note On C4 (0x90 0x3C 0x5A)
    0x00, 0x90, 0x3c, 0x5a,
    // Delta 480 (0x83 0x60 in VLQ), Note Off C4 (0x80 0x3C 0x00)
    ...createVarLength(480), 0x80, 0x3c, 0x00,
    // Delta 0, Note On E4 (0x90 0x40 0x55)
    0x00, 0x90, 0x40, 0x55,
    // Delta 480, Note Off E4 (0x80 0x40 0x00)
    ...createVarLength(480), 0x80, 0x40, 0x00,
    // Delta 0, End of track
    0x00, 0xff, 0x2f, 0x00,
  ];

  // MThd header: length 6, format 0, 1 track, 480 division
  const header: number[] = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00,             // format 0
    0x00, 0x01,             // 1 track
    0x01, 0xe0,             // division 480
  ];

  // MTrk chunk: 'MTrk' + length (4 bytes) + trackData
  const trackHeader: number[] = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackData.length >> 24) & 0xff,
    (trackData.length >> 16) & 0xff,
    (trackData.length >> 8) & 0xff,
    trackData.length & 0xff,
  ];

  const full = new Uint8Array([...header, ...trackHeader, ...trackData]);
  return full.buffer;
}

/**
 * Creates a minimal valid Standard MIDI File (Format 1 - Multitrack)
 */
function createSyntheticMidiFormat1(): ArrayBuffer {
  // Track 1: Tempo map & Title
  const track1Data: number[] = [
    0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, // 120 BPM
    0x00, 0xff, 0x03, 0x09, ...Buffer.from('Poly Track', 'ascii'),
    0x00, 0xff, 0x2f, 0x00,
  ];

  // Track 2: Left hand bass notes
  const track2Data: number[] = [
    0x00, 0x90, 0x24, 0x60, // C2 (MIDI 36)
    ...createVarLength(960), 0x80, 0x24, 0x00,
    0x00, 0xff, 0x2f, 0x00,
  ];

  // Track 3: Right hand melody with running status
  const track3Data: number[] = [
    0x00, 0x90, 0x48, 0x70, // C5 (MIDI 72)
    ...createVarLength(480), 0x48, 0x00, // running status Note Off (vel 0)
    0x00, 0x4a, 0x65,                   // running status Note On D5 (vel 0x65)
    ...createVarLength(480), 0x4a, 0x00, // running status Note Off
    0x00, 0xff, 0x2f, 0x00,
  ];

  const header: number[] = [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x01, // format 1
    0x00, 0x03, // 3 tracks
    0x01, 0xe0, // 480 division
  ];

  const makeTrackChunk = (data: number[]) => [
    0x4d, 0x54, 0x72, 0x6b,
    (data.length >> 24) & 0xff,
    (data.length >> 16) & 0xff,
    (data.length >> 8) & 0xff,
    data.length & 0xff,
    ...data,
  ];

  const full = new Uint8Array([
    ...header,
    ...makeTrackChunk(track1Data),
    ...makeTrackChunk(track2Data),
    ...makeTrackChunk(track3Data),
  ]);
  return full.buffer;
}

// 1. Test Format 0 Parsing
const format0Buffer = createSyntheticMidiFormat0();
const parsed0 = parseMidiFile(format0Buffer, 'test_tune.mid');

assert.strictEqual(parsed0.trackCount, 1, 'Format 0 should have 1 track');
assert.strictEqual(parsed0.bpm, 120, 'BPM should resolve to 120');
assert.strictEqual(parsed0.song.title, 'Test Piano Tune', 'Title should be extracted from track name');
assert.strictEqual(parsed0.totalNotes, 2, 'Should have exactly 2 notes');

// Check first note
const note0 = parsed0.song.notes[0];
assert.strictEqual(note0.midi, 60, 'First note should be C4 (MIDI 60)');
assert.strictEqual(note0.time, LEAD_IN_SECONDS, `First note time should equal LEAD_IN_SECONDS (${LEAD_IN_SECONDS})`);
assert.strictEqual(Math.abs(note0.duration - 0.5) < 0.05, true, 'First note duration should be ~0.5 second (1 beat at 120 BPM: 60/120 = 0.5s)');

// Check second note
const note1 = parsed0.song.notes[1];
assert.strictEqual(note1.midi, 64, 'Second note should be E4 (MIDI 64)');
assert.strictEqual(Math.abs(note1.time - (LEAD_IN_SECONDS + 0.5)) < 0.05, true, 'Second note starts after 0.5s');
console.log('✓ Standard MIDI Format 0 parsed correctly');

// 2. Test Format 1 Multi-track with Running Status
const format1Buffer = createSyntheticMidiFormat1();
const parsed1 = parseMidiFile(format1Buffer, 'multitrack.mid');

assert.strictEqual(parsed1.trackCount, 3, 'Format 1 should have 3 tracks');
assert.strictEqual(parsed1.bpm, 120, 'Format 1 BPM should be 120');
assert.strictEqual(parsed1.totalNotes, 3, 'Should have 3 notes total across tracks');

// Verify bass note C2 (36) and treble notes C5 (72) & D5 (74)
const midis = parsed1.song.notes.map((n) => n.midi);
assert.strictEqual(midis.includes(36), true, 'Bass note C2 (MIDI 36) parsed');
assert.strictEqual(midis.includes(72), true, 'Treble note C5 (MIDI 72) parsed');
assert.strictEqual(midis.includes(74), true, 'Treble note D5 (MIDI 74) parsed via running status');
console.log('✓ Standard MIDI Format 1 multi-track and running status parsed correctly');

// 3. Test Invalid Header Rejection
assert.throws(() => {
  const badBuffer = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer;
  parseMidiFile(badBuffer, 'bad.mid');
}, /Format file bukan Standard MIDI File/, 'Should throw on invalid header');
console.log('✓ Invalid non-MIDI header rejected properly');

console.log('ALL MIDI PARSER TESTS PASSED! 🎉');
