/*
 * Modelli tra cui scegliere creando una presentazione: una guida iniziale (facoltativa) con
 * frame già disposti, percorso e testi segnaposto da sostituire.
 * Ogni modello viene costruito da codice: i testi sono associati ai loro frame con le stesse
 * funzioni dell'editor, poi i frame vengono ruotati e i testi li seguono.
 */
import {
  CANVAS_RATIO,
  FrameElement,
  Proper,
  TextElement,
  newAnchor,
  nextElementId,
  nextZIndex,
  normalizePresentation,
  syncAnchors,
} from '../model/presentation';

export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  build(): Proper;
}

const WIDTH = 4000;
const HEIGHT = Math.round(WIDTH / CANVAS_RATIO);

const TITLE_FONT = "Georgia, serif";
const BODY_FONT = "'Trebuchet MS', Helvetica, sans-serif";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Testo posizionato rispetto all'angolo del suo frame (prima delle rotazioni). */
interface TextSpec extends Box {
  content: string;
  size: number;
  color: string;
  font?: string;
}

/** Aiuta a comporre un modello: frame, testi associati, percorso e sottopercorsi. */
class TemplateBuilder {
  readonly proper: Proper;
  /** rotazioni da applicare a costruzione finita, così i testi associati seguono il frame */
  private readonly turns = new Map<number, Pick<FrameElement, 'rotation' | 'rotateX' | 'rotateY'>>();

  constructor(background: string, image = '') {
    this.proper = normalizePresentation({
      proper: { background: { id: 0, color: background, image, width: WIDTH, height: HEIGHT } },
    }).proper;
  }

  frame(box: Box, color: string, turn: Partial<Pick<FrameElement, 'rotation' | 'rotateX' | 'rotateY'>> = {}): number {
    const id = nextElementId(this.proper);
    this.proper.frames.push({
      id,
      type: 'frame',
      xIndex: box.x,
      yIndex: box.y,
      width: box.width,
      height: box.height,
      rotation: 0,
      zIndex: nextZIndex(this.proper),
      bookmark: 0,
      ref: '',
      color,
      fit: 'cover',
      rotateX: 0,
      rotateY: 0,
    });
    this.turns.set(id, { rotation: turn.rotation ?? 0, rotateX: turn.rotateX ?? 0, rotateY: turn.rotateY ?? 0 });
    return id;
  }

  /** Frame dentro un altro frame, in coordinate relative al frame che lo contiene. */
  detail(parent: number, box: Box, color: string): number {
    const p = this.get(parent);
    const id = this.frame({ ...box, x: p.xIndex + box.x, y: p.yIndex + box.y }, color);
    this.get(id).anchor = newAnchor(parent);
    return id;
  }

  text(frameId: number, spec: TextSpec): number {
    const frame = this.get(frameId);
    const id = nextElementId(this.proper);
    const text: TextElement = {
      id,
      type: 'text',
      xIndex: frame.xIndex + spec.x,
      yIndex: frame.yIndex + spec.y,
      width: spec.width,
      height: spec.height,
      rotation: 0,
      zIndex: nextZIndex(this.proper),
      content: spec.content,
      font: spec.font ?? BODY_FONT,
      fontSize: spec.size,
      color: spec.color,
      anchor: newAnchor(frameId),
    };
    this.proper.texts.push(text);
    return id;
  }

  path(ids: number[], bookmarks: number[] = []): void {
    this.proper.paths.main = ids;
    for (const id of bookmarks) this.get(id).bookmark = 1;
  }

  subPath(from: number, trigger: number, frames: number[]): void {
    this.proper.paths.choices.push({ id: this.proper.paths.choices.length + 1, frame: from, trigger, choicePath: frames });
  }

  build(): Proper {
    // posizioni relative ai frame e livelli, poi le rotazioni (gli elementi associati seguono)
    syncAnchors(null, this.proper);
    const before = structuredClone(this.proper);
    for (const [id, turn] of this.turns) Object.assign(this.get(id), turn);
    syncAnchors(before, this.proper);
    return this.proper;
  }

  private get(id: number): FrameElement {
    return this.proper.frames.find((f) => f.id === id)!;
  }
}

/** Sfondo SVG in data URL: sfumatura radiale con un leggero motivo a punti. */
function backdrop(from: string, to: string, dots: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">` +
    `<defs><radialGradient id="g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></radialGradient>` +
    `<pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx="40" cy="40" r="2.5" fill="${dots}"/></pattern></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

const CARD = 'rgba(255, 255, 255, 0.07)';

// ---------------------------------------------------------------- Classica

function classic(): Proper {
  const b = new TemplateBuilder('#0f172a', backdrop('#1e293b', '#0b1120', 'rgba(148,163,184,0.12)'));
  const accent = '#38bdf8';

  const title = b.frame({ x: 1300, y: 90, width: 1400, height: 788 }, CARD);
  b.text(title, { x: 100, y: 230, width: 1200, height: 150, content: 'Titolo della presentazione', size: 6.2, color: '#f8fafc', font: TITLE_FONT });
  b.text(title, { x: 100, y: 400, width: 1200, height: 70, content: 'Un sottotitolo che riassume il messaggio in una riga', size: 3, color: accent });
  b.text(title, { x: 100, y: 620, width: 1200, height: 56, content: 'Nome Cognome · data', size: 2.2, color: '#94a3b8' });

  const chapters = ['Introduzione', 'Primo punto', 'Secondo punto', 'Conclusioni'].map((name, i) => {
    const frame = b.frame({ x: 120 + i * 960, y: 1040, width: 880, height: 495 }, CARD);
    b.text(frame, { x: 60, y: 45, width: 400, height: 60, content: `${String(i + 1).padStart(2, '0')}`, size: 2.6, color: accent });
    b.text(frame, { x: 60, y: 110, width: 760, height: 90, content: name, size: 4.4, color: '#f8fafc', font: TITLE_FONT });
    b.text(frame, {
      x: 60,
      y: 230,
      width: 760,
      height: 200,
      content:
        i === 3
          ? 'Riprendi le idee principali e chiudi con un messaggio da ricordare.'
          : 'Scrivi qui il contenuto del capitolo: poche frasi chiare, un concetto per frame.',
      size: 2.3,
      color: '#cbd5e1',
    });
    return frame;
  });

  b.path([title, ...chapters], [title, chapters[3]]);
  return b.build();
}

// ---------------------------------------------------------------- Mappa concettuale

function mindMap(): Proper {
  const b = new TemplateBuilder('#140b26', backdrop('#2e1065', '#0c0618', 'rgba(216,180,254,0.12)'));
  const colors = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa'];

  const center = b.frame({ x: 1500, y: 690, width: 1000, height: 562 }, 'rgba(168, 85, 247, 0.22)');
  b.text(center, { x: 70, y: 150, width: 860, height: 140, content: 'Tema centrale', size: 7, color: '#faf5ff', font: TITLE_FONT });
  b.text(center, { x: 70, y: 320, width: 860, height: 110, content: "L'argomento attorno a cui ruotano tutte le idee", size: 2.6, color: '#e9d5ff' });

  const ideas = colors.map((color, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / colors.length;
    const cx = 2000 + Math.cos(angle) * 1450;
    const cy = 971 + Math.sin(angle) * 640;
    const frame = b.frame({ x: Math.round(cx - 330), y: Math.round(cy - 186), width: 660, height: 371 }, CARD, {
      rotation: Math.round(Math.cos(angle) * 6),
    });
    b.text(frame, { x: 50, y: 45, width: 560, height: 90, content: `Idea ${i + 1}`, size: 4.2, color, font: TITLE_FONT });
    b.text(frame, { x: 50, y: 150, width: 560, height: 170, content: "Un aspetto del tema: spiegalo in breve, con un esempio.", size: 2.2, color: '#ede9fe' });
    return frame;
  });

  b.path([center, ...ideas], [center]);
  return b.build();
}

// ---------------------------------------------------------------- Con approfondimenti

function deepDive(): Proper {
  const b = new TemplateBuilder('#062a24', backdrop('#065f46', '#021411', 'rgba(167,243,208,0.1)'));
  const accent = '#34d399';
  const detailColor = 'rgba(16, 185, 129, 0.18)';

  const title = b.frame({ x: 1300, y: 80, width: 1400, height: 788 }, CARD);
  b.text(title, { x: 100, y: 200, width: 1200, height: 150, content: 'Titolo della presentazione', size: 6.2, color: '#ecfdf5', font: TITLE_FONT });
  b.text(title, {
    x: 100,
    y: 380,
    width: 1200,
    height: 160,
    content: 'Ogni capitolo ha degli approfondimenti facoltativi: in presentazione si aprono con un clic sul testo 🔍 e alla fine si torna al capitolo.',
    size: 2.6,
    color: '#a7f3d0',
  });

  const chapters = [1, 2, 3].map((n, i) => {
    const frame = b.frame({ x: 100 + i * 1325, y: 1000, width: 1150, height: 647 }, CARD);
    b.text(frame, { x: 60, y: 50, width: 1000, height: 100, content: `Capitolo ${n}`, size: 5, color: '#ecfdf5', font: TITLE_FONT });
    b.text(frame, { x: 60, y: 160, width: 620, height: 260, content: 'Il messaggio principale del capitolo, da seguire nel percorso.', size: 2.4, color: '#d1fae5' });
    const trigger = b.text(frame, { x: 60, y: 520, width: 560, height: 60, content: '🔍 Approfondisci', size: 2.6, color: accent });
    const details = ['A', 'B'].map((letter, j) => {
      const detail = b.detail(frame, { x: 720, y: 190 + j * 220, width: 360, height: 202 }, detailColor);
      b.text(detail, { x: 20, y: 20, width: 320, height: 40, content: `Dettaglio ${n}${letter}`, size: 1.5, color: accent, font: TITLE_FONT });
      b.text(detail, { x: 20, y: 70, width: 320, height: 110, content: 'Un approfondimento per chi vuole saperne di più.', size: 0.95, color: '#d1fae5' });
      return detail;
    });
    b.subPath(frame, trigger, details);
    return frame;
  });

  b.path([title, ...chapters], [title]);
  return b.build();
}

// ---------------------------------------------------------------- Timeline 3D

function timeline(): Proper {
  const b = new TemplateBuilder('#1c0f0a', backdrop('#431407', '#0f0705', 'rgba(253,186,116,0.1)'));
  const accent = '#fb923c';

  const title = b.frame({ x: 1300, y: 40, width: 1400, height: 340 }, CARD);
  b.text(title, { x: 80, y: 50, width: 1240, height: 140, content: 'La nostra storia', size: 7, color: '#fff7ed', font: TITLE_FONT });
  b.text(title, { x: 80, y: 205, width: 1240, height: 66, content: 'Le tappe principali, una dopo l\'altra', size: 2.8, color: '#fed7aa' });

  const steps = [0, 1, 2, 3, 4].map((i) => {
    const up = i % 2 === 0;
    const frame = b.frame({ x: 150 + i * 760, y: up ? 470 : 1250, width: 700, height: 394 }, CARD, {
      rotateY: up ? 18 : -18,
      rotateX: up ? -6 : 6,
    });
    b.text(frame, { x: 50, y: 35, width: 600, height: 125, content: String(2020 + i), size: 6.5, color: accent, font: TITLE_FONT });
    b.text(frame, { x: 50, y: 165, width: 600, height: 66, content: `Tappa ${i + 1}`, size: 3, color: '#fff7ed' });
    b.text(frame, { x: 50, y: 240, width: 600, height: 120, content: 'Cosa è successo e perché è stato importante.', size: 2.1, color: '#fed7aa' });
    return frame;
  });

  b.path([title, ...steps], [title]);
  return b.build();
}

export const TEMPLATES: PresentationTemplate[] = [
  { id: 'classic', name: 'Classica', description: 'Titolo e capitoli in sequenza: il punto di partenza più semplice.', build: classic },
  { id: 'mind-map', name: 'Mappa concettuale', description: 'Un tema al centro e le idee tutto attorno.', build: mindMap },
  {
    id: 'deep-dive',
    name: 'Con approfondimenti',
    description: 'Capitoli con dettagli facoltativi che si aprono con un clic (sottopercorsi).',
    build: deepDive,
  },
  { id: 'timeline', name: 'Timeline 3D', description: 'Tappe nel tempo su frame inclinati in 3D.', build: timeline },
];
