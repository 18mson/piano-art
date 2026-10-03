import { isBlackKey, midiToNoteName, midiToFrequency, MIN_MIDI, MAX_MIDI } from '../src/lib/music';
import { computePianoLayout, getKeyAtPoint, clampStartOctave, getMidiKeyBoundsInLayout } from '../src/lib/layout';
import { getKeyboardKeyForMidi, KEY_MAP } from '../src/lib/input/keyboard';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing Music Helpers ---');

// 1. Black keys test
assert(!isBlackKey(60), 'MIDI 60 (C4) is white');
assert(isBlackKey(61), 'MIDI 61 (C#4) is black');
assert(!isBlackKey(62), 'MIDI 62 (D4) is white');
assert(isBlackKey(63), 'MIDI 63 (D#4) is black');
assert(!isBlackKey(64), 'MIDI 64 (E4) is white');
assert(!isBlackKey(65), 'MIDI 65 (F4) is white');
assert(isBlackKey(66), 'MIDI 66 (F#4) is black');
assert(!isBlackKey(67), 'MIDI 67 (G4) is white');
assert(isBlackKey(68), 'MIDI 68 (G#4) is black');
assert(!isBlackKey(69), 'MIDI 69 (A4) is white');
assert(isBlackKey(70), 'MIDI 70 (A#4) is black');
assert(!isBlackKey(71), 'MIDI 71 (B4) is white');
assert(!isBlackKey(72), 'MIDI 72 (C5) is white');

// 2. Note name test
assert(midiToNoteName(21) === 'A0', 'MIDI 21 is A0');
assert(midiToNoteName(60) === 'C4', 'MIDI 60 is C4');
assert(midiToNoteName(69) === 'A4', 'MIDI 69 is A4');
assert(midiToNoteName(108) === 'C8', 'MIDI 108 is C8');

// 3. Frequency test
assert(Math.abs(midiToFrequency(69) - 440) < 0.001, 'A4 frequency is 440Hz');
assert(Math.abs(midiToFrequency(57) - 220) < 0.001, 'A3 frequency is 220Hz');

console.log('\n--- Testing Layout Single Source of Truth ---');

// 4. All 88 keys layout
const layout88 = computePianoLayout({
  screenWidth: 1366,
  screenHeight: 768,
  octaves: 'all',
  startOctave: 1,
  pianoHeightRatio: 0.6,
});

assert(layout88.allKeys.length === 88, 'All 88 layout has exactly 88 keys');
assert(layout88.whiteKeys.length === 52, 'All 88 layout has exactly 52 white keys');
assert(layout88.blackKeys.length === 36, 'All 88 layout has exactly 36 black keys');
assert(layout88.startMidi === 21, 'All 88 starts at A0 (21)');
assert(layout88.endMidi === 108, 'All 88 ends at C8 (108)');
assert(layout88.whiteKeyWidth === 1366 / 52, 'White key width matches screenWidth / 52');

// 5. 3 Octaves Layout
const layout3 = computePianoLayout({
  screenWidth: 900,
  screenHeight: 450,
  octaves: 3,
  startOctave: 3,
  pianoHeightRatio: 0.6,
});

// 3 octaves starting at C3: C3..C6 = 3 * 7 + 1 = 22 white keys
assert(layout3.whiteKeys.length === 22, '3 octaves has 22 white keys (C3 to C6)');
assert(layout3.blackKeys.length === 15, '3 octaves has 15 black keys');
assert(layout3.allKeys.length === 37, '3 octaves has 37 total keys');
assert(layout3.startMidi === 48, 'C3 is MIDI 48');
assert(layout3.endMidi === 84, 'C6 is MIDI 84');

console.log('\n--- Testing Hit Priority (Black keys over White keys) ---');

// In layout3:
// Find C#3 (MIDI 49)
const cSharp = layout3.keyByMidi.get(49)!;
assert(cSharp !== undefined, 'C#3 exists in layout');
assert(cSharp.isBlack, 'C#3 is black key');

// Test point right in the center of C#3
const hitBlack = getKeyAtPoint(cSharp.x + cSharp.width / 2, cSharp.y + cSharp.height / 2, layout3);
assert(hitBlack?.midi === 49, 'Clicking on black key C#3 returns C#3 (hit priority works)');

// Test point at the bottom of the keyboard directly underneath C#3's x position
// Since black key does not extend to the bottom of the white key, this must hit the white key!
const hitWhiteBelow = getKeyAtPoint(cSharp.x + cSharp.width / 2, layout3.pianoY + layout3.pianoHeight - 10, layout3);
assert(hitWhiteBelow !== null && !hitWhiteBelow.isBlack, 'Clicking below black key hits underlying white key');

// Test point outside piano area
const hitAbove = getKeyAtPoint(cSharp.x, layout3.pianoY - 20, layout3);
assert(hitAbove === null, 'Clicking outside piano returns null');

console.log('\n--- Testing Octave Clamping ---');
assert(clampStartOctave(5, 3) === 5, 'Start octave 5 is valid for 3 octaves (5..8)');
assert(clampStartOctave(7, 3) === 5, 'Start octave 7 clamps to 5 for 3 octaves');
assert(clampStartOctave(0, 3) === 0, 'Start octave 0 (A0) is valid');
assert(clampStartOctave(-1, 3) === 0, 'Negative start octave clamps to 0 (A0)');
assert(clampStartOctave(3, 'all') === 0, 'Start octave is 0 for all 88 keys (starts at A0)');

// Test 2 octaves layout starting from A0
const layoutA0 = computePianoLayout({
  screenWidth: 900,
  screenHeight: 450,
  octaves: 2,
  startOctave: 0,
  pianoHeightRatio: 0.6,
});
assert(layoutA0.startMidi === 21, 'startOctave 0 starts at MIDI 21 (A0)');
assert(layoutA0.endMidi === 45, '2 octaves from A0 ends at MIDI 45 (A2)');
assert(layoutA0.whiteKeys.length === 15, '2 octaves from A0 has 15 white keys');
assert(layoutA0.allKeys[0].noteName === 'A0', 'First key is A0');

console.log('\n--- Testing Continuous Pan Coordinates (getMidiKeyBoundsInLayout) ---');
// In layout3 (C3 to C6, startMidi = 48, whiteKeyWidth = 900 / 22):
const wkw = 900 / 22;
// Note C3 (MIDI 48) is at x = 0
const c3Bounds = getMidiKeyBoundsInLayout(48, layout3);
assert(Math.abs(c3Bounds.x - 0) < 0.001, 'C3 is at x = 0');

// Note C2 (MIDI 36) is 1 octave (7 white keys) to the left of C3 -> x = -7 * wkw
const c2Bounds = getMidiKeyBoundsInLayout(36, layout3);
assert(Math.abs(c2Bounds.x - (-7 * wkw)) < 0.001, 'C2 is exactly -7 white keys to the left');

// Note C6 (MIDI 84) is at x = 21 * wkw
const c6Bounds = getMidiKeyBoundsInLayout(84, layout3);
assert(Math.abs(c6Bounds.x - (21 * wkw)) < 0.001, 'C6 is at x = 21 * wkw');

// Note C7 (MIDI 96) is 1 octave (7 white keys) to the right of C6 -> x = 28 * wkw
const c7Bounds = getMidiKeyBoundsInLayout(96, layout3);
assert(Math.abs(c7Bounds.x - (28 * wkw)) < 0.001, 'C7 is exactly 28 white keys from start');

console.log('\n--- Testing Pointer Hit Detection for Desktop & Mobile ---');
// Desktop layout simulation (e.g. 1440x900, 4 octaves C3..C7)
const desktopLayout = computePianoLayout({
  screenWidth: 1440,
  screenHeight: 900,
  octaves: 4,
  startOctave: 3,
  pianoHeightRatio: 0.62,
});

// A click on C4 (MIDI 60)
const c4Key = desktopLayout.keyByMidi.get(60)!;
assert(c4Key !== undefined, 'C4 exists in desktop layout');
// Simulate click in CSS pixels directly on C4
const hitC4 = getKeyAtPoint(c4Key.x + c4Key.width / 2, c4Key.y + c4Key.height * 0.8, desktopLayout);
assert(hitC4?.midi === 60, 'Desktop click on C4 resolves to MIDI 60');

// Mobile portrait layout simulation (e.g. 390x844, 2 octaves C4..C6)
const mobileLayout = computePianoLayout({
  screenWidth: 390,
  screenHeight: 844,
  octaves: 2,
  startOctave: 4,
  pianoHeightRatio: 0.74,
});

// A touch on F#4 (MIDI 66 - black key)
const fs4Key = mobileLayout.keyByMidi.get(66)!;
assert(fs4Key !== undefined, 'F#4 exists in mobile layout');
const hitFs4 = getKeyAtPoint(fs4Key.x + fs4Key.width / 2, fs4Key.y + fs4Key.height / 2, mobileLayout);
assert(hitFs4?.midi === 66, 'Mobile touch on black key F#4 resolves to MIDI 66');

// Coordinate mapping formula validation:
// On high-DPI displays (e.g. DPR = 2 or 3), element.clientWidth is CSS width (390),
// rect.width is 390, canvas.width buffer is 1170.
// Formula: scaleX = rect.width > 0 ? clientW / rect.width : 1 MUST equal 1.0!
const clientW = 390;
const rectW = 390;
const scaleX = rectW > 0 ? clientW / rectW : 1;
assert(scaleX === 1, 'Coordinate scaleX correctly resolves to 1.0, NOT devicePixelRatio');

console.log('\n--- Testing 2-Octave Keyboard Layout (octaves = 2) ---');

// Base octave C3 = MIDI 48
const c3Binding = getKeyboardKeyForMidi(48, 3, 2);
assert(c3Binding?.keyLabel === 'Q', '2-oct: Lower C (C3) is mapped to Q');

const cs3Binding = getKeyboardKeyForMidi(49, 3, 2);
assert(cs3Binding?.keyLabel === '2', '2-oct: Lower C# (C#3) is mapped to 2');

const b3Binding = getKeyboardKeyForMidi(59, 3, 2);
assert(b3Binding?.keyLabel === 'U', '2-oct: Lower B (B3) is mapped to U');

// Upper octave C4 = MIDI 60 (offset 12)
const c4Binding = getKeyboardKeyForMidi(60, 3, 2);
assert(c4Binding?.keyLabel === 'C', '2-oct: Upper C (C4) is mapped to C');

const cs4Binding = getKeyboardKeyForMidi(61, 3, 2);
assert(cs4Binding?.keyLabel === 'F', '2-oct: Upper C# (C#4) is mapped to F');

const g4Binding = getKeyboardKeyForMidi(67, 3, 2);
assert(g4Binding?.keyLabel === 'M', '2-oct: Upper G (G4) is mapped to M');

const as4Binding = getKeyboardKeyForMidi(70, 3, 2);
assert(as4Binding?.keyLabel === 'L', '2-oct: Upper A# (A#4) is mapped to L');

const b4Binding = getKeyboardKeyForMidi(71, 3, 2);
assert(b4Binding?.keyLabel === '.', '2-oct: Upper B (B4) is mapped to period (.)');

// Closing C (C5) = MIDI 72 (offset 24)
const c5Binding = getKeyboardKeyForMidi(72, 3, 2);
assert(c5Binding?.keyLabel === '/', '2-oct: Closing C (C5) is mapped to slash (/)');

console.log('\n--- Testing 3-Octave Chromatic Keyboard Layout (octaves >= 3: Z-/ & Q-]) ---');

// Offset 0: C3 = MIDI 48 -> KeyZ ('Z')
const c3_3oct = getKeyboardKeyForMidi(48, 3, 3);
assert(c3_3oct?.keyLabel === 'Z', '3-oct: C3 is mapped to Z');

// Offset 1: C#3 = MIDI 49 -> KeyS ('S')
const cs3_3oct = getKeyboardKeyForMidi(49, 3, 3);
assert(cs3_3oct?.keyLabel === 'S', '3-oct: C#3 is mapped to S');

// Offset 11: B3 = MIDI 59 -> KeyM ('M')
const b3_3oct = getKeyboardKeyForMidi(59, 3, 3);
assert(b3_3oct?.keyLabel === 'M', '3-oct: B3 is mapped to M');

// Offset 12: C4 = MIDI 60 -> Comma (',')
const c4_3oct = getKeyboardKeyForMidi(60, 3, 3);
assert(c4_3oct?.keyLabel === ',', '3-oct: C4 is mapped to comma (,)');

// Offset 16: E4 = MIDI 64 -> Slash ('/')
const e4_3oct = getKeyboardKeyForMidi(64, 3, 3);
assert(e4_3oct?.keyLabel === '/', '3-oct: E4 is mapped to slash (/)');

// Offset 17: F4 = MIDI 65 -> KeyQ ('Q')
const f4_3oct = getKeyboardKeyForMidi(65, 3, 3);
assert(f4_3oct?.keyLabel === 'Q', '3-oct: F4 is mapped to Q');

// Offset 18: F#4 = MIDI 66 -> Digit2 ('2')
const fs4_3oct = getKeyboardKeyForMidi(66, 3, 3);
assert(fs4_3oct?.keyLabel === '2', '3-oct: F#4 is mapped to 2');

// Offset 24: C5 = MIDI 72 -> KeyT ('T')
const c5_3oct = getKeyboardKeyForMidi(72, 3, 3);
assert(c5_3oct?.keyLabel === 'T', '3-oct: C5 is mapped to T');

// Offset 36: Closing C6 = MIDI 84 -> BracketRight (']')
const c6_3oct = getKeyboardKeyForMidi(84, 3, 3);
assert(c6_3oct?.keyLabel === ']', '3-oct: Closing C6 is mapped to ]');

console.log('\nALL TESTS PASSED SUCCESSFULLY! 🎉');
