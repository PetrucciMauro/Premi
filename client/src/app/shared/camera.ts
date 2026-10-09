/*
 * Calcolo della "telecamera" che inquadra la tela: usata dall'editor per lo zoom
 * e dal player per spostarsi da un frame all'altro (al posto di impress.js).
 * Non dipende da Angular: la usa anche il player autonomo delle presentazioni esportate in HTML.
 */
import { Proper, SlideElement, planeMatrix, tiltedFrames } from '../model/presentation';

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
  /** rotazione 3D e distanza dalla tela di un frame inclinato */
  rotateX?: number;
  rotateY?: number;
  z?: number;
}

/**
 * Posizione della telecamera: punto della tela al centro della finestra, scala e rotazione;
 * per i frame inclinati anche la rotazione 3D da annullare e la distanza dalla tela.
 */
export interface Camera {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  rotateX?: number;
  rotateY?: number;
  z?: number;
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
    rotateX: target.rotateX ?? 0,
    rotateY: target.rotateY ?? 0,
    z: target.z ?? 0,
  };
}

export const sameCamera = (a: Camera | null, b: Camera | null): boolean =>
  a === b ||
  (!!a &&
    !!b &&
    a.x === b.x &&
    a.y === b.y &&
    a.scale === b.scale &&
    a.rotation === b.rotation &&
    (a.rotateX ?? 0) === (b.rotateX ?? 0) &&
    (a.rotateY ?? 0) === (b.rotateY ?? 0) &&
    (a.z ?? 0) === (b.z ?? 0));

/** Distanza prospettica, in pixel dello schermo, con cui si vedono i frame inclinati. */
export const perspectiveFor = (viewport: Size) => Math.max(viewport.width, viewport.height) * 1.2;

/**
 * Matrice della telecamera, da applicare alla tela con transform-origin 0 0. Con
 * `perspective` la proiezione è prospettica: non cambia nulla sul piano della tela, ma i
 * frame inclinati appaiono in 3D. La rotazione 3D della telecamera raddrizza il frame inquadrato.
 */
export function cameraMatrix(viewport: Size, camera: Camera, perspective = 0): DOMMatrix {
  let m = new DOMMatrix().translate(viewport.width / 2, viewport.height / 2);
  if (perspective > 0) m = m.multiply(new DOMMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / perspective, 0, 0, 0, 1]));
  return m
    .scale(camera.scale, camera.scale, camera.scale)
    .rotateAxisAngle(0, 1, 0, -(camera.rotateY ?? 0))
    .rotateAxisAngle(1, 0, 0, -(camera.rotateX ?? 0))
    .rotate(-camera.rotation)
    .translate(-camera.x, -camera.y, -(camera.z ?? 0));
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
 * Telecamera che inquadra un elemento di fronte: se è (o sta su) un frame inclinato ne annulla
 * la rotazione 3D, così il piano del frame appare parallelo allo schermo e non ruotato.
 * Con più frame inclinati uno dentro l'altro raddrizza quello più vicino all'elemento.
 */
export function focusCamera(viewport: Size, proper: Proper, el: SlideElement, fill = 1): Camera {
  const { xIndex, yIndex, width, height, rotation } = el;
  const camera = cameraFor(viewport, { xIndex, yIndex, width, height, rotation }, fill);
  const tilt = tiltedFrames(proper, el, true).at(-1);
  if (!tilt) return camera;
  const center = planeMatrix(proper, el, true).transformPoint(new DOMPoint(camera.x, camera.y));
  return { ...camera, x: center.x, y: center.y, z: center.z, rotation: tilt.rotation, rotateX: tilt.rotateX, rotateY: tilt.rotateY };
}

/**
 * Punto del piano z = 0 di `m` che sullo schermo appare in (x, y): `m` porta il piano sullo
 * schermo (telecamera per piano di un elemento), anche in prospettiva. Sui punti del piano
 * la matrice si riduce a un'omografia 3×3, che si inverte con la matrice aggiunta.
 */
export function unproject(m: DOMMatrix, x: number, y: number): { x: number; y: number } {
  const [a, b, c, d, e, f, g, h, i] = [m.m11, m.m21, m.m41, m.m12, m.m22, m.m42, m.m14, m.m24, m.m44];
  const w = (d * h - e * g) * x + (b * g - a * h) * y + (a * e - b * d);
  return {
    x: ((e * i - f * h) * x + (c * h - b * i) * y + (b * f - c * e)) / w,
    y: ((f * g - d * i) * x + (a * i - c * g) * y + (c * d - a * f)) / w,
  };
}

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
  // rotazioni lungo l'arco più breve
  const arc = (a = 0, b = 0) => (t: number) => a + (((((b - a) % 360) + 540) % 360) - 180) * t;
  const rotate = { rotation: arc(from.rotation, to.rotation), rotateX: arc(from.rotateX, to.rotateX), rotateY: arc(from.rotateY, to.rotateY) };
  const z0 = from.z ?? 0;
  const dz = (to.z ?? 0) - z0;
  const rotation = (t: number) => ({
    rotation: rotate.rotation(t),
    rotateX: rotate.rotateX(t),
    rotateY: rotate.rotateY(t),
    z: z0 + dz * t,
  });

  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / rho;
    return {
      length: Math.abs(S),
      at: (t) => ({ x: from.x + t * dx, y: from.y + t * dy, scale: viewport.width / (w0 * Math.exp(rho * t * S)), ...rotation(t) }),
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
      return { x: from.x + u * dx, y: from.y + u * dy, scale: viewport.width / w, ...rotation(t) };
    },
  };
}

/** passo della scala di impaginazione durante le animazioni (2^¼ ≈ 1.19) */
const ZOOM_STEP = 2 ** 0.25;

/**
 * Scala di impaginazione per la scala `scale` della telecamera durante un movimento: resta
 * quella attuale finché lo scarto è entro un passo, poi passa al valore a passi più vicino.
 */
export function layoutZoom(scale: number, current: number): number {
  if (current > 0 && scale / current <= ZOOM_STEP && current / scale <= ZOOM_STEP) return current;
  return ZOOM_STEP ** Math.round(Math.log(scale) / Math.log(ZOOM_STEP));
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Durata dei movimenti della telecamera: proporzionale alla lunghezza del percorso, entro min e max (ms). */
export interface MotionDuration {
  min: number;
  max: number;
  perUnit: number;
}

/**
 * Anima la telecamera fotogramma per fotogramma invece di usare una transition CSS:
 * con la transition Chrome anima sul compositor un'immagine della tela rasterizzata a
 * una sola scala, e testi e immagini vettoriali si sgranano durante lo zoom.
 * Anche cambiando la trasformazione a ogni fotogramma, con la prospettiva 3D Chrome non
 * ridisegna la tela alla nuova scala: per questo la scala viene data soprattutto con la
 * proprietà CSS zoom, che impagina di nuovo la tela, e la transform resta vicina a 1.
 * A ogni fotogramma `render` riceve la transform (CSS) e la scala di impaginazione.
 */
export class CameraMotion {
  private camera: Camera | null = null;
  private zoom = 1;
  private frame = 0;

  constructor(
    private readonly duration: MotionDuration,
    private readonly render: (transform: string, zoom: number) => void,
    /** senza la proprietà CSS zoom (Firefox prima della 126) la scala è tutta nella transform */
    private readonly layoutZoom = typeof CSS !== 'undefined' && !!CSS.supports?.('zoom', '2'),
  ) {}

  moveTo(viewport: Size, target: Camera, animate = true): void {
    cancelAnimationFrame(this.frame);
    const from = this.camera;
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || !from || reduced) {
      this.show(viewport, target, true);
      return;
    }
    const path = zoomPath(viewport, from, target);
    const { min, max, perUnit } = this.duration;
    const duration = Math.min(max, Math.max(min, path.length * perUnit));
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      if (t < 1) this.show(viewport, path.at(easeInOutCubic(t)));
      else this.show(viewport, target, true);
      if (t < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
  }

  private show(viewport: Size, camera: Camera, settled = false): void {
    this.camera = camera;
    // a riposo la tela è impaginata esattamente alla scala della telecamera; durante il
    // movimento la scala di impaginazione cambia a passi, per non ricalcolare il layout a ogni fotogramma
    if (!this.layoutZoom) this.zoom = 1;
    else this.zoom = settled ? camera.scale : layoutZoom(camera.scale, this.zoom);
    const z = this.zoom;
    this.render(cssMatrix(cameraMatrix(viewport, camera, perspectiveFor(viewport)).scale(1 / z, 1 / z, 1 / z)), z);
  }
}
