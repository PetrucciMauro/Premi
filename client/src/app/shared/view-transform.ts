/*
 * Telecamera per i componenti Angular: i calcoli sono in camera.ts, qui il movimento
 * viene esposto con dei signal.
 */
import { signal } from '@angular/core';
import { Camera, CameraMotion, MotionDuration, Size } from './camera';

export * from './camera';

export class CameraAnimator {
  /** Valore CSS da assegnare a transform. */
  readonly transform = signal('');
  /** Scala a cui impaginare la tela (proprietà CSS zoom): la transform scala del resto, poco più o poco meno di 1. */
  readonly zoom = signal(1);
  private readonly motion: CameraMotion;

  constructor(duration: MotionDuration) {
    this.motion = new CameraMotion(duration, (transform, zoom) => {
      this.zoom.set(zoom);
      this.transform.set(transform);
    });
  }

  moveTo(viewport: Size, target: Camera, animate = true): void {
    this.motion.moveTo(viewport, target, animate);
  }

  stop(): void {
    this.motion.stop();
  }
}
