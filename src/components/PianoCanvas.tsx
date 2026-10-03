'use client';

import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import { usePianoStore } from '../store/pianoStore';
import { computePianoLayout, getKeyAtPoint, PianoLayout, KeyLayout, getMidiKeyBoundsInLayout } from '../lib/layout';
import { getPitchColor, isBlackKey, midiToNoteName } from '../lib/music';
import { inputDispatcher } from '../lib/input/dispatcher';
import { PointerInputHandler } from '../lib/input/pointer';
import { KeyboardInputHandler, getKeyboardKeyForMidi } from '../lib/input/keyboard';
import { ParticleSystem } from '../lib/graphics/particles';
import { generateStars, renderBackground, renderWhiteKey, renderBlackKey, Star } from '../lib/graphics/assets';
import { useSongStore } from '../store/songStore';
import { renderFallingNotes } from '../lib/graphics/fallingNotes';

export const PianoCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLayoutRef = useRef<PianoLayout | null>(null);

  const {
    octaves,
    startOctave,
    showNoteNames,
    showKeyboardShortcuts,
    keyboardBaseOctave,
    setKeyboardBaseOctave,
    isAudioStarted,
  } = usePianoStore();

  // Keep latest store values in refs for Pixi render loop without re-triggering effects
  const storeRef = useRef({
    octaves,
    startOctave,
    showNoteNames,
    showKeyboardShortcuts,
    keyboardBaseOctave,
  });

  useEffect(() => {
    storeRef.current = {
      octaves,
      startOctave,
      showNoteNames,
      showKeyboardShortcuts,
      keyboardBaseOctave,
    };
  }, [octaves, startOctave, showNoteNames, showKeyboardShortcuts, keyboardBaseOctave]);

  // Keep latest songStore state in ref for 60fps render loop
  const songStoreRef = useRef(useSongStore.getState());
  useEffect(() => {
    const unsub = useSongStore.subscribe((state) => {
      songStoreRef.current = state;
    });
    return unsub;
  }, []);

  // When a new song is selected, auto-center/adjust starting octave if needed
  useEffect(() => {
    const unsub = useSongStore.subscribe((curr, prev) => {
      if (curr.activeSong && curr.activeSong.id !== prev.activeSong?.id) {
        const { startOctave, setStartOctave } = usePianoStore.getState();
        if (
          curr.activeSong.suggestedStartOctave &&
          curr.activeSong.suggestedStartOctave !== startOctave
        ) {
          setStartOctave(curr.activeSong.suggestedStartOctave);
        }
      }
    });
    return unsub;
  }, []);

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
    let fallingWhiteGraphics: Graphics;
    let fallingBlackGraphics: Graphics;
    let hitGlowGraphics: Graphics;
    let whiteKeysGraphics: Graphics;
    let blackKeysGraphics: Graphics;
    let badgesGraphics: Graphics;
    let labelsContainer: Container;
    let particleSystem: ParticleSystem;

    // Track active auto-play sounding note indices
    const activePlayingIndices = new Set<number>();

    // Animation / Tweening state (continuous viewport camera pan)
    let stars: Star[] = [];
    let tweenStartTime = 0;
    const TWEEN_DURATION = 320; // Silky smooth 320ms continuous pan
    let isTweening = false;
    const tweenStartKeyBounds = new Map<number, { x: number; y: number; width: number; height: number; isBlack: boolean }>();
    const tweenEndKeyBounds = new Map<number, { x: number; y: number; width: number; height: number; isBlack: boolean }>();
    let allTweenMidis: number[] = [];
    let targetLayout: PianoLayout;

    // Active rendered keys
    let currentRenderKeys: KeyLayout[] = [];

    const textPool: Text[] = [];

    const getTextSprite = (
      index: number,
      text: string,
      fontSize: number,
      color: number,
      fontWeight: string = '600'
    ): Text => {
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
      t.style.fontWeight = fontWeight as any;
      t.visible = true;
      return t;
    };

    const redrawKeys = () => {
      if (!whiteKeysGraphics || !blackKeysGraphics || !badgesGraphics) return;

      whiteKeysGraphics.clear();
      blackKeysGraphics.clear();
      badgesGraphics.clear();

      // Hide all texts initially
      textPool.forEach((t) => {
        t.visible = false;
      });

      const showLabels = storeRef.current.showNoteNames;
      const showShortcuts = storeRef.current.showKeyboardShortcuts;
      const baseOctave = storeRef.current.keyboardBaseOctave;
      let textIdx = 0;

      // 1. Draw White Keys
      for (let i = 0; i < currentRenderKeys.length; i++) {
        const key = currentRenderKeys[i];
        if (!key.isBlack) {
          const isPressed = pressedNotes.has(key.midi);
          const color = getPitchColor(key.midi).hex;
          renderWhiteKey(whiteKeysGraphics, key, isPressed, color);

          const keyBinding = showShortcuts ? getKeyboardKeyForMidi(key.midi, baseOctave) : null;

          if (keyBinding && key.width >= 16) {
            const isLower = keyBinding.row === 'lower';
            // Badge dimensions
            const badgeW = Math.max(16, Math.min(26, Math.floor(key.width * 0.72)));
            const badgeH = Math.max(16, Math.min(24, Math.floor(badgeW * 0.95)));
            const badgeX = Math.round(key.x + (key.width - badgeW) / 2);
            const badgeY = Math.round(key.y + key.height - badgeH - 8);
            const radius = 4;

            // Draw stylish keycap badge
            if (isPressed) {
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .fill({ color: isLower ? 0x0284c7 : 0x7c3aed, alpha: 0.95 });
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .stroke({ color: 0xffffff, width: 1.5, alpha: 0.9 });
            } else {
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .fill({ color: 0x0f172a, alpha: 0.92 });
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .stroke({ color: isLower ? 0x0284c7 : 0x9333ea, width: 1.2, alpha: 0.75 });
            }

            // Text sprite for keyboard letter
            const letterFontSize = Math.max(10, Math.min(13, Math.floor(badgeW * 0.58)));
            const letterSprite = getTextSprite(
              textIdx++,
              keyBinding.keyLabel,
              letterFontSize,
              isPressed ? 0xffffff : (isLower ? 0x38bdf8 : 0xd8b4fe),
              '700'
            );
            letterSprite.x = Math.round(badgeX + badgeW / 2);
            letterSprite.y = Math.round(badgeY + badgeH / 2);

            // Optional note name label above the badge
            if (showLabels && key.width > 18) {
              const noteFontSize = Math.max(8, Math.min(10, Math.floor(key.width * 0.32)));
              const noteSprite = getTextSprite(
                textIdx++,
                key.noteName,
                noteFontSize,
                isPressed ? 0x0284c7 : 0x64748b,
                '600'
              );
              noteSprite.x = Math.round(key.x + key.width / 2);
              noteSprite.y = Math.round(badgeY - 10);
            }
          } else if (showLabels && key.width > 14) {
            const fontSize = Math.max(9, Math.min(13, Math.floor(key.width * 0.38)));
            const t = getTextSprite(
              textIdx++,
              key.noteName,
              fontSize,
              isPressed ? 0x0284c7 : 0x64748b,
              '600'
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

          const keyBinding = showShortcuts ? getKeyboardKeyForMidi(key.midi, baseOctave) : null;

          if (keyBinding && key.width >= 12) {
            const isLower = keyBinding.row === 'lower';
            const badgeW = Math.max(12, Math.min(20, Math.floor(key.width * 0.8)));
            const badgeH = Math.max(12, Math.min(20, Math.floor(badgeW * 0.95)));
            const badgeX = Math.round(key.x + (key.width - badgeW) / 2);
            const badgeY = Math.round(key.y + key.height - badgeH - 6);
            const radius = 3;

            // Draw black key shortcut badge
            if (isPressed) {
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .fill({ color: isLower ? 0x0284c7 : 0x7c3aed, alpha: 0.95 });
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .stroke({ color: 0xffffff, width: 1.5, alpha: 0.9 });
            } else {
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .fill({ color: 0x020617, alpha: 0.9 });
              badgesGraphics
                .roundRect(badgeX, badgeY, badgeW, badgeH, radius)
                .stroke({ color: isLower ? 0x38bdf8 : 0xc084fc, width: 1.2, alpha: 0.8 });
            }

            const letterFontSize = Math.max(8, Math.min(11, Math.floor(badgeW * 0.6)));
            const letterSprite = getTextSprite(
              textIdx++,
              keyBinding.keyLabel,
              letterFontSize,
              isPressed ? 0xffffff : (isLower ? 0x38bdf8 : 0xf0abfc),
              '700'
            );
            letterSprite.x = Math.round(badgeX + badgeW / 2);
            letterSprite.y = Math.round(badgeY + badgeH / 2);

            // Optional note name label above the badge
            if (showLabels && key.width >= 16) {
              const noteFontSize = Math.max(7, Math.min(9, Math.floor(key.width * 0.34)));
              const noteSprite = getTextSprite(
                textIdx++,
                key.noteName,
                noteFontSize,
                isPressed ? 0x38bdf8 : 0x94a3b8,
                '600'
              );
              noteSprite.x = Math.round(key.x + key.width / 2);
              noteSprite.y = Math.round(badgeY - 9);
            }
          } else if (showLabels && key.width >= 12) {
            const fontSize = Math.max(8, Math.min(10, Math.floor(key.width * 0.42)));
            const t = getTextSprite(
              textIdx++,
              key.noteName,
              fontSize,
              isPressed ? 0x38bdf8 : 0x94a3b8,
              '600'
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

      if (keyboardHandler) {
        keyboardHandler.setBaseOctave(storeRef.current.keyboardBaseOctave);
      }

      const isMobilePortrait = height > width && width < 768;
      const isMobileLandscape = width > height && height < 500;
      const heightRatio = isMobilePortrait ? 0.74 : (isMobileLandscape ? 0.72 : 0.62);

      const newTarget = computePianoLayout({
        screenWidth: width,
        screenHeight: height,
        octaves: storeRef.current.octaves,
        startOctave: storeRef.current.startOctave,
        pianoHeightRatio: heightRatio,
      });

      if (!activeLayoutRef.current || !animate) {
        targetLayout = newTarget;
        activeLayoutRef.current = newTarget;
        currentRenderKeys = newTarget.allKeys.map((k) => ({ ...k }));
        redrawKeys();
        return;
      }

      const prevLayout = activeLayoutRef.current;
      targetLayout = newTarget;

      // Span all MIDI notes between previous layout and target layout to ensure continuous camera panning
      const minMidi = Math.min(prevLayout.startMidi, targetLayout.startMidi);
      const maxMidi = Math.max(prevLayout.endMidi, targetLayout.endMidi);

      tweenStartKeyBounds.clear();
      tweenEndKeyBounds.clear();
      const midisList: number[] = [];

      // If mid-flight during another tween, preserve the current live interpolated positions
      const currentPosMap = new Map<number, { x: number; y: number; width: number; height: number }>();
      for (const k of currentRenderKeys) {
        currentPosMap.set(k.midi, { x: k.x, y: k.y, width: k.width, height: k.height });
      }

      for (let m = minMidi; m <= maxMidi; m++) {
        midisList.push(m);
        const cur = currentPosMap.get(m);
        const prevCalc = getMidiKeyBoundsInLayout(m, prevLayout);
        const startB = cur ? { ...prevCalc, x: cur.x, y: cur.y, width: cur.width, height: cur.height } : prevCalc;
        const endB = getMidiKeyBoundsInLayout(m, targetLayout);

        tweenStartKeyBounds.set(m, startB);
        tweenEndKeyBounds.set(m, endB);
      }

      allTweenMidis = midisList;
      tweenStartTime = performance.now();
      isTweening = true;
    };

    const stepTween = (now: number) => {
      if (!isTweening || !targetLayout) return;

      const elapsed = now - tweenStartTime;
      const progress = Math.min(1, elapsed / TWEEN_DURATION);
      // Quintic ease-out for ultra-luxurious, butter-smooth camera pan feel
      const ease = 1 - Math.pow(1 - progress, 4);

      const nextKeys: KeyLayout[] = [];
      const nextKeyByMidi = new Map<number, KeyLayout>();
      const nextWhiteKeys: KeyLayout[] = [];
      const nextBlackKeys: KeyLayout[] = [];

      const screenWidth = targetLayout.width;

      for (let i = 0; i < allTweenMidis.length; i++) {
        const midi = allTweenMidis[i];
        const start = tweenStartKeyBounds.get(midi)!;
        const end = tweenEndKeyBounds.get(midi)!;

        const currentX = start.x + (end.x - start.x) * ease;
        const currentW = start.width + (end.width - start.width) * ease;
        const currentY = start.y + (end.y - start.y) * ease;
        const currentH = start.height + (end.height - start.height) * ease;

        // Cull keys that are completely off-screen with small buffer
        if (currentX + currentW < -10 || currentX > screenWidth + 10) {
          continue;
        }

        const isBlack = start.isBlack;
        const k: KeyLayout = {
          midi,
          noteName: midiToNoteName(midi),
          isBlack,
          x: currentX,
          y: currentY,
          width: currentW,
          height: currentH,
        };

        nextKeys.push(k);
        nextKeyByMidi.set(midi, k);
        if (isBlack) {
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
      fallingWhiteGraphics = new Graphics();
      fallingBlackGraphics = new Graphics();
      hitGlowGraphics = new Graphics();
      whiteKeysGraphics = new Graphics();
      blackKeysGraphics = new Graphics();
      badgesGraphics = new Graphics();
      labelsContainer = new Container();
      particleSystem = new ParticleSystem();

      pixiApp.stage.addChild(bgGraphics);
      pixiApp.stage.addChild(fallingWhiteGraphics);
      pixiApp.stage.addChild(fallingBlackGraphics);
      pixiApp.stage.addChild(hitGlowGraphics);
      pixiApp.stage.addChild(whiteKeysGraphics);
      pixiApp.stage.addChild(blackKeysGraphics);
      pixiApp.stage.addChild(badgesGraphics);
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

        // Song falling notes update & auto-play
        const songState = songStoreRef.current;
        if (songState.activeSong && songState.isPlaying) {
          const deltaSec = (ticker.deltaTime / 60) * songState.playbackSpeed;
          const nextTime = songState.currentTime + deltaSec;

          if (nextTime >= songState.activeSong.duration) {
            useSongStore.getState().stop();
          } else {
            useSongStore.setState({ currentTime: nextTime });

            // In 'listen' (Auto-play) mode, trigger noteOn and noteOff
            if (songState.mode === 'listen') {
              const notes = songState.activeSong.notes;
              for (let i = 0; i < notes.length; i++) {
                const n = notes[i];
                const isSounding = nextTime >= n.time && nextTime < n.time + n.duration;
                const wasSounding = activePlayingIndices.has(i);

                if (isSounding && !wasSounding) {
                  activePlayingIndices.add(i);
                  inputDispatcher.noteOn(n.midi, n.velocity ?? 0.85);
                } else if (!isSounding && wasSounding) {
                  activePlayingIndices.delete(i);
                  inputDispatcher.noteOff(n.midi);
                }
              }
            }
          }
        } else if (!songState.isPlaying && activePlayingIndices.size > 0) {
          if (songState.activeSong) {
            activePlayingIndices.forEach((idx) => {
              const n = songState.activeSong?.notes[idx];
              if (n) inputDispatcher.noteOff(n.midi);
            });
          }
          activePlayingIndices.clear();
        }

        // Render falling notes if song is active
        if (activeLayoutRef.current) {
          if (songState.activeSong) {
            renderFallingNotes({
              whiteNotesGraphics: fallingWhiteGraphics,
              blackNotesGraphics: fallingBlackGraphics,
              hitGlowGraphics: hitGlowGraphics,
              song: songState.activeSong,
              currentTime: songState.currentTime,
              fallDuration: songState.fallDuration,
              layout: activeLayoutRef.current,
              pianoY: activeLayoutRef.current.pianoY,
              screenWidth: pixiApp.screen.width,
            });
          } else {
            fallingWhiteGraphics.clear();
            fallingBlackGraphics.clear();
            hitGlowGraphics.clear();
          }
        }
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

      const handleRedrawOnly = () => {
        if (keyboardHandler) {
          keyboardHandler.setBaseOctave(storeRef.current.keyboardBaseOctave);
        }
        redrawKeys();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      window.addEventListener('piano:update-layout', handleCustomLayout);
      window.addEventListener('piano:redraw-keys', handleRedrawOnly);

      // Store cleanup function
      return () => {
        unbindPointer();
        unbindKeyboard();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('piano:update-layout', handleCustomLayout);
        window.removeEventListener('piano:redraw-keys', handleRedrawOnly);
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
  }, [octaves, startOctave]);

  // Redraw keys when labels, keyboard base octave, or shortcuts toggle change
  useEffect(() => {
    const event = new CustomEvent('piano:redraw-keys');
    window.dispatchEvent(event);
  }, [showNoteNames, showKeyboardShortcuts, keyboardBaseOctave]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 overflow-hidden select-none bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
