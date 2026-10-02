'use client';

import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import { usePianoStore } from '../store/pianoStore';
import { computePianoLayout, getKeyAtPoint, PianoLayout, KeyLayout } from '../lib/layout';
import { getPitchColor, isBlackKey } from '../lib/music';
import { inputDispatcher } from '../lib/input/dispatcher';
import { PointerInputHandler } from '../lib/input/pointer';
import { KeyboardInputHandler } from '../lib/input/keyboard';
import { ParticleSystem } from '../lib/graphics/particles';
import { generateStars, renderBackground, renderWhiteKey, renderBlackKey, Star } from '../lib/graphics/assets';

export const PianoCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLayoutRef = useRef<PianoLayout | null>(null);

  const {
    octaves,
    startOctave,
    showNoteNames,
    keyboardBaseOctave,
    setKeyboardBaseOctave,
    isAudioStarted,
  } = usePianoStore();

  // Keep latest store values in refs for Pixi render loop without re-triggering effects
  const storeRef = useRef({
    octaves,
    startOctave,
    showNoteNames,
    keyboardBaseOctave,
  });

  useEffect(() => {
    storeRef.current = {
      octaves,
      startOctave,
      showNoteNames,
      keyboardBaseOctave,
    };
  }, [octaves, startOctave, showNoteNames, keyboardBaseOctave]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let destroyed = false;
    let app: Application | null = null;
    let pointerHandler: PointerInputHandler | null = null;
    let keyboardHandler: KeyboardInputHandler | null = null;
    let unsubscribeDispatcher: (() => void) | null = null;

    // Track pressed keys for visual rendering
    const pressedNotes = new Set<number>();

    // Pixi display objects
    let bgGraphics: Graphics;
    let whiteKeysGraphics: Graphics;
    let blackKeysGraphics: Graphics;
    let labelsContainer: Container;
    let particleSystem: ParticleSystem;

    // Animation / Tweening state
    let stars: Star[] = [];
    let tweenStartTime = 0;
    const TWEEN_DURATION = 180; // ms
    let isTweening = false;
    let prevLayoutMap = new Map<number, { x: number; y: number; width: number; height: number }>();
    let targetLayout: PianoLayout;

    // Active rendered keys
    let currentRenderKeys: KeyLayout[] = [];

    const textPool: Text[] = [];

    const getTextSprite = (index: number, text: string, fontSize: number, color: number): Text => {
      while (textPool.length <= index) {
        const t = new Text({
          text: '',
          style: {
            fontFamily: 'monospace, system-ui, sans-serif',
            fontSize: 11,
            fill: 0x64748b,
            fontWeight: '600',
          },
        });
        t.anchor.set(0.5, 0.5);
        labelsContainer.addChild(t);
        textPool.push(t);
      }
      const t = textPool[index];
      t.text = text;
      t.style.fontSize = fontSize;
      t.style.fill = color;
      t.visible = true;
      return t;
    };

    const redrawKeys = () => {
      if (!whiteKeysGraphics || !blackKeysGraphics) return;

      whiteKeysGraphics.clear();
      blackKeysGraphics.clear();

      // Hide all texts initially
      textPool.forEach((t) => {
        t.visible = false;
      });

      const showLabels = storeRef.current.showNoteNames;
      let textIdx = 0;

      // 1. Draw White Keys
      for (let i = 0; i < currentRenderKeys.length; i++) {
        const key = currentRenderKeys[i];
        if (!key.isBlack) {
          const isPressed = pressedNotes.has(key.midi);
          const color = getPitchColor(key.midi).hex;
          renderWhiteKey(whiteKeysGraphics, key, isPressed, color);

          if (showLabels && key.width > 14) {
            const fontSize = Math.max(9, Math.min(13, Math.floor(key.width * 0.38)));
            const t = getTextSprite(
              textIdx++,
              key.noteName,
              fontSize,
              isPressed ? 0x0284c7 : 0x64748b
            );
            t.x = Math.round(key.x + key.width / 2);
            t.y = Math.round(key.y + key.height - 18);
          }
        }
      }

      // 2. Draw Black Keys (above white keys)
      for (let i = 0; i < currentRenderKeys.length; i++) {
        const key = currentRenderKeys[i];
        if (key.isBlack) {
          const isPressed = pressedNotes.has(key.midi);
          const color = getPitchColor(key.midi).hex;
          renderBlackKey(blackKeysGraphics, key, isPressed, color);

          if (showLabels && key.width >= 12) {
            const fontSize = Math.max(8, Math.min(10, Math.floor(key.width * 0.42)));
            const t = getTextSprite(
              textIdx++,
              key.noteName,
              fontSize,
              isPressed ? 0x38bdf8 : 0x94a3b8
            );
            t.x = Math.round(key.x + key.width / 2);
            t.y = Math.round(key.y + key.height - 14);
          }
        }
      }
    };

    const updateLayout = (animate: boolean = true) => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      if (width === 0 || height === 0) return;

      const newTarget = computePianoLayout({
        screenWidth: width,
        screenHeight: height,
        octaves: storeRef.current.octaves,
        startOctave: storeRef.current.startOctave,
        pianoHeightRatio: 0.62,
      });

      if (!activeLayoutRef.current || !animate) {
        targetLayout = newTarget;
        activeLayoutRef.current = newTarget;
        currentRenderKeys = newTarget.allKeys.map((k) => ({ ...k }));
        redrawKeys();
        return;
      }

      // Record previous key bounds for tweening
      prevLayoutMap.clear();
      for (const k of currentRenderKeys) {
        prevLayoutMap.set(k.midi, { x: k.x, y: k.y, width: k.width, height: k.height });
      }

      targetLayout = newTarget;
      tweenStartTime = performance.now();
      isTweening = true;
    };

    const stepTween = (now: number) => {
      if (!isTweening || !targetLayout) return;

      const elapsed = now - tweenStartTime;
      const progress = Math.min(1, elapsed / TWEEN_DURATION);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextKeys: KeyLayout[] = [];
      const nextKeyByMidi = new Map<number, KeyLayout>();
      const nextWhiteKeys: KeyLayout[] = [];
      const nextBlackKeys: KeyLayout[] = [];

      for (let i = 0; i < targetLayout.allKeys.length; i++) {
        const targetKey = targetLayout.allKeys[i];
        const prev = prevLayoutMap.get(targetKey.midi) || {
          x: targetKey.x,
          y: targetKey.y,
          width: targetKey.width,
          height: targetKey.height,
        };

        const currentX = prev.x + (targetKey.x - prev.x) * ease;
        const currentW = prev.width + (targetKey.width - prev.width) * ease;
        const currentY = prev.y + (targetKey.y - prev.y) * ease;
        const currentH = prev.height + (targetKey.height - prev.height) * ease;

        const k: KeyLayout = {
          ...targetKey,
          x: currentX,
          y: currentY,
          width: currentW,
          height: currentH,
        };

        nextKeys.push(k);
        nextKeyByMidi.set(k.midi, k);
        if (k.isBlack) {
          nextBlackKeys.push(k);
        } else {
          nextWhiteKeys.push(k);
        }
      }

      currentRenderKeys = nextKeys;

      // Update activeLayoutRef so hit-testing matches live visual interpolation exactly!
      activeLayoutRef.current = {
        ...targetLayout,
        allKeys: nextKeys,
        whiteKeys: nextWhiteKeys,
        blackKeys: nextBlackKeys,
        keyByMidi: nextKeyByMidi,
      };

      redrawKeys();

      if (progress >= 1) {
        isTweening = false;
        activeLayoutRef.current = targetLayout;
        currentRenderKeys = targetLayout.allKeys.map((k) => ({ ...k }));
        redrawKeys();
      }
    };

    // Initialize Pixi Application
    const initPixi = async () => {
      const pixiApp = new Application();
      await pixiApp.init({
        width: container.clientWidth || window.innerWidth,
        height: container.clientHeight || window.innerHeight,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        roundPixels: true,
        background: '#090d16',
      });

      if (destroyed) {
        pixiApp.destroy(true, { children: true });
        return;
      }

      app = pixiApp;
      container.appendChild(pixiApp.canvas);
      pixiApp.canvas.style.display = 'block';
      pixiApp.canvas.style.touchAction = 'none';

      // Layers setup
      bgGraphics = new Graphics();
      whiteKeysGraphics = new Graphics();
      blackKeysGraphics = new Graphics();
      labelsContainer = new Container();
      particleSystem = new ParticleSystem();

      pixiApp.stage.addChild(bgGraphics);
      pixiApp.stage.addChild(whiteKeysGraphics);
      pixiApp.stage.addChild(blackKeysGraphics);
      pixiApp.stage.addChild(labelsContainer);
      pixiApp.stage.addChild(particleSystem.container);

      // Starfield initialization
      stars = generateStars(65, pixiApp.screen.width, pixiApp.screen.height);

      // Initial layout
      updateLayout(false);

      // Bind Pointer Input directly to canvas
      pointerHandler = new PointerInputHandler();
      const unbindPointer = pointerHandler.bind(pixiApp.canvas, () => activeLayoutRef.current!);

      // Bind Keyboard Input
      keyboardHandler = new KeyboardInputHandler();
      keyboardHandler.setBaseOctave(storeRef.current.keyboardBaseOctave);
      const unbindKeyboard = keyboardHandler.bind((newOctave) => {
        setKeyboardBaseOctave(newOctave);
      });

      // Listen to real-time note events from inputDispatcher
      unsubscribeDispatcher = inputDispatcher.addListener((midi, pressed, velocity, x, y) => {
        if (pressed) {
          pressedNotes.add(midi);

          // Find key layout to spawn particles
          const keyLayout = activeLayoutRef.current?.keyByMidi.get(midi);
          if (keyLayout) {
            const spawnX = keyLayout.x;
            const spawnY = keyLayout.y + keyLayout.height * 0.75;
            const color = getPitchColor(midi).hex;
            particleSystem.spawn(spawnX, spawnY, keyLayout.width, color);
          }
        } else {
          pressedNotes.delete(midi);
        }

        redrawKeys();
      });

      // Pixi Render Loop Ticker
      let elapsedFrames = 0;
      pixiApp.ticker.add((ticker) => {
        elapsedFrames += ticker.deltaTime;
        const now = performance.now();

        // Tween key layouts if animating
        if (isTweening) {
          stepTween(now);
        }

        // Update background twinkling stars & felt rail
        if (activeLayoutRef.current) {
          renderBackground(
            bgGraphics,
            pixiApp.screen.width,
            pixiApp.screen.height,
            activeLayoutRef.current.pianoY,
            stars,
            elapsedFrames
          );
        }

        // Update particles
        particleSystem.update(ticker.deltaTime);
      });

      // Window resize / orientation change
      const handleResize = () => {
        if (!app || !container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        app.renderer.resize(w, h);
        stars = generateStars(65, w, h);
        updateLayout(false);
      };

      const handleCustomLayout = () => {
        updateLayout(true);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      window.addEventListener('piano:update-layout', handleCustomLayout);

      // Store cleanup function
      return () => {
        unbindPointer();
        unbindKeyboard();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('piano:update-layout', handleCustomLayout);
      };
    };

    let cleanupPromise = initPixi();

    return () => {
      destroyed = true;
      if (unsubscribeDispatcher) unsubscribeDispatcher();
      cleanupPromise.then((cleanup) => {
        cleanup?.();
        if (app) {
          app.destroy(true, { children: true });
          app = null;
        }
      });
    };
  }, []);

  // Update layout when octaves or startOctave changes from the UI controls / mini-map
  useEffect(() => {
    // Dispatch custom layout update event inside canvas
    const event = new CustomEvent('piano:update-layout');
    window.dispatchEvent(event);
  }, [octaves, startOctave, showNoteNames]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 overflow-hidden select-none bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
