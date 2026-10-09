/*
 * Name : Giovanni Venturelli
 * Package : SlideShowElements
 * Description:
 *   Tipi degli elementi che compongono una presentazione e funzioni per crearli.
 *   Il formato è lo stesso salvato su MongoDB dalla versione precedente di Premi.
 */

export type ElementType = 'text' | 'frame' | 'image' | 'audio' | 'video' | 'SVG';
export type MediaType = 'image' | 'audio' | 'video';

/**
 * Posizione di un elemento associato a un frame, relativa al frame stesso: centro e
 * dimensioni in frazioni del frame (non ruotato), rotazione in aggiunta a quella del frame,
 * dimensione del testo in proporzione al frame. Le coordinate assolute dell'elemento restano
 * salvate e vengono ricalcolate da queste quando il frame cambia (vedi syncAnchors).
 */
export interface FrameAnchor {
  frame: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
}

interface BaseElement {
  id: number;
  xIndex: number;
  yIndex: number;
  rotation: number;
  zIndex: number;
  height: number;
  width: number;
  anchor?: FrameAnchor;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  font: string;
  fontSize: number;
  color: string;
}

export interface MediaElement extends BaseElement {
  type: MediaType;
  url: string;
}

/** Adattamento dell'immagine di sfondo di un frame; 'fill' (deformata) è il comportamento storico. */
export type FrameImageFit = 'cover' | 'contain' | 'fill';
export const FRAME_IMAGE_FITS: FrameImageFit[] = ['cover', 'contain', 'fill'];

export interface FrameElement extends BaseElement {
  type: 'frame';
  bookmark: number;
  ref: string;
  color: string;
  fit: FrameImageFit;
  /** inclinazione 3D in gradi attorno agli assi orizzontale e verticale del frame */
  rotateX: number;
  rotateY: number;
}

// gli SVG non sono creabili dall'editor ma vengono conservati se presenti
export interface SvgElement extends BaseElement {
  type: 'SVG';
  shape: string;
  color: string;
}

export type SlideElement = TextElement | MediaElement | FrameElement | SvgElement;

export interface Background {
  id: 0;
  type: 'background';
  color: string;
  image: string;
  width: number;
  height: number;
}

/**
 * Sottopercorso: parte da un frame del percorso principale quando, mentre quel frame è
 * inquadrato, si fa clic sull'elemento `trigger`; percorsi i suoi frame si torna al frame
 * di partenza. Un frame appartiene al massimo a un percorso.
 */
export interface SubPath {
  id: number;
  /** frame di partenza, nel percorso principale */
  frame: number;
  /** elemento che avvia il sottopercorso (null se non ancora scelto o eliminato) */
  trigger: number | null;
  choicePath: number[];
}

export interface Paths {
  main: number[];
  choices: SubPath[];
}

export interface Proper {
  paths: Paths;
  texts: TextElement[];
  frames: FrameElement[];
  images: MediaElement[];
  SVGs: SvgElement[];
  audios: MediaElement[];
  videos: MediaElement[];
  background: Background;
}

export interface PresentationMeta {
  titolo: string;
}

export interface Presentation {
  meta: PresentationMeta;
  proper: Proper;
}

export type ElementCollection = 'texts' | 'frames' | 'images' | 'SVGs' | 'audios' | 'videos';

export const COLLECTIONS: Record<ElementType, ElementCollection> = {
  text: 'texts',
  frame: 'frames',
  image: 'images',
  SVG: 'SVGs',
  audio: 'audios',
  video: 'videos',
};

export const ELEMENT_TYPES = Object.keys(COLLECTIONS) as ElementType[];

// la vecchia versione dimensionava la tela sulla larghezza dello schermo, con rapporto 2.0667:1
export const DEFAULT_CANVAS_WIDTH = 1600;
export const CANVAS_RATIO = 2.06666667;

export const DEFAULT_TEXT_FONT = 'Arial, Helvetica, sans-serif';
// dimensione in pixel di 1em del testo delle presentazioni
export const BASE_FONT_SIZE = 14;

export function allElements(proper: Proper): SlideElement[] {
  return ELEMENT_TYPES.flatMap((type) => proper[COLLECTIONS[type]] as SlideElement[]);
}

export function findElement(proper: Proper, id: number): SlideElement | undefined {
  return allElements(proper).find((el) => el.id === id);
}

export function nextElementId(proper: Proper): number {
  return Math.max(0, ...allElements(proper).map((el) => el.id)) + 1;
}

export function nextZIndex(proper: Proper): number {
  return Math.max(-1, ...allElements(proper).map((el) => el.zIndex)) + 1;
}

/** Aggiunge un elemento alla collezione corretta. */
export function addElement(proper: Proper, element: SlideElement): void {
  (proper[COLLECTIONS[element.type]] as SlideElement[]).push(element);
}

/** Rimuove un elemento e lo restituisce. */
export function removeElement(proper: Proper, id: number): SlideElement | undefined {
  for (const type of ELEMENT_TYPES) {
    const list = proper[COLLECTIONS[type]] as SlideElement[];
    const index = list.findIndex((el) => el.id === id);
    if (index !== -1) return list.splice(index, 1)[0];
  }
  return undefined;
}

/** Elimina "url(...)" attorno a un indirizzo: la vecchia versione a volte salvava il valore CSS. */
export function stripCssUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const match = /^url\((['"]?)(.*)\1\)$/.exec(value.trim());
  return match ? match[2] : value.trim();
}

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

const array = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/** Sottopercorsi validi; le scelte salvate dalla versione con impress.js non sono compatibili. */
function normalizeSubPaths(value: unknown): SubPath[] {
  return array<Record<string, unknown>>(value)
    .filter((raw) => raw && Array.isArray(raw['choicePath']) && Number.isFinite(Number(raw['frame'])) && raw['frame'] !== null)
    .map((raw, index) => ({
      id: num(raw['id'], index + 1) || index + 1,
      frame: num(raw['frame']),
      trigger: raw['trigger'] === null || !Number.isFinite(Number(raw['trigger'])) ? null : num(raw['trigger']),
      choicePath: array<unknown>(raw['choicePath']).map((id) => num(id)),
    }));
}

/** Percorso a cui appartiene il frame: 'main' o l'id del sottopercorso. */
export function pathOf(paths: Paths, frameId: number): 'main' | number | null {
  if (paths.main.includes(frameId)) return 'main';
  return paths.choices.find((sub) => sub.choicePath.includes(frameId))?.id ?? null;
}

/** Toglie il frame da tutti i percorsi (percorso principale e sottopercorsi). */
export function removeFromPaths(paths: Paths, frameId: number): void {
  paths.main = paths.main.filter((id) => id !== frameId);
  for (const sub of paths.choices) sub.choicePath = sub.choicePath.filter((id) => id !== frameId);
}

function normalizeAnchor(value: unknown): FrameAnchor | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const keys = ['frame', 'x', 'y', 'width', 'height', 'rotation'] as const;
  if (keys.some((key) => raw[key] === null || !Number.isFinite(Number(raw[key])))) return undefined;
  const anchor = Object.fromEntries(keys.map((key) => [key, Number(raw[key])])) as Omit<FrameAnchor, 'fontSize'>;
  return Number.isFinite(Number(raw['fontSize'])) ? { ...anchor, fontSize: Number(raw['fontSize']) } : anchor;
}

function normalizeBase(raw: Record<string, unknown>): BaseElement {
  const base: BaseElement = {
    id: num(raw['id']),
    xIndex: num(raw['xIndex']),
    yIndex: num(raw['yIndex']),
    rotation: num(raw['rotation']),
    zIndex: num(raw['zIndex']),
    height: num(raw['height']),
    width: num(raw['width']),
  };
  const anchor = normalizeAnchor(raw['anchor']);
  return anchor && anchor.frame !== base.id ? { ...base, anchor } : base;
}

/**
 * Porta una presentazione letta dal server in un formato coerente:
 * id numerici, campi mancanti valorizzati, indirizzi senza "url(...)".
 */
export function normalizePresentation(raw: unknown): Presentation {
  const doc = (raw ?? {}) as Record<string, any>;
  const proper = (doc['proper'] ?? {}) as Record<string, any>;
  const bg = (proper['background'] ?? {}) as Record<string, unknown>;
  const paths = (proper['paths'] ?? {}) as Record<string, unknown>;

  const width = num(bg['width'], DEFAULT_CANVAS_WIDTH) || DEFAULT_CANVAS_WIDTH;
  const height = num(bg['height'], width / CANVAS_RATIO) || width / CANVAS_RATIO;

  return {
    meta: { titolo: str(doc['meta']?.titolo) },
    proper: {
      paths: {
        main: array<unknown>(paths['main']).map((id) => num(id)),
        choices: normalizeSubPaths(paths['choices']),
      },
      texts: array<Record<string, unknown>>(proper['texts']).map((el) => ({
        ...normalizeBase(el),
        type: 'text',
        content: str(el['content']),
        font: str(el['font'], DEFAULT_TEXT_FONT) || DEFAULT_TEXT_FONT,
        fontSize: num(el['fontSize'], 1) || 1,
        color: str(el['color'], 'black') || 'black',
      })),
      frames: array<Record<string, unknown>>(proper['frames']).map((el) => ({
        ...normalizeBase(el),
        type: 'frame',
        bookmark: num(el['bookmark']) ? 1 : 0,
        ref: stripCssUrl(el['ref']),
        color: str(el['color']),
        fit: FRAME_IMAGE_FITS.includes(el['fit'] as FrameImageFit) ? (el['fit'] as FrameImageFit) : 'fill',
        rotateX: num(el['rotateX']),
        rotateY: num(el['rotateY']),
      })),
      images: array<Record<string, unknown>>(proper['images']).map((el) => ({
        ...normalizeBase(el),
        type: 'image',
        url: str(el['url']),
      })),
      SVGs: array<Record<string, unknown>>(proper['SVGs']).map((el) => ({
        ...normalizeBase(el),
        type: 'SVG',
        shape: str(el['shape']),
        color: str(el['color']),
      })),
      audios: array<Record<string, unknown>>(proper['audios']).map((el) => ({
        ...normalizeBase(el),
        type: 'audio',
        url: str(el['url']),
      })),
      videos: array<Record<string, unknown>>(proper['videos']).map((el) => ({
        ...normalizeBase(el),
        type: 'video',
        url: str(el['url']),
      })),
      background: {
        id: 0,
        type: 'background',
        color: str(bg['color'], 'rgb(255,255,255)') || 'rgb(255,255,255)',
        image: stripCssUrl(bg['image']),
        width,
        height,
      },
    },
  };
}

// ---------------------------------------------------------------- elementi associati ai frame

type Geometry = Pick<BaseElement, 'xIndex' | 'yIndex' | 'width' | 'height' | 'rotation'>;

const round = (value: number, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
const radians = (deg: number) => (deg * Math.PI) / 180;
const fontOf = (el: SlideElement) => (el.type === 'text' ? el.fontSize : undefined);
/** grandezza di riferimento del frame per la dimensione del testo */
const frameScale = (frame: Geometry) => Math.sqrt(Math.max(frame.width, 1) * Math.max(frame.height, 1));

const sameGeometry = (a: Geometry, b: Geometry) =>
  a.xIndex === b.xIndex && a.yIndex === b.yIndex && a.width === b.width && a.height === b.height && a.rotation === b.rotation;

/** Punto della tela nelle coordinate del frame (non ruotato, origine nell'angolo in alto a sinistra). */
export function toFrameLocal(frame: Geometry, x: number, y: number): { x: number; y: number } {
  const a = radians(-frame.rotation);
  const dx = x - (frame.xIndex + frame.width / 2);
  const dy = y - (frame.yIndex + frame.height / 2);
  return {
    x: dx * Math.cos(a) - dy * Math.sin(a) + frame.width / 2,
    y: dx * Math.sin(a) + dy * Math.cos(a) + frame.height / 2,
  };
}

/** Associazione da completare: syncAnchors la calcola dalla posizione dell'elemento. */
export const newAnchor = (frame: number): FrameAnchor => ({ frame, x: 0, y: 0, width: 0, height: 0, rotation: 0 });

/** Posizione relativa al frame dell'elemento nella sua posizione attuale. */
export function anchorTo(frame: FrameElement, el: SlideElement): FrameAnchor {
  const center = toFrameLocal(frame, el.xIndex + el.width / 2, el.yIndex + el.height / 2);
  const width = Math.max(frame.width, 1);
  const height = Math.max(frame.height, 1);
  const anchor: FrameAnchor = {
    frame: frame.id,
    x: center.x / width,
    y: center.y / height,
    width: el.width / width,
    height: el.height / height,
    rotation: el.rotation - frame.rotation,
  };
  const font = fontOf(el);
  if (font !== undefined) anchor.fontSize = font / frameScale(frame);
  return anchor;
}

/** Riporta l'elemento sul frame secondo la sua posizione relativa. */
function placeOnFrame(frame: FrameElement, el: SlideElement, anchor: FrameAnchor): void {
  const a = radians(frame.rotation);
  const ox = (anchor.x - 0.5) * frame.width;
  const oy = (anchor.y - 0.5) * frame.height;
  const cx = frame.xIndex + frame.width / 2 + ox * Math.cos(a) - oy * Math.sin(a);
  const cy = frame.yIndex + frame.height / 2 + ox * Math.sin(a) + oy * Math.cos(a);
  el.width = round(anchor.width * frame.width);
  el.height = round(anchor.height * frame.height);
  el.xIndex = round(cx - el.width / 2);
  el.yIndex = round(cy - el.height / 2);
  el.rotation = round((((frame.rotation + anchor.rotation) % 360) + 360) % 360);
  if (el.type === 'text' && anchor.fontSize !== undefined) el.fontSize = round(anchor.fontSize * frameScale(frame), 3);
}

/** Frame a cui l'elemento è associato, direttamente o attraverso altri frame (dal più vicino). */
export function anchorChain(proper: Proper, el: SlideElement): number[] {
  const chain: number[] = [];
  let current: SlideElement | undefined = el;
  while (current?.anchor && current.anchor.frame !== el.id && !chain.includes(current.anchor.frame)) {
    const frameId: number = current.anchor.frame;
    chain.push(frameId);
    current = proper.frames.find((f) => f.id === frameId);
  }
  return chain;
}

/**
 * Mantiene coerenti gli elementi associati ai frame dopo una modifica da `before` ad `after`:
 * - se l'elemento è stato spostato, ridimensionato o ruotato (o appena associato) si
 *   aggiorna la sua posizione relativa al frame;
 * - se invece è cambiato il frame, l'elemento lo segue;
 * - se il frame non esiste più l'elemento resta dov'è, non più associato.
 */
export function syncAnchors(before: Proper | null, after: Proper): void {
  const previous = new Map(before ? allElements(before).map((el) => [el.id, el]) : []);
  const frames = new Map(after.frames.map((f) => [f.id, f]));

  const anchored = allElements(after).filter((el) => {
    if (!el.anchor) return false;
    const frame = frames.get(el.anchor.frame);
    // associazioni a frame eliminati o circolari
    if (!frame || frame.id === el.id || anchorChain(after, frame).includes(el.id)) {
      delete el.anchor;
      return false;
    }
    return true;
  });
  // prima gli elementi dei frame più esterni, così ognuno segue la posizione definitiva del suo frame
  const depth = new Map(anchored.map((el) => [el.id, anchorChain(after, el).length]));
  anchored.sort((a, b) => depth.get(a.id)! - depth.get(b.id)!);

  for (const el of anchored) {
    const anchor = el.anchor!;
    const frame = frames.get(anchor.frame)!;
    const old = previous.get(el.id);
    const oldFrame = previous.get(frame.id);
    const edited = !old || old.anchor?.frame !== anchor.frame || !sameGeometry(old, el) || fontOf(old) !== fontOf(el);
    if (edited) el.anchor = anchorTo(frame, el);
    else if (oldFrame && !sameGeometry(oldFrame, frame)) placeOnFrame(frame, el, anchor);
  }
  enforceLayering(after);
}

/** Elementi in ordine di livello, dal più basso. */
export const byLayer = (proper: Proper): SlideElement[] => allElements(proper).sort((a, b) => a.zIndex - b.zIndex);

/**
 * Gli elementi associati a un frame stanno sempre sopra di esso: chi si trova sotto al
 * proprio frame viene portato subito sopra, il resto dell'ordine non cambia. I livelli
 * riusano i valori di z-index già presenti.
 */
export function enforceLayering(proper: Proper): void {
  const ordered = byLayer(proper);
  const frameIds = new Set(proper.frames.map((f) => f.id));
  const placed = new Set<number>();
  const pending = [...ordered];
  const result: SlideElement[] = [];
  while (pending.length) {
    // il più basso tra quelli il cui frame è già stato sistemato (in caso di cicli il primo)
    const index = pending.findIndex((el) => !el.anchor || !frameIds.has(el.anchor.frame) || placed.has(el.anchor.frame));
    const [el] = pending.splice(Math.max(index, 0), 1);
    placed.add(el.id);
    result.push(el);
  }
  if (result.every((el, i) => el === ordered[i])) return;
  const levels = ordered.map((el) => el.zIndex);
  result.forEach((el, i) => (el.zIndex = levels[i]));
}

// ---------------------------------------------------------------- rotazione 3D dei frame

export const isTilted = (el: SlideElement): el is FrameElement =>
  el.type === 'frame' && (el.rotateX % 360 !== 0 || el.rotateY % 360 !== 0);

/**
 * Distanza di cui un frame inclinato viene portato verso lo spettatore, in modo che resti
 * tutto davanti al piano della tela (altrimenti metà frame finirebbe dietro lo sfondo).
 */
export function frameLift(frame: FrameElement): number {
  if (!isTilted(frame)) return 0;
  return (
    (frame.height / 2) * Math.abs(Math.sin(radians(frame.rotateX))) +
    (frame.width / 2) * Math.abs(Math.sin(radians(frame.rotateY))) +
    1
  );
}

/** Inclinazione di un frame attorno al suo centro, in coordinate della tela (con lo spostamento verso lo spettatore). */
function tiltMatrix(frame: FrameElement): DOMMatrix {
  const cx = frame.xIndex + frame.width / 2;
  const cy = frame.yIndex + frame.height / 2;
  return new DOMMatrix()
    .translate(cx, cy, frameLift(frame))
    .rotate(frame.rotation)
    .rotateAxisAngle(1, 0, 0, frame.rotateX)
    .rotateAxisAngle(0, 1, 0, frame.rotateY)
    .rotate(-frame.rotation)
    .translate(-cx, -cy);
}

/**
 * Frame inclinati che portano l'elemento fuori dal piano della tela, dal più esterno:
 * quelli a cui è associato e, con `self`, l'elemento stesso se è un frame inclinato.
 */
export function tiltedFrames(proper: Proper, el: SlideElement, self = false): FrameElement[] {
  const chain = anchorChain(proper, el)
    .map((id) => proper.frames.find((f) => f.id === id))
    .filter((f): f is FrameElement => !!f && isTilted(f))
    .reverse();
  return self && isTilted(el) ? [...chain, el] : chain;
}

/**
 * Matrice che porta le coordinate salvate (sul piano della tela) nella posizione 3D in cui
 * l'elemento viene mostrato: l'identità se nessun frame inclinato lo riguarda.
 * Senza `self` è il piano su cui l'elemento si muove, con `self` quello del suo contenuto.
 */
export function planeMatrix(proper: Proper, el: SlideElement, self = false): DOMMatrix {
  return tiltedFrames(proper, el, self).reduce((m, frame) => m.multiply(tiltMatrix(frame)), new DOMMatrix());
}

/** distanza, in pixel della tela, tra due livelli consecutivi sullo stesso piano inclinato */
const LAYER_GAP = 0.5;

/**
 * Trasformazione CSS di un elemento (con transform-origin al centro): la sua rotazione e,
 * se è un frame inclinato o è associato a frame inclinati, la loro rotazione 3D, così gli
 * elementi associati restano sul piano del loro frame.
 * In 3D il browser ordina gli elementi per profondità e ignora lo z-index: chi sta sullo
 * stesso piano inclinato viene staccato di `layer` livelli verso lo spettatore, altrimenti
 * il frame coprirebbe (anche per i clic) gli elementi associati.
 */
export function elementTransform(proper: Proper, el: SlideElement, layer = 0): string {
  if (!tiltedFrames(proper, el, true).length) return `rotate(${el.rotation}deg)`;
  const ox = el.xIndex + el.width / 2;
  const oy = el.yIndex + el.height / 2;
  return new DOMMatrix()
    .translate(-ox, -oy)
    .multiply(planeMatrix(proper, el, true))
    .translate(ox, oy, layer * LAYER_GAP)
    .rotate(el.rotation)
    .toString();
}

/**
 * Livello di ogni elemento sul piano inclinato a cui appartiene (0 per il frame più esterno,
 * poi in ordine di z-index); gli elementi sul piano della tela non compaiono.
 */
export function tiltLayers(proper: Proper): Map<number, number> {
  const layers = new Map<number, number>();
  const counters = new Map<number, number>();
  for (const el of byLayer(proper)) {
    const root = tiltedFrames(proper, el, true)[0];
    if (!root) continue;
    const layer = counters.get(root.id) ?? 0;
    counters.set(root.id, layer + 1);
    layers.set(el.id, layer);
  }
  return layers;
}

// ---------------------------------------------------------------- esportazione / importazione JSON

export const EXPORT_FORMAT = 'premi-presentation';
export const EXPORT_VERSION = 1;

export interface ExportedPresentation {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  presentation: Presentation;
}

export function toExport(presentation: Presentation): ExportedPresentation {
  return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), presentation };
}

/**
 * Legge il contenuto di un file esportato. Accetta anche un documento { meta, proper }
 * senza involucro, come quello salvato su MongoDB.
 */
export function parseExport(text: string): Presentation {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Il file non contiene JSON valido');
  }
  const doc = data as Record<string, any> | null;
  const raw = doc?.['format'] === EXPORT_FORMAT ? doc['presentation'] : doc;
  if (doc?.['format'] === EXPORT_FORMAT && Number(doc['version']) > EXPORT_VERSION)
    throw new Error('Il file è stato esportato da una versione più recente di Premi');
  if (!raw || typeof raw !== 'object' || typeof raw['proper'] !== 'object' || raw['proper'] === null)
    throw new Error('Il file non contiene una presentazione di Premi');
  return normalizePresentation(raw);
}

/** Indirizzi di tutte le immagini usate nella presentazione (elementi, sfondo, sfondi dei frame). */
export function imageUrls(proper: Proper): string[] {
  return [proper.background.image, ...proper.frames.map((f) => f.ref), ...proper.images.map((el) => el.url)].filter(Boolean);
}

/** I file caricati sono salvati come "files/<utente>/<tipo>/<nome>", relativi alla radice del sito. */
export function mediaSrc(url: string): string {
  return url.startsWith('files/') ? '/' + url : url;
}

/** Converte un colore CSS (#hex, rgb, rgba) nel formato #rrggbb richiesto da <input type="color">. */
export function toHexColor(color: string, fallback = '#ffffff'): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(color))
    return ('#' + color.slice(1).replace(/./g, (c) => c + c)).toLowerCase();
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (!rgb) return fallback;
  return '#' + rgb.slice(1, 4).map((c) => Math.min(255, Number(c)).toString(16).padStart(2, '0')).join('');
}
