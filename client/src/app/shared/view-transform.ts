/*
 * Calcolo della "telecamera" che inquadra la tela: usata dall'editor per lo zoom
 * e dal player per spostarsi da un frame all'altro (al posto di impress.js).
 */
import { signal } from '@angular/core';

export interface Size {
  width: number;
  height: number;
}

export interface Target {
  xIndex: number;
  yIndex: number;
  width: number;
  height: number;
  rotation: number;
}

/** Posizione della telecamera: punto della tela al centro della finestra, scala e rotazione. */
export interface Camera {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

/**
 * Telecamera che porta il rettangolo `target` (in coordinate della tela) al centro della
 * finestra `viewport`, scalato per occupare la frazione `fill` e raddrizzato se ruotato.
 */
export function cameraFor(viewport: Size, target: Target, fill = 1): Camera {
  return {
    x: target.xIndex + target.width / 2,
    y: target.yIndex + target.height / 2,
    scale: Math.min(
      (viewport.width * fill) / Math.max(target.width, 1),
      (viewport.height * fill) / Math.max(target.height, 1),
    ),
    rotation: target.rotation,
  };
}

export const sameCamera = (a: Camera | null, b: Camera | null): boolean =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.scale === b.scale && a.rotation === b.rotation);

/** Matrice della telecamera, da applicare alla tela con transform-origin 0 0. */
export function cameraMatrix(viewport: Size, camera: Camera): DOMMatrix {
  return new DOMMatrix()
    .translate(viewport.width / 2, viewport.height / 2)
    .scale(camera.scale)
    .rotate(-camera.rotation)
    .translate(-camera.x, -camera.y);
}

export function viewMatrix(viewport: Size, target: Target, fill = 1): DOMMatrix {
  return cameraMatrix(viewport, cameraFor(viewport, target, fill));
}

/** Matrice che mostra tutta la tela. */
export function overviewMatrix(viewport: Size, canvas: Size, fill = 1): DOMMatrix {
  return viewMatrix(viewport, { xIndex: 0, yIndex: 0, rotation: 0, ...canvas }, fill);
}

export const cssMatrix = (m: DOMMatrix): string => m.toString();

/**
 * Percorso di zoom e spostamento fluido tra due telecamere (van Wijk e Nuij, "Smooth and
 * efficient zooming and panning", come d3-interpolate): per i salti lunghi la telecamera
 * si allontana e poi si riavvicina. Restituisce la funzione del percorso per t in [0, 1]
 * e la sua lunghezza S, proporzionale alla durata ideale.
 */
export function zoomPath(viewport: Size, from: Camera, to: Camera): { length: number; at: (t: number) => Camera } {
  const rho = Math.SQRT2;
  const w0 = viewport.width / from.scale;
  const w1 = viewport.width / to.scale;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d2 = dx * dx + dy * dy;
  // rotazione lungo l'arco più breve
  const dr = ((((to.rotation - from.rotation) % 360) + 540) % 360) - 180;
  const rotation = (t: number) => from.rotation + dr * t;

  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / rho;
    return {
      length: Math.abs(S),
      at: (t) => ({ x: from.x + t * dx, y: from.y + t * dy, scale: viewport.width / (w0 * Math.exp(rho * t * S)), rotation: rotation(t) }),
    };
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho ** 4 * d2) / (2 * w0 * rho * rho * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho ** 4 * d2) / (2 * w1 * rho * rho * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  return {
    length: S,
    at: (t) => {
      const s = t * S;
      const u = (w0 / (rho * rho * d1)) * (Math.cosh(r0) * Math.tanh(rho * s + r0) - Math.sinh(r0));
      const w = (w0 * Math.cosh(r0)) / Math.cosh(rho * s + r0);
      return { x: from.x + u * dx, y: from.y + u * dy, scale: viewport.width / w, rotation: rotation(t) };
    },
  };
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Anima la telecamera fotogramma per fotogramma invece di usare una transition CSS:
 * con la transition Chrome anima sul compositor un'immagine della tela rasterizzata a
 * una sola scala, e testi e immagini vettoriali si sgranano durante lo zoom. Cambiando
 * la trasformazione a ogni fotogramma la tela viene ridisegnata alla scala reale.
 */
export class CameraAnimator {
  /** Valore CSS da assegnare a transform. */
  readonly transform = signal('');
  private camera: Camera | null = null;
  private frame = 0;

  constructor(private readonly duration: { min: number; max: number; perUnit: number }) {}

  moveTo(viewport: Size, target: Camera, animate = true): void {
    cancelAnimationFrame(this.frame);
    const from = this.camera;
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || !from || reduced) {
      this.show(viewport, target);
      return;
    }
    const path = zoomPath(viewport, from, target);
    const { min, max, perUnit } = this.duration;
    const duration = Math.min(max, Math.max(min, path.length * perUnit));
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      this.show(viewport, t < 1 ? path.at(easeInOutCubic(t)) : target);
      if (t < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
  }

  private show(viewport: Size, camera: Camera): void {
    this.camera = camera;
    this.transform.set(cssMatrix(cameraMatrix(viewport, camera)));
  }
}
