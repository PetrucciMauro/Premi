/*
 * Name : Giovanni Venturelli
 * Package : SlideShowElements
 * Description:
 *   Transizioni tra i frame dei percorsi: ogni coppia di frame consecutivi di un percorso ha
 *   la sua transizione, che dice come la telecamera va dal frame di partenza a quello d'arrivo
 *   (tornando indietro la stessa, al contrario). Le transizioni seguono i percorsi: quando un
 *   frame viene spostato, aggiunto o tolto, quelle dei collegamenti che non esistono più
 *   vengono eliminate e per i nuovi collegamenti ne nascono di predefinite (vedi syncTransitions).
 */

/**
 * - fly: volo, la telecamera si allontana e si riavvicina (lo spostamento classico di Premi);
 * - direct: va dritta verso il frame, senza allontanarsi;
 * - fade: la vista sfuma verso un colore e riappare sul frame;
 * - cut: stacco, il frame compare subito.
 */
export type TransitionKind = 'fly' | 'direct' | 'fade' | 'cut';
export const TRANSITION_KINDS: TransitionKind[] = ['fly', 'direct', 'fade', 'cut'];

export type TransitionEasing = 'smooth' | 'linear' | 'ease-in' | 'ease-out' | 'back' | 'elastic' | 'bounce';
export const TRANSITION_EASINGS: TransitionEasing[] = ['smooth', 'linear', 'ease-in', 'ease-out', 'back', 'elastic', 'bounce'];

/** asse dei giri in più: z ruota sullo schermo, x e y capovolgono la vista */
export type SpinAxis = 'z' | 'x' | 'y';
export const SPIN_AXES: SpinAxis[] = ['z', 'x', 'y'];

export interface Transition {
  kind: TransitionKind;
  /** durata in secondi; null = automatica, in base alla distanza da percorrere */
  duration: number | null;
  easing: TransitionEasing;
  /** quanto si allontana la telecamera a metà volo: 1 normale, 0 quasi niente, fino a 3 (solo volo) */
  arc: number;
  /** giri completi in più durante il movimento; negativi nel verso opposto */
  spins: number;
  spinAxis: SpinAxis;
  /** attesa prima di partire, in secondi */
  delay: number;
  /** colore attraverso cui sfuma la dissolvenza */
  fadeColor: string;
  /** partenza automatica, in secondi dall'arrivo sul frame di partenza; null = si avanza a mano */
  advance: number | null;
}

/** Transizione tra due frame consecutivi di un percorso. */
export interface PathTransition extends Transition {
  /** frame di partenza */
  from: number;
  /** frame d'arrivo */
  to: number;
}

export const DEFAULT_TRANSITION: Transition = {
  kind: 'fly',
  duration: null,
  easing: 'smooth',
  arc: 1,
  spins: 0,
  spinAxis: 'z',
  delay: 0,
  fadeColor: '#000000',
  advance: null,
};

export const TRANSITION_LIMITS = {
  duration: { min: 0.2, max: 8 },
  arc: { min: 0, max: 3 },
  spins: { min: -3, max: 3 },
  delay: { min: 0, max: 10 },
  advance: { min: 0.5, max: 60 },
} as const;

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, value));
const finite = (value: unknown): number | null => (value === null || value === undefined || value === '' ? null : Number.isFinite(Number(value)) ? Number(value) : null);
const oneOf = <T extends string>(value: unknown, allowed: T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);

/** Transizione valida da un valore qualsiasi (letto dal server o da un file); undefined se assente. */
export function normalizeTransition(value: unknown): Transition | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const d = DEFAULT_TRANSITION;
  const duration = finite(raw['duration']);
  const advance = finite(raw['advance']);
  return {
    kind: oneOf(raw['kind'], TRANSITION_KINDS, d.kind),
    duration: duration === null ? null : clamp(duration, TRANSITION_LIMITS.duration),
    easing: oneOf(raw['easing'], TRANSITION_EASINGS, d.easing),
    arc: clamp(finite(raw['arc']) ?? d.arc, TRANSITION_LIMITS.arc),
    // solo giri interi: con mezzo giro la telecamera arriverebbe capovolta e poi scatterebbe
    spins: Math.round(clamp(finite(raw['spins']) ?? d.spins, TRANSITION_LIMITS.spins)),
    spinAxis: oneOf(raw['spinAxis'], SPIN_AXES, d.spinAxis),
    delay: clamp(finite(raw['delay']) ?? d.delay, TRANSITION_LIMITS.delay),
    fadeColor: typeof raw['fadeColor'] === 'string' && raw['fadeColor'] ? raw['fadeColor'] : d.fadeColor,
    advance: advance === null ? null : clamp(advance, TRANSITION_LIMITS.advance),
  };
}

// ---------------------------------------------------------------- transizioni dei percorsi

/** Quanto serve dei percorsi (vedi Paths in presentation.ts). */
interface PathsShape {
  main: number[];
  choices: { id: number; frame: number; choicePath: number[] }[];
  transitions?: PathTransition[];
}

/** Proprietà della transizione, senza i frame che collega. */
export function transitionProps({ from: _from, to: _to, ...props }: PathTransition): Transition {
  return props;
}

export const sameTransition = (a: Transition, b: Transition) =>
  (Object.keys(DEFAULT_TRANSITION) as (keyof Transition)[]).every((key) => a[key] === b[key]);

interface PathLink {
  /** percorso del collegamento: 'main' o l'id del sottopercorso */
  path: 'main' | number;
  from: number;
  to: number;
}

/**
 * Collegamenti tra frame consecutivi, in ordine: quelli del percorso principale e quelli di
 * ogni sottopercorso, compresi l'ingresso (dal frame di partenza al primo frame) e il
 * ritorno (dall'ultimo al frame di partenza). Ogni collegamento compare una volta sola.
 */
export function pathLinks(paths: PathsShape): PathLink[] {
  const links: PathLink[] = [];
  const seen = new Set<string>();
  const add = (path: PathLink['path'], sequence: number[]) => {
    for (let i = 1; i < sequence.length; i++) {
      const [from, to] = [sequence[i - 1], sequence[i]];
      const key = `${from}>${to}`;
      if (from === to || seen.has(key)) continue;
      seen.add(key);
      links.push({ path, from, to });
    }
  };
  add('main', paths.main);
  for (const sub of paths.choices) if (sub.choicePath.length) add(sub.id, [sub.frame, ...sub.choicePath, sub.frame]);
  return links;
}

/** Transizione del collegamento dal frame `from` al frame `to`, se esiste. */
export const findLink = (transitions: PathTransition[], from: number | undefined, to: number | undefined) =>
  transitions.find((t) => t.from === from && t.to === to);

/**
 * Una transizione per ogni collegamento dei percorsi: restano quelle dei collegamenti che
 * esistono ancora, nello stesso percorso; quelle dei collegamenti spezzati (un frame spostato,
 * aggiunto o tolto) spariscono e i nuovi collegamenti ricevono la transizione predefinita.
 * `previous` sono i percorsi prima della modifica: senza, conta solo la coppia di frame.
 */
export function syncTransitions(paths: PathsShape, previous?: PathsShape): void {
  const existing = paths.transitions ?? [];
  const before = previous && new Set(pathLinks(previous).map((l) => `${l.path}:${l.from}>${l.to}`));
  paths.transitions = pathLinks(paths).map(({ path, from, to }) => {
    const kept = !before || before.has(`${path}:${from}>${to}`) ? findLink(existing, from, to) : undefined;
    return kept ?? { ...DEFAULT_TRANSITION, from, to };
  });
}

/**
 * Transizioni valide lette dal server o da un file. Le presentazioni salvate prima delle
 * transizioni tra frame avevano una transizione per frame (come arrivarci): diventa quella
 * dei collegamenti che arrivano sul frame, con la partenza automatica del frame da cui si parte.
 */
export function normalizeTransitions(paths: PathsShape, value: unknown, frameTransitions: Map<number, unknown>): PathTransition[] {
  const saved = Array.isArray(value)
    ? value.flatMap((raw) => {
        const transition = normalizeTransition(raw);
        const from = Number(raw?.from);
        const to = Number(raw?.to);
        return transition && Number.isFinite(from) && Number.isFinite(to) ? [{ ...transition, from, to }] : [];
      })
    : null;
  const legacy = (from: number, to: number): PathTransition => ({
    ...(normalizeTransition(frameTransitions.get(to)) ?? DEFAULT_TRANSITION),
    advance: normalizeTransition(frameTransitions.get(from))?.advance ?? null,
    from,
    to,
  });
  const synced = { ...paths, transitions: saved ?? pathLinks(paths).map(({ from, to }) => legacy(from, to)) };
  syncTransitions(synced);
  return synced.transitions!;
}

/**
 * Transizione per andare dal frame `from` al frame `to`: quella del collegamento, al contrario
 * se lo si percorre all'indietro; null se i due frame non sono collegati. Con `back` (si torna
 * indietro) si preferisce rivedere al contrario il collegamento da `to` a `from`: conta per un
 * sottopercorso di un solo frame, dove andata e ritorno collegano gli stessi due frame.
 */
export function transitionBetween(
  transitions: PathTransition[],
  from: number | undefined,
  to: number | undefined,
  back = false,
): { transition: Transition; reverse: boolean } | null {
  if (from === undefined || to === undefined) return null;
  const forward = findLink(transitions, from, to);
  const backward = findLink(transitions, to, from);
  if (backward && (back || !forward)) return { transition: backward, reverse: true };
  return forward ? { transition: forward, reverse: false } : null;
}

// ---------------------------------------------------------------- andamenti

const easeOutBounce = (t: number) => {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

/** Funzioni di andamento: da t in [0, 1] alla frazione di percorso (back ed elastic escono un po' da [0, 1]). */
export const EASINGS: Record<TransitionEasing, (t: number) => number> = {
  smooth: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  linear: (t) => t,
  'ease-in': (t) => t * t * t,
  'ease-out': (t) => 1 - (1 - t) ** 3,
  back: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5 ? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2 : ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  elastic: (t) => (t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  bounce: easeOutBounce,
};
