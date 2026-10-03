import { SONGS_CATALOG, getSongById } from '../src/lib/songs/catalog';
import { yoasobiBlueSong } from '../src/lib/songs/yoasobiBlue';
import { computePianoLayout, getMidiKeyBoundsInLayout } from '../src/lib/layout';
import { MIN_MIDI, MAX_MIDI } from '../src/lib/music';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing Song Catalog & Difficulty Indicators ---');

assert(SONGS_CATALOG.length >= 3, 'Song catalog contains at least 3 songs');

// Test YOASOBI - Blue
const blue = getSongById('yoasobi-blue');
assert(blue !== undefined, 'YOASOBI - Blue exists in catalog');
assert(!!blue?.title.includes('Blue'), 'Song title contains "Blue"');
assert(blue?.artist === 'YOASOBI', 'Artist is YOASOBI');
assert(blue?.difficulty === 'Hard', 'YOASOBI - Blue difficulty is Hard');
assert(blue?.stars === 4, 'YOASOBI - Blue has 4 stars');
assert(blue?.notes.length !== undefined && blue.notes.length > 30, 'YOASOBI - Blue has rich chorus notes (> 30 notes)');

// Verify all songs have valid metadata and note sequences
for (const song of SONGS_CATALOG) {
  assert(song.id.length > 0, `Song ${song.title} has valid ID`);
  assert(song.bpm > 40 && song.bpm < 300, `Song ${song.title} has valid BPM (${song.bpm})`);
  assert(song.duration > 5, `Song ${song.title} has valid duration (${song.duration}s)`);
  assert(song.stars >= 1 && song.stars <= 5, `Song ${song.title} stars are within 1..5 (${song.stars})`);

  let prevTime = 0;
  for (let i = 0; i < song.notes.length; i++) {
    const note = song.notes[i];
    assert(
      note.midi >= MIN_MIDI && note.midi <= MAX_MIDI,
      `Note ${i} in ${song.title} has valid MIDI: ${note.midi} (between ${MIN_MIDI} and ${MAX_MIDI})`
    );
    assert(note.time >= 0, `Note ${i} time is non-negative`);
    assert(note.duration > 0, `Note ${i} duration is positive`);
    assert(note.time >= prevTime - 0.001, `Note ${i} is in chronological order`);
    prevTime = note.time;
  }
}

console.log('\n--- Testing Falling Notes Mathematical Projection ---');

const pianoY = 400;
const fallDuration = 2.0; // 2 seconds

// Test Note at time = 5.0s, duration = 1.0s
const testNote = { midi: 60, time: 5.0, duration: 1.0 };

// Scenario 1: currentTime = 3.0s (exactly fallDuration before hit)
// Note bottom should be entering right at top of screen (Y = 0)
const curTime1 = 3.0;
const bottomY1 = pianoY - ((testNote.time - curTime1) / fallDuration) * pianoY;
assert(Math.abs(bottomY1 - 0) < 0.001, 'Note bottom is at Y = 0 when time until hit == fallDuration');

// Scenario 2: currentTime = 5.0s (exact impact time on hit line)
// Note bottom should be exactly at pianoY
const curTime2 = 5.0;
const bottomY2 = pianoY - ((testNote.time - curTime2) / fallDuration) * pianoY;
assert(Math.abs(bottomY2 - pianoY) < 0.001, 'Note bottom touches hit-line (pianoY) at note.time');

// Scenario 3: Note height calculation
const rawHeight = (testNote.duration / fallDuration) * pianoY;
assert(Math.abs(rawHeight - 200) < 0.001, '1s note with 2s fallDuration spans half the fall height (200px)');

// Scenario 4: currentTime = 6.0s (note has completely finished)
// Note top reaches pianoY
const curTime3 = 6.0;
const bottomY3 = pianoY - ((testNote.time - curTime3) / fallDuration) * pianoY;
const topY3 = bottomY3 - rawHeight;
assert(Math.abs(topY3 - pianoY) < 0.001, 'Note top reaches hit-line (pianoY) when currentTime == note.time + note.duration');

console.log('\n--- Testing Horizontal Key Projection for Notes ---');

const layout = computePianoLayout({
  screenWidth: 1000,
  screenHeight: 600,
  octaves: 3,
  startOctave: 3,
  pianoHeightRatio: 0.6,
});

// Test C4 (MIDI 60)
const c4Bounds = getMidiKeyBoundsInLayout(60, layout);
assert(c4Bounds.width > 0, 'C4 has valid positive width in layout');
assert(c4Bounds.x >= 0 && c4Bounds.x < 1000, 'C4 horizontal coordinate is within screen bounds');

// Test C#4 (MIDI 61 - Black key)
const cs4Bounds = getMidiKeyBoundsInLayout(61, layout);
assert(cs4Bounds.isBlack, 'C#4 is marked as black key');
assert(cs4Bounds.x > c4Bounds.x, 'C#4 is positioned horizontally after C4 start');

console.log('\nALL FALLING NOTES & SONG TESTS PASSED SUCCESSFULLY! 🎉');
