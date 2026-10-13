/*
 * Superfici da non disegnare.
 * Con la telecamera ruotata in 3D Chrome deve preparare ogni elemento della tela come una
 * superficie a sé e, in prospettiva, non sa limitarsi alla parte che si vede: con decine di
 * superfici grandi (la tela stessa, i frame lontani) esaurisce la memoria grafica, e a seconda
 * del momento mancano pezzi della slide inquadrata o persino del menu, che sfarfallano durante
 * i movimenti. Peggio ancora le superfici a cavallo dell'occhio della telecamera, o viste
 * esattamente di taglio, che rompono il calcolo 3D di tutta la pagina.
 * Per questo si nascondono le superfici dietro l'occhio, quelle viste di taglio e quelle fuori
 * dallo schermo, che non si vedrebbero comunque. E quando la tela stessa attraversa il piano
 * dell'occhio la si divide in tessere, disegnando solo quelle che si vedono; se poi la telecamera
 * la guarda molto di scorcio (come davanti a un frame girato di 90°) non si disegna né la tela
 * né ciò che vi è appoggiato: resta solo ciò che sta sui piani inclinati.
 * Senza dipendenze da Angular: le usa anche il player autonomo delle presentazioni esportate.
 */
import { Proper, allElements, elementCorners, tiltLayers } from '../model/presentation';
import { CameraView } from './camera';

/**
 * Coordinata omogenea w minima, dopo la prospettiva della telecamera, di un punto da mostrare:
 * vale 1 sul piano messo a fuoco e 0 sul piano dell'occhio; sotto la soglia il punto è dietro
 * l'occhio o troppo vicino.
 */
export const MIN_W = 0.05;

/** Spessore minimo, in pixel dello schermo, di una superficie da mostrare (vista di taglio ha area nulla). */
export const MIN_THICKNESS = 1;

/** Margine attorno allo schermo, in frazione della finestra, entro cui le superfici restano pronte. */
export const SCREEN_MARGIN = 0.25;

/** Almeno un punto, visto dalla telecamera, è dietro o troppo vicino all'occhio. */
export const behindEye = ({ matrix }: CameraView, points: DOMPoint[]): boolean =>
  points.some((p) => matrix.transformPoint(p).w < MIN_W);

/** La superficie dai vertici `points` (in ordine) non si vede: è dietro l'occhio, di taglio o fuori dallo schermo. */
export function hiddenFrom({ matrix, viewport }: CameraView, points: DOMPoint[]): boolean {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of points) {
    const q = matrix.transformPoint(p);
    if (q.w < MIN_W) return true;
    xs.push(q.x / q.w);
    ys.push(q.y / q.w);
  }
  const mx = viewport.width * SCREEN_MARGIN;
  const my = viewport.height * SCREEN_MARGIN;
  if (Math.max(...xs) < -mx || Math.min(...xs) > viewport.width + mx) return true;
  if (Math.max(...ys) < -my || Math.min(...ys) > viewport.height + my) return true;
  // spessore = area / lato più lungo (formula dell'area di Gauss)
  let area = 0;
  let longest = 0;
  xs.forEach((x, i) => {
    const j = (i + 1) % xs.length;
    area += x * ys[j] - xs[j] * ys[i];
    longest = Math.max(longest, Math.hypot(xs[j] - x, ys[j] - ys[i]));
  });
  return Math.abs(area) / 2 < MIN_THICKNESS * longest;
}

/** Angoli, in 3D, di tutti gli elementi: da ricalcolare solo quando cambia la presentazione. */
export function sceneCorners(proper: Proper): Map<number, DOMPoint[]> {
  const layers = tiltLayers(proper);
  return new Map(allElements(proper).map((el) => [el.id, elementCorners(proper, el, layers.get(el.id))]));
}

/** L'elemento sta sul piano della tela (non su un frame inclinato). */
const onFloor = (points: DOMPoint[]) => points.every((p) => Math.abs(p.z) < 1e-6);

/**
 * Elementi da nascondere con la vista `view` (vedi hiddenFrom); con `noFloor` anche tutti
 * quelli appoggiati sulla tela.
 */
export function culledElements(corners: Map<number, DOMPoint[]>, view: CameraView, noFloor = false): Set<number> {
  const culled = new Set<number>();
  for (const [id, points] of corners) if ((noFloor && onFloor(points)) || hiddenFrom(view, points)) culled.add(id);
  return culled;
}

/** Angoli della tela (il piano su cui stanno gli elementi). */
export const floorCorners = (width: number, height: number): DOMPoint[] => [
  new DOMPoint(0, 0, 0),
  new DOMPoint(width, 0, 0),
  new DOMPoint(width, height, 0),
  new DOMPoint(0, height, 0),
];

/**
 * Inclinazione della telecamera oltre la quale la tela, vista molto di scorcio, non si disegna:
 * si vede pochissimo, e con la tela e i suoi elementi in prospettiva Chrome a volte non disegna
 * più nulla (pagina vuota, menu compreso).
 */
export const MAX_FLOOR_TILT = 60;

/**
 * Come disegnare la tela: intera, divisa in tessere (quando attraversa il piano dell'occhio)
 * o per niente, insieme a ciò che vi è appoggiato (quando la telecamera la guarda troppo di scorcio).
 */
export type FloorMode = 'whole' | 'tiles' | 'none';

export function floorMode(view: CameraView, width: number, height: number): FloorMode {
  if (view.tilt > MAX_FLOOR_TILT) return 'none';
  return behindEye(view, floorCorners(width, height)) ? 'tiles' : 'whole';
}

export interface Tile {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function floorTiles(width: number, height: number, columns = 8, rows = 8): Tile[] {
  const tiles: Tile[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++) {
      const x = (width * c) / columns;
      const y = (height * r) / rows;
      tiles.push({ x, y, width: (width * (c + 1)) / columns - x, height: (height * (r + 1)) / rows - y });
    }
  return tiles;
}

export const tileCorners = (t: Tile): DOMPoint[] => [
  new DOMPoint(t.x, t.y, 0),
  new DOMPoint(t.x + t.width, t.y, 0),
  new DOMPoint(t.x + t.width, t.y + t.height, 0),
  new DOMPoint(t.x, t.y + t.height, 0),
];

export const sameIds = (a: ReadonlySet<number>, b: ReadonlySet<number>): boolean =>
  a === b || (a.size === b.size && [...a].every((id) => b.has(id)));
