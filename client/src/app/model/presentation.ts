/*
 * Name : Giovanni Venturelli
 * Package : SlideShowElements
 * Description:
 *   Tipi degli elementi che compongono una presentazione e funzioni per crearli.
 *   Il formato è lo stesso salvato su MongoDB dalla versione precedente di Premi.
 */

export type ElementType = 'text' | 'frame' | 'image' | 'audio' | 'video' | 'SVG';
export type MediaType = 'image' | 'audio' | 'video';

interface BaseElement {
  id: number;
  xIndex: number;
  yIndex: number;
  rotation: number;
  zIndex: number;
  height: number;
  width: number;
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

export interface FrameElement extends BaseElement {
  type: 'frame';
  bookmark: number;
  ref: string;
  color: string;
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

export interface Paths {
  main: number[];
  choices: unknown[];
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

function normalizeBase(raw: Record<string, unknown>): BaseElement {
  return {
    id: num(raw['id']),
    xIndex: num(raw['xIndex']),
    yIndex: num(raw['yIndex']),
    rotation: num(raw['rotation']),
    zIndex: num(raw['zIndex']),
    height: num(raw['height']),
    width: num(raw['width']),
  };
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
        choices: array(paths['choices']),
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
