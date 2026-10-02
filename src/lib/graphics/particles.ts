import { Container, Graphics } from 'pixi.js';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const MAX_PARTICLES = 120; // Hard cap for 60fps performance on mobile

export class ParticleSystem {
  public container: Container;
  private graphics: Graphics;
  private pool: Particle[] = [];

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 3,
        color: 0xffffff,
        alpha: 1,
        life: 0,
        maxLife: 30,
      });
    }
  }

  /**
   * Spawns small pixel square particles on key press.
   */
  public spawn(x: number, y: number, width: number, color: number): void {
    const count = 6;
    let spawned = 0;

    for (let i = 0; i < this.pool.length && spawned < count; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        // Spread across the key width
        p.x = x + Math.random() * width;
        p.y = y + (Math.random() * 20 - 10);
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = -(Math.random() * 2.2 + 1.2); // Upward float
        p.size = Math.random() > 0.4 ? 4 : 3; // Pixel squares (3px or 4px)
        p.color = color;
        p.alpha = 0.95;
        p.life = 0;
        p.maxLife = Math.floor(Math.random() * 25 + 25); // ~30-50 frames
        spawned++;
      }
    }
  }

  /**
   * Updates and redraws particles each frame.
   */
  public update(deltaFrames: number = 1): void {
    let hasActive = false;
    this.graphics.clear();

    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.active) {
        hasActive = true;
        p.life += deltaFrames;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }

        p.x += p.vx * deltaFrames;
        p.y += p.vy * deltaFrames;
        // Fade out
        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        // Draw pixel square
        this.graphics
          .rect(Math.round(p.x), Math.round(p.y), p.size, p.size)
          .fill({ color: p.color, alpha: currentAlpha });
      }
    }
  }

  public clear(): void {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].active = false;
    }
    this.graphics.clear();
  }
}
