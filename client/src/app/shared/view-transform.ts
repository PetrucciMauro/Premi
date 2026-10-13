/*
 * Telecamera per i componenti Angular: i calcoli sono in camera.ts, qui il movimento
 * viene esposto con dei signal.
 */
import { signal } from '@angular/core';
import { Camera, CameraMotion, CameraView, MotionDuration, MotionOptions, NO_VEIL, Size, Veil } from './camera';

export * from './camera';

export class CameraAnimator {
  /** Valore CSS da assegnare a transform. */
  readonly transform = signal('');
  /** Scala a cui impaginare la tela (proprietà CSS zoom): la transform scala del resto, poco più o poco meno di 1. */
  readonly zoom = signal(1);
  /** Vista della telecamera: serve a nascondere ciò che non si vede (vedi culling.ts). */
  readonly view = signal<CameraView | null>(null);
  /** Velo sopra la tela durante le dissolvenze. */
  readonly veil = signal<Veil>(NO_VEIL);
  private readonly motion: CameraMotion;

  constructor(duration: MotionDuration) {
    this.motion = new CameraMotion(duration, (transform, zoom, view, veil) => {
      this.zoom.set(zoom);
      this.veil.set(veil);
      this.view.set(view);
      this.transform.set(transform);
    });
  }

  /** Movimento verso `target` (vedi CameraMotion.moveTo): la promessa vale true all'arrivo. */
  moveTo(viewport: Size, target: Camera, animate = true, options?: MotionOptions): Promise<boolean> {
    return this.motion.moveTo(viewport, target, animate, options);
  }

  /** Inquadratura immediata (vedi CameraMotion.jump). */
  jump(viewport: Size, target: Camera, settled = true): void {
    this.motion.jump(viewport, target, settled);
  }

  stop(): void {
    this.motion.stop();
  }
}
