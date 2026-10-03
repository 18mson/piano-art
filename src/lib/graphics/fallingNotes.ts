import { Graphics } from 'pixi.js';
import { Song, SongNote } from '../songs/types';
import { PianoLayout, getMidiKeyBoundsInLayout } from '../layout';
import { getPitchColor, isBlackKey } from '../music';

export interface FallingNotesRenderParams {
  whiteNotesGraphics: Graphics;
  blackNotesGraphics: Graphics;
  hitGlowGraphics: Graphics;
  song: Song;
  currentTime: number;
  fallDuration: number;
  layout: PianoLayout;
  pianoY: number;
  screenWidth: number;
}

/**
 * Procedural Synthesia-style falling notes renderer.
 * Accurately aligns note columns to piano key coordinates.
 */
export function renderFallingNotes(params: FallingNotesRenderParams): void {
  const {
    whiteNotesGraphics,
    blackNotesGraphics,
    hitGlowGraphics,
    song,
    currentTime,
    fallDuration,
    layout,
    pianoY,
    screenWidth,
  } = params;

  whiteNotesGraphics.clear();
  blackNotesGraphics.clear();
  hitGlowGraphics.clear();

  if (!song || pianoY <= 0) return;

  const notes = song.notes;
  const numNotes = notes.length;

  for (let i = 0; i < numNotes; i++) {
    const note = notes[i];

    // Check time window: is the note anywhere in the visible vertical span?
    // Note enters at top when currentTime = note.time - fallDuration
    // Note fully exits hit-line when currentTime = note.time + note.duration
    if (note.time - fallDuration > currentTime || note.time + note.duration < currentTime - 0.2) {
      continue;
    }

    // Key bounds from piano layout single source of truth
    const keyBounds = getMidiKeyBoundsInLayout(note.midi, layout);

    // Cull notes that are completely offscreen horizontally
    if (keyBounds.x + keyBounds.width < -10 || keyBounds.x > screenWidth + 10) {
      continue;
    }

    // Vertical coordinates
    const bottomY = pianoY - ((note.time - currentTime) / fallDuration) * pianoY;
    const rawHeight = (note.duration / fallDuration) * pianoY;
    const height = Math.max(10, rawHeight);
    const topY = bottomY - height;

    // Cull if completely above screen or already buried under keys
    if (bottomY < 0 || topY > pianoY) {
      continue;
    }

    // Clip at the hit-line (pianoY) so notes sink behind the piano felt
    const clampedBottomY = Math.min(pianoY, bottomY);
    const clampedTopY = Math.max(0, topY);
    const drawHeight = clampedBottomY - clampedTopY;

    if (drawHeight <= 1) continue;

    const isBlack = isBlackKey(note.midi);
    const pitchColor = getPitchColor(note.midi).hex;

    // Is the note currently hitting the keys?
    const isHitting = currentTime >= note.time && currentTime <= note.time + note.duration;

    // Target appropriate graphics layer (black keys on top)
    const targetG = isBlack ? blackNotesGraphics : whiteNotesGraphics;

    // Note horizontal dimensions
    const insetX = isBlack ? 1 : 2;
    const noteX = Math.round(keyBounds.x + insetX);
    const noteW = Math.max(6, Math.round(keyBounds.width - insetX * 2));
    const radius = Math.min(4, Math.floor(noteW / 3));

    // Colors: left hand notes have cyan/teal tint, right hand has purple/gold/pitch color
    let baseColor = pitchColor;
    if (note.hand === 'left') {
      baseColor = 0x06b6d4; // Cyan glow for bass/accompaniment
    }

    // Note body fill
    const alpha = isHitting ? 0.98 : 0.88;
    targetG
      .roundRect(noteX, clampedTopY, noteW, drawHeight, radius)
      .fill({ color: baseColor, alpha });

    // Inner glossy gradient / highlight bar
    if (noteW >= 12 && drawHeight >= 8) {
      targetG
        .roundRect(noteX + 2, clampedTopY + 2, Math.max(2, Math.floor(noteW * 0.3)), drawHeight - 4, 2)
        .fill({ color: 0xffffff, alpha: isHitting ? 0.45 : 0.25 });
    }

    // Outer neon glow stroke
    targetG
      .roundRect(noteX, clampedTopY, noteW, drawHeight, radius)
      .stroke({
        color: isHitting ? 0xffffff : baseColor,
        width: isHitting ? 1.8 : 1.0,
        alpha: isHitting ? 0.95 : 0.6,
      });

    // Hit flare effect right on the felt rail line
    if (isHitting) {
      const glowW = noteW * 1.5;
      const glowX = noteX - (glowW - noteW) / 2;
      const flareH = 6;

      hitGlowGraphics
        .ellipse(noteX + noteW / 2, pianoY, glowW / 2, flareH)
        .fill({ color: baseColor, alpha: 0.75 });

      hitGlowGraphics
        .ellipse(noteX + noteW / 2, pianoY, glowW / 4, flareH / 2)
        .fill({ color: 0xffffff, alpha: 0.9 });
    }
  }
}
