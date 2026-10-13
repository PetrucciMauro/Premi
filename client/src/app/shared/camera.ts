/*
 * Calcolo della "telecamera" che inquadra la tela: usata dall'editor per lo zoom
 * e dal player per spostarsi da un frame all'altro (al posto di impress.js).
 * Non dipende da Angular: la usa anche il player autonomo delle presentazioni esportate in HTML.
 */
import { Proper, SlideElement, planeMatrix, tiltedFrames } from '../model/presentation';
import { DEFAULT_TRANSITION, EASINGS, SpinAxis, Transition, TransitionKind } from '../model/transition';

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

/** Ciò che inquadra la telecamera: matrice dalla tela allo schermo (con la prospettiva) e finestra. */
export interface CameraView {
  matrix: DOMMatrix;
  viewport: Size;
  /** angolo, in gradi, tra la direzione della telecamera e la perpendicolare alla tela */
  tilt: number;
}

/** Inclinazione della telecamera rispetto alla tela (0 se la guarda di fronte). */
export function cameraTilt(camera: Camera): number {
  const rad = (deg = 0) => (deg * Math.PI) / 180;
  const cos = Math.cos(rad(camera.rotateX)) * Math.cos(rad(camera.rotateY));
  return (Math.acos(Math.min(1, Math.abs(cos))) * 180) / Math.PI;
}

/** Distanza prospettica, in pixel dello schermo, con cui si vedono i frame inclinati. */
export const perspectiveFor = (viewport: Size) => Math.max(viewport.width, viewport.height) * 1.2;

/**
 * Matrice della telecamera, da applicare alla tela con transform-origin 0 0. La rotazione 3D
 * della telecamera raddrizza il frame inquadrato.
 * Con `perspective` la proiezione diventa prospettica man mano che la telecamera si inclina
 * rispetto alla tela (del tutto a 90°): guardando la tela di fronte la vista resta ortografica,
 * così un frame girato di taglio resta una riga ovunque sia sullo schermo, mentre nei voli in 3D
 * e davanti ai frame inclinati la prospettiva dà profondità.
 */
export function cameraMatrix(viewport: Size, camera: Camera, perspective = 0): DOMMatrix {
  let m = new DOMMatrix().translate(viewport.width / 2, viewport.height / 2);
  const depth = Math.sin((cameraTilt(camera) * Math.PI) / 180);
  if (perspective > 0 && depth > 1e-6)
    m = m.multiply(new DOMMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -depth / perspective, 0, 0, 0, 1]));
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

/** Rotazioni lungo l'arco più breve e profondità, interpolate per t in [0, 1]. */
function turnPath(from: Camera, to: Camera) {
  const arc = (a = 0, b = 0) => (t: number) => a + (((((b - a) % 360) + 540) % 360) - 180) * t;
  const rotate = { rotation: arc(from.rotation, to.rotation), rotateX: arc(from.rotateX, to.rotateX), rotateY: arc(from.rotateY, to.rotateY) };
  const z0 = from.z ?? 0;
  const dz = (to.z ?? 0) - z0;
  return (t: number) => ({ rotation: rotate.rotation(t), rotateX: rotate.rotateX(t), rotateY: rotate.rotateY(t), z: z0 + dz * t });
}

export interface CameraPath {
  /** lunghezza del percorso, proporzionale alla durata ideale */
  length: number;
  at: (t: number) => Camera;
}

/**
 * Percorso di zoom e spostamento fluido tra due telecamere (van Wijk e Nuij, "Smooth and
 * efficient zooming and panning", come d3-interpolate): per i salti lunghi la telecamera
 * si allontana e poi si riavvicina, tanto più quanto è grande `arc` (1 = come d3).
 * Restituisce la funzione del percorso per t in [0, 1] e la sua lunghezza S.
 */
export function zoomPath(viewport: Size, from: Camera, to: Camera, arc = 1): CameraPath {
  const rho = Math.SQRT2 * Math.max(arc, 0.05);
  const w0 = viewport.width / from.scale;
  const w1 = viewport.width / to.scale;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d2 = dx * dx + dy * dy;
  const rotation = turnPath(from, to);

  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / rho;
    return {
      length: Math.abs(S) * (rho / Math.SQRT2),
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
    // misurata come con l'ampiezza normale, così l'ampiezza non allunga la durata automatica
    length: S * (rho / Math.SQRT2),
    at: (t) => {
      const s = t * S;
      const u = (w0 / (rho * rho * d1)) * (Math.cosh(r0) * Math.tanh(rho * s + r0) - Math.sinh(r0));
      const w = (w0 * Math.cosh(r0)) / Math.cosh(rho * s + r0);
      return { x: from.x + u * dx, y: from.y + u * dy, scale: viewport.width / w, ...rotation(t) };
    },
  };
}

/** Percorso diretto: la telecamera va dritta verso l'inquadratura, con lo zoom a velocità costante. */
export function directPath(viewport: Size, from: Camera, to: Camera): CameraPath {
  const w0 = viewport.width / from.scale;
  const w1 = viewport.width / to.scale;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const rotation = turnPath(from, to);
  return {
    length: Math.hypot(Math.log(w1 / w0), Math.hypot(dx, dy) / Math.max(w0, w1)) / Math.SQRT2,
    at: (t) => ({ x: from.x + t * dx, y: from.y + t * dy, scale: viewport.width / (w0 * (w1 / w0) ** t), ...rotation(t) }),
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

/** Durata dei movimenti della telecamera: proporzionale alla lunghezza del percorso, entro min e max (ms). */
export interface MotionDuration {
  min: number;
  max: number;
  perUnit: number;
}

/** Come muovere la telecamera verso una nuova inquadratura (vedi motionFor). */
export interface MotionOptions {
  path: TransitionKind;
  /** durata in ms; null = in base alla lunghezza del percorso */
  duration: number | null;
  easing: (t: number) => number;
  arc: number;
  spins: number;
  spinAxis: SpinAxis;
  /** attesa prima di partire, in ms */
  delay: number;
  fadeColor: string;
  /**
   * riproduce il movimento al contrario: tornando indietro da un frame si rivede, a ritroso,
   * la transizione con cui ci si era arrivati
   */
  reverse: boolean;
}

/**
 * Opzioni di movimento per arrivare su un frame con la transizione `transition` (o quella
 * predefinita); con `reverse` per lasciarlo tornando indietro, rivedendo la transizione a
 * ritroso (senza l'attesa, che andando indietro sarebbe solo un ritardo).
 */
export function motionFor(transition: Transition = DEFAULT_TRANSITION, reverse = false): MotionOptions {
  return {
    path: transition.kind,
    duration: transition.duration === null ? null : transition.duration * 1000,
    easing: EASINGS[transition.easing],
    arc: transition.arc,
    spins: transition.spins,
    spinAxis: transition.spinAxis,
    delay: reverse ? 0 : transition.delay * 1000,
    fadeColor: transition.fadeColor,
    reverse,
  };
}

/** Velo colorato sopra la tela (per le dissolvenze): opacità da 0 a 1. */
export interface Veil {
  opacity: number;
  color: string;
}

export const NO_VEIL: Veil = { opacity: 0, color: '#000000' };

/** Telecamera con i giri in più (in gradi) attorno all'asse `axis`. */
const spun = (camera: Camera, axis: SpinAxis, degrees: number): Camera => {
  if (degrees === 0) return camera;
  if (axis === 'z') return { ...camera, rotation: camera.rotation + degrees };
  if (axis === 'x') return { ...camera, rotateX: (camera.rotateX ?? 0) + degrees };
  return { ...camera, rotateY: (camera.rotateY ?? 0) + degrees };
};

/**
 * Inquadrature del movimento verso `to`, per t in [0, 1] (prima dell'andamento): camera e velo.
 * Con la dissolvenza la vista sfuma sull'inquadratura di partenza e riappare su quella d'arrivo.
 */
export function motionAt(path: CameraPath, from: Camera, to: Camera, options: MotionOptions, t: number): { camera: Camera; veil: Veil } {
  if (options.path === 'fade') {
    const half = t < 0.5;
    const opacity = Math.min(1, Math.max(0, options.easing(half ? t * 2 : (1 - t) * 2)));
    return { camera: half ? from : to, veil: { opacity, color: options.fadeColor } };
  }
  const e = options.easing(t);
  return { camera: spun(path.at(e), options.spinAxis, options.spins * 360 * e), veil: NO_VEIL };
}

/**
 * Anima la telecamera fotogramma per fotogramma invece di usare una transition CSS:
 * con la transition Chrome anima sul compositor un'immagine della tela rasterizzata a
 * una sola scala, e testi e immagini vettoriali si sgranano durante lo zoom.
 * Anche cambiando la trasformazione a ogni fotogramma, con la prospettiva 3D Chrome non
 * ridisegna la tela alla nuova scala: per questo la scala viene data soprattutto con la
 * proprietà CSS zoom, che impagina di nuovo la tela, e la transform resta vicina a 1.
 * A ogni fotogramma `render` riceve la transform (CSS), la scala di impaginazione, la vista
 * della telecamera (matrice dalla tela allo schermo, con la prospettiva, e dimensioni della
 * finestra) e il velo da mostrare sopra la tela (per le dissolvenze).
 */
export class CameraMotion {
  private camera: Camera | null = null;
  private zoom = 1;
  private frame = 0;
  private veil: Veil = NO_VEIL;
  /** conclude il movimento in corso: true se è arrivato, false se è stato interrotto */
  private finish: ((arrived: boolean) => void) | null = null;

  constructor(
    private readonly duration: MotionDuration,
    private readonly render: (transform: string, zoom: number, view: CameraView, veil: Veil) => void,
    /** senza la proprietà CSS zoom (Firefox prima della 126) la scala è tutta nella transform */
    private readonly layoutZoom = typeof CSS !== 'undefined' && !!CSS.supports?.('zoom', '2'),
  ) {}

  /**
   * Muove la telecamera verso `target` con le opzioni `options` (senza: il volo classico).
   * La promessa restituita vale true quando la telecamera è arrivata, false se il movimento
   * viene interrotto da un altro.
   */
  moveTo(viewport: Size, target: Camera, animate = true, options: MotionOptions = motionFor()): Promise<boolean> {
    this.interrupt();
    const done = new Promise<boolean>((resolve) => (this.finish = resolve));
    const from = this.camera;
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || !from || reduced || (options.path === 'cut' && options.delay <= 0)) {
      this.arrive(viewport, target);
      return done;
    }

    const { min, max, perUnit } = this.duration;
    // al contrario si percorre a ritroso il movimento che va da `target` a `from`
    const [a, b] = options.reverse ? [target, from] : [from, target];
    const path = options.path === 'direct' ? directPath(viewport, a, b) : zoomPath(viewport, a, b, options.arc);
    const auto = options.path === 'fade' ? 900 : Math.min(max, Math.max(min, path.length * perUnit));
    const duration = options.path === 'cut' ? 0 : (options.duration ?? auto);
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start - options.delay;
      // durante l'attesa la telecamera resta ferma
      const t = elapsed < 0 ? -1 : duration > 0 ? Math.min(1, elapsed / duration) : 1;
      if (t >= 1) {
        this.arrive(viewport, target);
        return;
      }
      if (t >= 0) {
        const { camera, veil } = motionAt(path, a, b, options, options.reverse ? 1 - t : t);
        this.veil = veil;
        this.show(viewport, camera, options.path === 'fade' && t >= 0.5);
      }
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
    return done;
  }

  /**
   * Mostra subito l'inquadratura, senza animazione. Con `settled` false la scala di
   * impaginazione cambia solo a passi: per i movimenti continui, come lo zoom con la rotella.
   */
  jump(viewport: Size, target: Camera, settled = true): void {
    this.interrupt();
    this.veil = NO_VEIL;
    this.show(viewport, target, settled);
  }

  stop(): void {
    this.interrupt();
  }

  private interrupt(): void {
    cancelAnimationFrame(this.frame);
    const finish = this.finish;
    this.finish = null;
    finish?.(false);
  }

  private arrive(viewport: Size, target: Camera): void {
    this.veil = NO_VEIL;
    this.show(viewport, target, true);
    const finish = this.finish;
    this.finish = null;
    finish?.(true);
  }

  private show(viewport: Size, camera: Camera, settled = false): void {
    this.camera = camera;
    // a riposo la tela è impaginata esattamente alla scala della telecamera; durante il
    // movimento la scala di impaginazione cambia a passi, per non ricalcolare il layout a ogni fotogramma
    if (!this.layoutZoom) this.zoom = 1;
    else this.zoom = settled ? camera.scale : layoutZoom(camera.scale, this.zoom);
    const z = this.zoom;
    const matrix = cameraMatrix(viewport, camera, perspectiveFor(viewport));
    this.render(cssMatrix(matrix.scale(1 / z, 1 / z, 1 / z)), z, { matrix, viewport, tilt: cameraTilt(camera) }, this.veil);
  }
}
