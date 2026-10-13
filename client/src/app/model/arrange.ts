/*
 * Name : Giovanni Venturelli
 * Package : SlideShowElements
 * Description:
 *   Allineamento e distribuzione degli elementi. Gli elementi si dispongono nel loro
 *   contenitore: il frame a cui sono associati (nel suo sistema di riferimento, anche se
 *   ruotato) o la tela. Per gli elementi ruotati conta il rettangolo che li contiene.
 */
import { FrameElement, Proper, SlideElement, findElement, toFrameLocal } from './presentation';

export type Alignment = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom' | 'center';
export type Axis = 'x' | 'y';

type Geometry = Pick<SlideElement, 'xIndex' | 'yIndex' | 'width' | 'height' | 'rotation'>;

/** Rettangolo nelle coordinate del contenitore. */
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const round = (value: number) => Math.round(value * 100) / 100;
const radians = (deg: number) => (deg * Math.PI) / 180;

/** Contenitore dell'elemento: il frame a cui è associato o, se non lo è, la tela. */
export function containerOf(proper: Proper, el: SlideElement): Geometry {
  const frame: FrameElement | undefined = el.anchor && proper.frames.find((f) => f.id === el.anchor!.frame);
  return frame ?? { xIndex: 0, yIndex: 0, width: proper.background.width, height: proper.background.height, rotation: 0 };
}

/** Id del contenitore: il frame a cui l'elemento è associato o null per la tela. */
export const parentOf = (el: SlideElement): number | null => el.anchor?.frame ?? null;

/** Punto nelle coordinate del contenitore riportato sulla tela (inverso di toFrameLocal). */
function fromLocal(container: Geometry, x: number, y: number): { x: number; y: number } {
  const a = radians(container.rotation);
  const dx = x - container.width / 2;
  const dy = y - container.height / 2;
  return {
    x: container.xIndex + container.width / 2 + dx * Math.cos(a) - dy * Math.sin(a),
    y: container.yIndex + container.height / 2 + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

/** Rettangolo che contiene l'elemento (ruotato rispetto al contenitore), nelle coordinate del contenitore. */
function boxOf(container: Geometry, el: SlideElement): Box {
  const center = toFrameLocal(container, el.xIndex + el.width / 2, el.yIndex + el.height / 2);
  const a = radians(el.rotation - container.rotation);
  const halfW = (el.width * Math.abs(Math.cos(a)) + el.height * Math.abs(Math.sin(a))) / 2;
  const halfH = (el.width * Math.abs(Math.sin(a)) + el.height * Math.abs(Math.cos(a))) / 2;
  return { left: center.x - halfW, top: center.y - halfH, right: center.x + halfW, bottom: center.y + halfH };
}

/** Sposta l'elemento di (dx, dy) nelle coordinate del contenitore. */
function moveBy(container: Geometry, el: SlideElement, dx: number, dy: number): void {
  if (!dx && !dy) return;
  const local = toFrameLocal(container, el.xIndex + el.width / 2, el.yIndex + el.height / 2);
  const center = fromLocal(container, local.x + dx, local.y + dy);
  el.xIndex = round(center.x - el.width / 2);
  el.yIndex = round(center.y - el.height / 2);
}

/** Spostamento che porta il rettangolo `box` nella posizione `alignment` dentro a `target`. */
function offsetFor(box: Box, target: Box, alignment: Alignment): [number, number] {
  const centerX = (target.left + target.right) / 2 - (box.left + box.right) / 2;
  const centerY = (target.top + target.bottom) / 2 - (box.top + box.bottom) / 2;
  switch (alignment) {
    case 'left':
      return [target.left - box.left, 0];
    case 'right':
      return [target.right - box.right, 0];
    case 'center-x':
      return [centerX, 0];
    case 'top':
      return [0, target.top - box.top];
    case 'bottom':
      return [0, target.bottom - box.bottom];
    case 'center-y':
      return [0, centerY];
    case 'center':
      return [centerX, centerY];
  }
}

/** Elementi esistenti tra `ids` che stanno nello stesso contenitore del primo. */
function siblings(proper: Proper, ids: number[]): SlideElement[] {
  const elements = ids.map((id) => findElement(proper, id)).filter((el): el is SlideElement => !!el);
  const parent = elements.length ? parentOf(elements[0]) : null;
  return elements.filter((el) => parentOf(el) === parent);
}

/**
 * Allinea gli elementi: uno solo rispetto al suo contenitore, più elementi tra loro
 * (rispetto al rettangolo che li contiene tutti). Con `toContainer` anche più elementi
 * vengono allineati ognuno al contenitore. Modifica `proper` sul posto.
 */
export function alignElements(proper: Proper, ids: number[], alignment: Alignment, toContainer = ids.length < 2): void {
  const elements = siblings(proper, ids);
  if (!elements.length) return;
  const container = containerOf(proper, elements[0]);
  const boxes = elements.map((el) => boxOf(container, el));
  const target: Box = toContainer
    ? { left: 0, top: 0, right: container.width, bottom: container.height }
    : {
        left: Math.min(...boxes.map((b) => b.left)),
        top: Math.min(...boxes.map((b) => b.top)),
        right: Math.max(...boxes.map((b) => b.right)),
        bottom: Math.max(...boxes.map((b) => b.bottom)),
      };
  elements.forEach((el, i) => moveBy(container, el, ...offsetFor(boxes[i], target, alignment)));
}

// ---------------------------------------------------------------- guide di allineamento

/**
 * Guida di allineamento nelle coordinate del contenitore: con axis 'x' è una linea verticale
 * in x = at da y = from a y = to, con 'y' una linea orizzontale in y = at.
 */
export interface Guide {
  axis: Axis;
  at: number;
  from: number;
  to: number;
}

/** Guide da mostrare nel contenitore `container` (id del frame o null per la tela). */
export interface Guides {
  container: number | null;
  lines: Guide[];
}

/** distanza sotto cui due bordi o centri sono considerati allineati */
const ALIGNED = 0.5;

const lines = (box: Box, axis: Axis): number[] =>
  axis === 'x' ? [box.left, (box.left + box.right) / 2, box.right] : [box.top, (box.top + box.bottom) / 2, box.bottom];

const shift = (box: Box, dx: number, dy: number): Box => ({
  left: box.left + dx,
  right: box.right + dx,
  top: box.top + dy,
  bottom: box.bottom + dy,
});

/**
 * Elementi che si spostano insieme (rettangolo che li contiene tutti) e riferimenti con cui
 * possono allinearsi: gli altri elementi dello stesso contenitore e il contenitore stesso.
 */
function dragLayout(proper: Proper, ids: number[]) {
  const moving = siblings(proper, ids);
  if (!moving.length) return null;
  const parent = parentOf(moving[0]);
  const container = containerOf(proper, moving[0]);
  const boxes = moving.map((el) => boxOf(container, el));
  const box: Box = {
    left: Math.min(...boxes.map((b) => b.left)),
    top: Math.min(...boxes.map((b) => b.top)),
    right: Math.max(...boxes.map((b) => b.right)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
  const others = allElementsIn(proper, parent).filter((el) => !moving.includes(el));
  const targets = [{ left: 0, top: 0, right: container.width, bottom: container.height }, ...others.map((el) => boxOf(container, el))];
  return { parent, container, box, targets };
}

const allElementsIn = (proper: Proper, parent: number | null): SlideElement[] =>
  [...proper.frames, ...proper.texts, ...proper.images, ...proper.videos, ...proper.audios].filter((el) => parentOf(el) === parent);

/** Spostamento della tela (dx, dy) nelle coordinate del contenitore e viceversa (`back`). */
function rotateDelta(container: Geometry, dx: number, dy: number, back = false): [number, number] {
  const a = radians(back ? container.rotation : -container.rotation);
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
}

/**
 * Corregge lo spostamento (dx, dy, sulla tela) degli elementi `ids` in modo che, se un loro
 * bordo o centro dista meno di `threshold` da un bordo o centro di un altro elemento dello
 * stesso contenitore (o del contenitore), vi si allineino esattamente.
 */
export function snapMove(proper: Proper, ids: number[], dx: number, dy: number, threshold: number): [number, number] {
  const layout = dragLayout(proper, ids);
  if (!layout) return [dx, dy];
  const [lx, ly] = rotateDelta(layout.container, dx, dy);
  const moved = shift(layout.box, lx, ly);
  const snap = (axis: Axis): number => {
    let best = threshold;
    let correction = 0;
    for (const target of layout.targets)
      for (const t of lines(target, axis))
        for (const m of lines(moved, axis))
          if (Math.abs(t - m) < Math.abs(best)) {
            best = Math.abs(t - m);
            correction = t - m;
          }
    return correction;
  };
  const [sx, sy] = rotateDelta(layout.container, lx + snap('x'), ly + snap('y'), true);
  return [round(sx), round(sy)];
}

/** Guide degli allineamenti degli elementi `ids` spostati di (dx, dy) sulla tela. */
export function alignmentGuides(proper: Proper, ids: number[], dx: number, dy: number): Guides | null {
  const layout = dragLayout(proper, ids);
  if (!layout) return null;
  const moved = shift(layout.box, ...rotateDelta(layout.container, dx, dy));
  const result: Guide[] = [];
  for (const axis of ['x', 'y'] as const) {
    const cross = (box: Box): [number, number] => (axis === 'x' ? [box.top, box.bottom] : [box.left, box.right]);
    for (const at of lines(moved, axis)) {
      // la guida va dagli elementi spostati fino al più lontano tra quelli allineati
      const aligned = layout.targets.filter((target) => lines(target, axis).some((t) => Math.abs(t - at) < ALIGNED));
      if (!aligned.length) continue;
      const ends = [moved, ...aligned].flatMap(cross);
      result.push({ axis, at, from: Math.min(...ends), to: Math.max(...ends) });
    }
  }
  return result.length ? { container: layout.parent, lines: result } : null;
}

/**
 * Distribuisce gli elementi lungo un asse con spazi uguali tra uno e l'altro: il primo
 * e l'ultimo restano fermi. Servono almeno tre elementi. Modifica `proper` sul posto.
 */
export function distributeElements(proper: Proper, ids: number[], axis: Axis): void {
  const elements = siblings(proper, ids);
  if (elements.length < 3) return;
  const container = containerOf(proper, elements[0]);
  const [start, end] = axis === 'x' ? (['left', 'right'] as const) : (['top', 'bottom'] as const);
  const items = elements
    .map((el) => ({ el, box: boxOf(container, el) }))
    .sort((a, b) => a.box[start] + a.box[end] - (b.box[start] + b.box[end]));
  const size = (box: Box) => box[end] - box[start];
  const first = Math.min(...items.map((item) => item.box[start]));
  const last = Math.max(...items.map((item) => item.box[end]));
  const gap = (last - first - items.reduce((sum, item) => sum + size(item.box), 0)) / (items.length - 1);

  let position = first;
  for (const { el, box } of items) {
    const delta = position - box[start];
    moveBy(container, el, axis === 'x' ? delta : 0, axis === 'y' ? delta : 0);
    position += size(box) + gap;
  }
}
