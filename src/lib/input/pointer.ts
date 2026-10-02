import { getKeyAtPoint, PianoLayout } from '../layout';
import { inputDispatcher } from './dispatcher';

export class PointerInputHandler {
  private element: HTMLElement | null = null;
  private layout: PianoLayout | null = null;
  private activePointers = new Map<number, number>(); // pointerId -> midi
  private pointerPositions = new Map<number, { x: number; y: number }>();

  public bind(element: HTMLElement, getLayout: () => PianoLayout): () => void {
    this.element = element;

    const getCanvasCoords = (e: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const scaleX = element.clientWidth ? (element as HTMLCanvasElement).width / element.clientWidth : 1;
      const scaleY = element.clientHeight ? (element as HTMLCanvasElement).height / element.clientHeight : 1;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const layout = getLayout();
      if (!layout) return;

      const { x, y } = getCanvasCoords(e);
      this.pointerPositions.set(e.pointerId, { x, y });

      const key = getKeyAtPoint(x, y, layout);
      if (key) {
        this.activePointers.set(e.pointerId, key.midi);
        inputDispatcher.noteOn(key.midi, 0.85, x, y);
      }

      try {
        element.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const layout = getLayout();
      if (!layout) return;

      const { x, y } = getCanvasCoords(e);
      this.pointerPositions.set(e.pointerId, { x, y });

      if (this.activePointers.has(e.pointerId)) {
        const currentMidi = this.activePointers.get(e.pointerId);
        const key = getKeyAtPoint(x, y, layout);

        if (key && key.midi !== currentMidi) {
          if (currentMidi !== undefined) {
            inputDispatcher.noteOff(currentMidi);
          }
          this.activePointers.set(e.pointerId, key.midi);
          inputDispatcher.noteOn(key.midi, 0.85, x, y);
        } else if (!key && currentMidi !== undefined) {
          inputDispatcher.noteOff(currentMidi);
          this.activePointers.delete(e.pointerId);
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      if (this.activePointers.has(e.pointerId)) {
        const midi = this.activePointers.get(e.pointerId)!;
        inputDispatcher.noteOff(midi);
        this.activePointers.delete(e.pointerId);
      }
      this.pointerPositions.delete(e.pointerId);

      try {
        if (element.hasPointerCapture(e.pointerId)) {
          element.releasePointerCapture(e.pointerId);
        }
      } catch {}
    };

    const onPointerCancel = (e: PointerEvent) => {
      onPointerUp(e);
    };

    const onLostPointerCapture = (e: PointerEvent) => {
      onPointerUp(e);
    };

    const onWindowBlur = () => {
      this.releaseAll();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        this.releaseAll();
      }
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerCancel);
    element.addEventListener('lostpointercapture', onLostPointerCapture);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
      element.removeEventListener('lostpointercapture', onLostPointerCapture);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      this.releaseAll();
    };
  }

  public releaseAll(): void {
    this.activePointers.forEach((midi) => {
      inputDispatcher.noteOff(midi);
    });
    this.activePointers.clear();
    this.pointerPositions.clear();
  }
}
