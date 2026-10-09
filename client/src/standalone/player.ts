/*
 * Player autonomo delle presentazioni esportate in HTML: JavaScript senza dipendenze,
 * compilato da scripts/build-standalone.mjs e incorporato nel file esportato insieme a
 * player.css e ai dati della presentazione (media compresi, in base64).
 * Riusa il modello e la telecamera dell'app, così la presentazione si comporta come nel
 * player di Premi: percorso principale, bookmark, sottopercorsi, frame ruotati e in 3D.
 */
import { ICONS, svg } from '../app/core/icon-shapes';
import {
  BASE_FONT_SIZE,
  FrameElement,
  SlideElement,
  SubPath,
  elementTransform,
  normalizePresentation,
  tiltLayers,
} from '../app/model/presentation';
import { Camera, CameraMotion, Size, cameraFor, focusCamera } from '../app/shared/camera';

/** Dati incorporati nel file HTML (vedi standalone-export.ts). */
export interface StandaloneData {
  presentation: unknown;
  /** immagine degli elementi audio */
  audioIcon?: string;
}

const data = JSON.parse(document.getElementById('premi-data')!.textContent!) as StandaloneData;
const { meta, proper } = normalizePresentation(data.presentation);

// ---------------------------------------------------------------- utilità DOM

function h<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', attrs: Record<string, string> = {}): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

const icon = (name: string) => svg(ICONS[name] ?? '').replace('<svg ', '<svg class="icon" aria-hidden="true" ');
const cssUrl = (url: string) => (url ? `url("${url.replace(/"/g, '\\"')}")` : '');

// ---------------------------------------------------------------- tela

const stage = h('div', 'stage');
const canvas = h('div', 'canvas');
const scene = h('div', 'scene');
Object.assign(scene.style, {
  width: proper.background.width + 'px',
  height: proper.background.height + 'px',
  fontSize: BASE_FONT_SIZE + 'px',
  backgroundColor: proper.background.color,
  backgroundImage: cssUrl(proper.background.image),
});

/**
 * I file WebM registrati con MediaRecorder non dichiarano la durata e la barra di
 * avanzamento non funziona: cercando oltre la fine il browser calcola la durata reale.
 */
function fixDuration(media: HTMLMediaElement): void {
  media.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(media.duration)) return;
    const restore = () => {
      if (!Number.isFinite(media.duration)) return;
      media.removeEventListener('durationchange', restore);
      media.currentTime = 0;
    };
    media.addEventListener('durationchange', restore);
    media.currentTime = Number.MAX_SAFE_INTEGER;
  });
}

function renderElement(el: SlideElement, layer: number | undefined): HTMLElement {
  const node = h('div', `element element-${el.type}`);
  node.dataset['elementId'] = String(el.id);
  Object.assign(node.style, {
    left: el.xIndex + 'px',
    top: el.yIndex + 'px',
    width: el.width + 'px',
    height: el.height + 'px',
    zIndex: String(el.zIndex),
    transform: elementTransform(proper, el, layer),
  });
  switch (el.type) {
    case 'frame':
      node.style.backgroundColor = el.color;
      node.style.backgroundImage = cssUrl(el.ref);
      node.style.backgroundSize = el.fit === 'fill' ? '100% 100%' : el.fit;
      break;
    case 'text': {
      const text = h('p', 'text-content');
      Object.assign(text.style, { color: el.color, fontFamily: el.font, fontSize: el.fontSize + 'em' });
      text.textContent = el.content;
      node.append(text);
      break;
    }
    case 'image':
      node.append(h('img', '', { src: el.url, alt: '', draggable: 'false' }));
      break;
    case 'video':
    case 'audio': {
      const media = h(el.type, '', { src: el.url, controls: '', preload: 'metadata' });
      fixDuration(media);
      if (el.type === 'audio' && data.audioIcon) node.style.backgroundImage = cssUrl(data.audioIcon);
      node.append(media);
      break;
    }
  }
  return node;
}

const layers = tiltLayers(proper);
// i frame vengono prima nel DOM, così a parità di z-index restano sotto agli altri elementi
for (const el of [...proper.frames, ...proper.texts, ...proper.images, ...proper.videos, ...proper.audios])
  scene.append(renderElement(el, layers.get(el.id)));
canvas.append(scene);
stage.append(canvas);

// ---------------------------------------------------------------- percorsi

const framesOf = (ids: number[]) =>
  ids.map((id) => proper.frames.find((frame) => frame.id === id)).filter((frame): frame is FrameElement => !!frame);

const mainFrames = framesOf(proper.paths.main);

/** sottopercorsi utilizzabili, per frame di partenza */
const subPaths = new Map<number, { path: SubPath; frames: FrameElement[] }[]>();
for (const path of proper.paths.choices) {
  const frames = framesOf(path.choicePath);
  if (path.trigger === null || !frames.length || !proper.paths.main.includes(path.frame)) continue;
  subPaths.set(path.frame, [...(subPaths.get(path.frame) ?? []), { path, frames }]);
}

/** passo del percorso principale: 0 è la vista d'insieme */
let step = 0;
/** sottopercorso in corso */
let sub: { path: SubPath; frames: FrameElement[]; index: number } | null = null;
/** frame inquadrato fuori dal percorso (cliccandolo) */
let extraFrame: FrameElement | null = null;

const mainFrame = () => (sub || extraFrame ? null : (mainFrames[step - 1] ?? null));

// ---------------------------------------------------------------- telecamera

const viewport = (): Size => ({ width: window.innerWidth, height: window.innerHeight });
const motion = new CameraMotion({ min: 900, max: 2200, perUnit: 650 }, (transform, zoom) => {
  canvas.style.transform = transform;
  scene.style.setProperty('zoom', String(zoom));
});

function camera(): Camera {
  const frame = extraFrame ?? (sub ? sub.frames[sub.index] : mainFrames[step - 1]);
  // un frame inclinato viene raddrizzato: la telecamera ne segue la rotazione 3D
  return frame
    ? focusCamera(viewport(), proper, frame)
    : cameraFor(viewport(), { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background });
}

// ---------------------------------------------------------------- interfaccia

const menu = h('nav', 'player-menu');
const menuButton = h('button', 'glass round', { 'aria-expanded': 'false' });
const panel = h('div', 'glass panel');
const panelHead = h('div', 'panel-head');
const panelTitle = h('span', 'panel-title');
panelTitle.textContent = meta.titolo;
panelHead.append(panelTitle);
const steps = h('div', 'steps');
const keys = h('p', 'keys');
keys.innerHTML =
  '<kbd>←</kbd><kbd>→</kbd> naviga · <kbd>Spazio</kbd> bookmark · <kbd>⌫</kbd> esci dal sottopercorso · ' +
  '<kbd>F</kbd> schermo intero · <kbd>Esc</kbd> menu';
panel.append(panelHead, steps, keys);
menu.append(menuButton, panel);

const controls = h('div', 'controls glass');
const prevButton = h('button', 'round', { 'aria-label': 'Precedente' });
prevButton.innerHTML = icon('chevron-left');
const counter = h('span', 'counter');
const nextButton = h('button', 'round', { 'aria-label': 'Successivo' });
nextButton.innerHTML = icon('chevron-right');
const fullscreenButton = h('button', 'round', { 'aria-label': 'Schermo intero' });
fullscreenButton.innerHTML = icon('maximize');
controls.append(prevButton, counter, nextButton);
// su iPhone le pagine non possono andare a schermo intero
if ('requestFullscreen' in document.documentElement) controls.append(fullscreenButton);

const progress = h('div', 'progress', { 'aria-hidden': 'true' });
const progressBar = h('span');
progress.append(progressBar);

document.body.append(stage, menu, controls, progress);

function stepButton(label: string, num: string, active: boolean, onClick: () => void, extra = ''): HTMLButtonElement {
  const button = h('button', 'step-item' + (active ? ' active' : '') + extra);
  const badge = h('span', 'num');
  badge.innerHTML = num;
  const text = h('span');
  text.textContent = label;
  button.append(badge, text);
  button.addEventListener('click', onClick);
  return button;
}

function renderMenu(): void {
  const open = menu.classList.contains('open');
  menuButton.innerHTML = icon(open ? 'close' : 'menu');
  menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  menuButton.setAttribute('aria-expanded', String(open));
  if (!open) return;
  steps.replaceChildren(stepButton("Vista d'insieme", icon('grid'), step === 0 && !sub, () => goto(0)));
  mainFrames.forEach((frame, i) => {
    const button = stepButton(`Frame ${frame.id}`, String(i + 1), step === i + 1 && !sub, () => goto(i + 1));
    if (frame.bookmark) button.insertAdjacentHTML('beforeend', icon('bookmark-filled').replace('class="icon"', 'class="icon bookmark"'));
    steps.append(button);
    for (const s of subPaths.get(frame.id) ?? [])
      steps.append(stepButton(`Sottopercorso · ${s.frames.length} frame`, icon('route'), sub?.path.id === s.path.id, () => startSub(frame.id, s.path.id), ' sub-item'));
  });
}

/** Aggiorna telecamera, contatore, avanzamento ed elementi cliccabili dopo ogni cambio di passo. */
function update(animate = true): void {
  motion.moveTo(viewport(), camera(), animate);

  if (sub) counter.innerHTML = `${icon('route')}${sub.index + 1} <span class="of">/ ${sub.frames.length}</span>`;
  else if (step === 0) counter.textContent = 'Panoramica';
  else counter.innerHTML = `${step} <span class="of">/ ${mainFrames.length}</span>`;
  progressBar.style.width = mainFrames.length ? (step / mainFrames.length) * 100 + '%' : '0';

  const frame = mainFrame();
  const triggers = new Set(frame ? (subPaths.get(frame.id) ?? []).map((s) => s.path.trigger) : []);
  for (const node of scene.querySelectorAll<HTMLElement>('.element'))
    node.classList.toggle('trigger', triggers.has(Number(node.dataset['elementId'])));
  renderMenu();
}

// ---------------------------------------------------------------- navigazione

function goto(target: number): void {
  const count = mainFrames.length + 1;
  extraFrame = null;
  sub = null;
  step = ((target % count) + count) % count;
  menu.classList.remove('open');
  update();
}

function startSub(frameId: number, pathId: number): void {
  const index = mainFrames.findIndex((frame) => frame.id === frameId);
  const found = subPaths.get(frameId)?.find((s) => s.path.id === pathId);
  if (index === -1 || !found) return;
  extraFrame = null;
  step = index + 1;
  sub = { ...found, index: 0 };
  menu.classList.remove('open');
  update();
}

/** Avanti e indietro nel sottopercorso: oltre la fine (o prima dell'inizio) si torna al frame di partenza. */
function moveInSub(delta: 1 | -1): boolean {
  if (!sub) return false;
  extraFrame = null;
  const index = sub.index + delta;
  sub = index >= 0 && index < sub.frames.length ? { ...sub, index } : null;
  update();
  return true;
}

function next(): void {
  if (extraFrame) {
    extraFrame = null;
    update();
  } else if (!moveInSub(1)) goto(step + 1);
}

function prev(): void {
  if (extraFrame) {
    extraFrame = null;
    update();
  } else if (!moveInSub(-1)) goto(step - 1);
}

/** Salta al frame con bookmark successivo a quello corrente. */
function nextBookmark(): void {
  const index = mainFrames.findIndex((frame, i) => i + 1 > step && frame.bookmark);
  if (index !== -1) goto(index + 1);
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => undefined);
}

stage.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  // clic su un elemento che avvia un sottopercorso del frame inquadrato
  const clicked = Number(target.closest<HTMLElement>('.element.trigger')?.dataset['elementId']);
  const current = mainFrame();
  const trigger = current && subPaths.get(current.id)?.find((s) => s.path.trigger === clicked);
  if (current && trigger) {
    startSub(current.id, trigger.path.id);
    return;
  }

  const id = Number(target.closest<HTMLElement>('.element-frame')?.dataset['elementId']);
  if (!id) return;
  const subIndex = sub?.frames.findIndex((frame) => frame.id === id) ?? -1;
  if (sub && subIndex !== -1) {
    extraFrame = null;
    sub = { ...sub, index: subIndex };
    update();
    return;
  }
  const index = mainFrames.findIndex((frame) => frame.id === id);
  if (index !== -1) {
    goto(index + 1);
    return;
  }
  const frame = proper.frames.find((f) => f.id === id);
  if (frame) {
    extraFrame = frame;
    update();
  }
});

stage.addEventListener(
  'touchstart',
  (event) => {
    if (event.touches.length !== 1 || (event.target as HTMLElement).closest('audio, video, .element.trigger')) return;
    const x = event.touches[0].clientX;
    const edge = window.innerWidth * 0.3;
    if (x < edge) prev();
    else if (x > window.innerWidth - edge) next();
  },
  { passive: true },
);

menuButton.addEventListener('click', () => {
  menu.classList.toggle('open');
  renderMenu();
});
prevButton.addEventListener('click', prev);
nextButton.addEventListener('click', next);
fullscreenButton.addEventListener('click', toggleFullscreen);

const NAVIGATION_KEYS = new Set(['Tab', ' ', 'PageUp', 'PageDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
const isMedia = (target: EventTarget | null) => target instanceof HTMLMediaElement;

document.addEventListener('keydown', (event) => {
  if (NAVIGATION_KEYS.has(event.key) && !isMedia(event.target)) event.preventDefault();
});

document.addEventListener('keyup', (event) => {
  if (isMedia(event.target)) return;
  switch (event.key) {
    case 'PageUp':
    case 'ArrowLeft':
    case 'ArrowUp':
      prev();
      break;
    case 'Tab':
    case 'PageDown':
    case 'ArrowRight':
    case 'ArrowDown':
      next();
      break;
    case ' ':
      nextBookmark();
      break;
    case 'Backspace':
      extraFrame = null;
      sub = null;
      update();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    case 'Escape':
      menu.classList.toggle('open');
      renderMenu();
      break;
  }
});

// al ridimensionamento della finestra la telecamera salta alla nuova inquadratura
window.addEventListener('resize', () => update(false));

update(false);
