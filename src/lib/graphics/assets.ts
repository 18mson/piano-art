import { Graphics } from 'pixi.js';
import { KeyLayout } from '../layout';

export interface Star {
  x: number;
  y: number;
  size: number;
  color: number;
  twinkleSpeed: number;
  layer: number; // 0 for distant, 1 for near
  phase: number;
}

export function generateStars(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.random() > 0.3 ? 0 : 1;
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: layer === 0 ? 1 : 2,
      color: layer === 0 ? 0x94a3b8 : 0xbae6fd,
      twinkleSpeed: 0.02 + Math.random() * 0.04,
      layer,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

/**
 * Procedural background renderer with 2 parallax star layers and piano rail.
 */
export function renderBackground(
  graphics: Graphics,
  width: number,
  height: number,
  pianoY: number,
  stars: Star[],
  time: number
): void {
  graphics.clear();

  // Dark sky gradient simulation using horizontal bands
  const bands = 12;
  const skyHeight = pianoY;
  for (let i = 0; i < bands; i++) {
    const y0 = (i / bands) * skyHeight;
    const bandH = Math.ceil(skyHeight / bands) + 1;
    // Gradient from midnight blue #080c18 to deep slate #131b2e
    const t = i / bands;
    const r = Math.round(8 + t * 11);
    const g = Math.round(12 + t * 15);
    const b = Math.round(24 + t * 22);
    const color = (r << 16) | (g << 8) | b;

    graphics.rect(0, y0, width, bandH).fill({ color });
  }

  // Draw Stars (Layer 0 = distant slow, Layer 1 = near sparkling)
  for (const star of stars) {
    if (star.y < pianoY) {
      const alpha = 0.4 + 0.5 * Math.sin(time * star.twinkleSpeed + star.phase);
      graphics
        .rect(Math.round(star.x), Math.round(star.y), star.size, star.size)
        .fill({ color: star.color, alpha });
    }
  }

  // Velvet felt rail + wood lip immediately above the piano keys
  const feltHeight = 8;
  const feltY = pianoY - feltHeight;

  // Dark crimson piano felt cushion
  graphics.rect(0, feltY, width, feltHeight).fill({ color: 0x881337 });
  // Gold/brass metallic trim accent line
  graphics.rect(0, feltY, width, 1.5).fill({ color: 0xd97706, alpha: 0.8 });
  // Bottom shadow under felt
  graphics.rect(0, feltY + feltHeight - 1, width, 1).fill({ color: 0x4c0519 });
}

/**
 * Procedural White Key renderer.
 */
export function renderWhiteKey(
  graphics: Graphics,
  key: KeyLayout,
  isPressed: boolean,
  glowColor: number
): void {
  const { x, y, width, height } = key;

  if (!isPressed) {
    // White key (UP)
    // Base ivory fill
    graphics.rect(x, y, width, height).fill({ color: 0xf8fafc });

    // Left/top subtle light bevel
    graphics.rect(x, y, 1, height).fill({ color: 0xffffff, alpha: 0.9 });
    graphics.rect(x, y, width, 2).fill({ color: 0xffffff, alpha: 0.8 });

    // Right subtle divider line
    graphics.rect(x + width - 1, y, 1, height).fill({ color: 0xd1d5db });

    // Bottom 3D shadow lip
    graphics.rect(x, y + height - 6, width, 6).fill({ color: 0xe2e8f0 });
    graphics.rect(x, y + height - 2, width, 2).fill({ color: 0x94a3b8 });
  } else {
    // White key (PRESSED)
    // Slightly pressed down and darker
    graphics.rect(x, y + 2, width, height - 2).fill({ color: 0xe2e8f0 });

    // Pitch color soft glow overlay
    graphics.rect(x, y + 2, width, height - 2).fill({ color: glowColor, alpha: 0.35 });

    // Inner press shadow at top
    graphics.rect(x, y + 2, width, 4).fill({ color: 0x64748b, alpha: 0.5 });

    // Bottom pressed lip
    graphics.rect(x, y + height - 3, width, 3).fill({ color: 0x64748b });

    // Soft outline in glow color
    graphics.rect(x, y + 2, width, height - 2).stroke({ color: glowColor, width: 1.5, alpha: 0.8 });
  }
}

/**
 * Procedural Black Key renderer.
 */
export function renderBlackKey(
  graphics: Graphics,
  key: KeyLayout,
  isPressed: boolean,
  glowColor: number
): void {
  const { x, y, width, height } = key;

  if (!isPressed) {
    // Black key (UP)
    // Drop shadow under the black key on top of white keys
    graphics.rect(x - 2, y, width + 4, height + 4).fill({ color: 0x020617, alpha: 0.35 });

    // Main dark body
    graphics.rect(x, y, width, height).fill({ color: 0x1e293b });

    // Front/top highlight bevel
    graphics.rect(x + 1, y, width - 2, 2).fill({ color: 0x475569 });
    graphics.rect(x + 1, y + 2, 2, height - 8).fill({ color: 0x334155 });

    // Bottom 3D step bevel
    graphics.rect(x, y + height - 6, width, 6).fill({ color: 0x0f172a });
    graphics.rect(x, y + height - 2, width, 2).fill({ color: 0x334155, alpha: 0.6 });
  } else {
    // Black key (PRESSED)
    graphics.rect(x - 1, y + 2, width + 2, height + 2).fill({ color: 0x020617, alpha: 0.25 });

    // Pressed body
    graphics.rect(x, y + 3, width, height - 3).fill({ color: 0x0f172a });

    // Pitch color soft glow overlay
    graphics.rect(x, y + 3, width, height - 3).fill({ color: glowColor, alpha: 0.5 });

    // Top inset shadow
    graphics.rect(x, y + 3, width, 3).fill({ color: 0x000000, alpha: 0.6 });

    // Glow border
    graphics.rect(x, y + 3, width, height - 3).stroke({ color: glowColor, width: 1.5, alpha: 0.9 });
  }
}
