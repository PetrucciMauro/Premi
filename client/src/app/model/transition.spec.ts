import { describe, expect, it, vi } from 'vitest';
import '../../testing/dom-matrix';
import { Camera, CameraMotion, directPath, motionAt, motionFor, zoomPath } from '../shared/camera';
import { normalizePresentation } from './presentation';
import { DEFAULT_TRANSITION, EASINGS, TRANSITION_EASINGS, normalizeTransition, syncTransitions, transitionBetween } from './transition';

const viewport = { width: 1600, height: 900 };
const from: Camera = { x: 0, y: 0, scale: 0.1, rotation: 0 };
const to: Camera = { x: 5000, y: 2000, scale: 1, rotation: 90 };

describe('transizioni', () => {
  it('normalizza i valori letti dal server, tenendoli nei limiti', () => {
    expect(normalizeTransition(undefined)).toBeUndefined();
    expect(normalizeTransition({})).toEqual(DEFAULT_TRANSITION);
    const t = normalizeTransition({ kind: 'boh', duration: 99, easing: 'bounce', arc: -1, spins: 1.3, spinAxis: 'y', delay: '2', advance: 0 })!;
    expect(t.kind).toBe('direct');
    expect(t.duration).toBe(8);
    expect(t.easing).toBe('bounce');
    expect(t.arc).toBe(0);
    expect(t.spins).toBe(1);
    expect(t.spinAxis).toBe('y');
    expect(t.delay).toBe(2);
    expect(t.advance).toBe(0.5);
  });

  it('le transizioni salvate sui frame diventano quelle dei collegamenti che vi arrivano', () => {
    const { proper } = normalizePresentation({
      proper: {
        paths: { main: [1, 2, 3], choices: [{ id: 1, frame: 2, trigger: 9, choicePath: [4] }] },
        frames: [{ id: 1, transition: { advance: 2 } }, { id: 2, transition: { kind: 'fade', duration: 1 } }, { id: 3 }, { id: 4, transition: { kind: 'cut' } }],
      },
    });
    const { transitions } = proper.paths;
    expect(transitions.map((t) => [t.from, t.to, t.kind])).toEqual([
      [1, 2, 'fade'],
      [2, 3, 'fly'],
      [2, 4, 'cut'],
      [4, 2, 'fade'],
    ]);
    // la partenza automatica è del frame da cui si parte
    expect(transitions[0].advance).toBe(2);
    expect(transitions[0].duration).toBe(1);
    expect('transition' in proper.frames[1]).toBe(false);
  });

  it('la transizione predefinita di partenza va dritta verso il frame', () => {
    expect(DEFAULT_TRANSITION.kind).toBe('direct');
    expect(normalizeTransition({ easing: 'linear' }, { ...DEFAULT_TRANSITION, kind: 'fade' })?.kind).toBe('fade');
  });

  it('i nuovi collegamenti ricevono la transizione indicata', () => {
    const paths = { main: [1, 2, 3], choices: [], transitions: [{ ...DEFAULT_TRANSITION, kind: 'cut' as const, from: 1, to: 2 }] };
    syncTransitions(paths, undefined, { ...DEFAULT_TRANSITION, kind: 'fade' });
    expect(paths.transitions.map((t) => t.kind)).toEqual(['cut', 'fade']);
  });

  it('le transizioni salvate seguono i percorsi: spariscono quelle dei collegamenti che non esistono', () => {
    const { proper } = normalizePresentation({
      proper: { paths: { main: [1, 2, 3], choices: [], transitions: [{ from: 1, to: 2, kind: 'direct' }, { from: 3, to: 1, kind: 'cut' }] } },
    });
    expect(proper.paths.transitions).toEqual([
      { ...DEFAULT_TRANSITION, kind: 'direct', from: 1, to: 2 },
      { ...DEFAULT_TRANSITION, from: 2, to: 3 },
    ]);
  });

  it('cerca la transizione tra due frame, al contrario tornando indietro', () => {
    const a = { ...DEFAULT_TRANSITION, kind: 'fade' as const, from: 1, to: 2 };
    const b = { ...DEFAULT_TRANSITION, kind: 'cut' as const, from: 2, to: 1 };
    expect(transitionBetween([a], 1, 2)).toEqual({ transition: a, reverse: false });
    expect(transitionBetween([a], 2, 1)).toEqual({ transition: a, reverse: true });
    expect(transitionBetween([a], 1, 3)).toBeNull();
    // sottopercorso di un frame: avanti il ritorno, indietro l'ingresso al contrario
    expect(transitionBetween([a, b], 2, 1)).toEqual({ transition: b, reverse: false });
    expect(transitionBetween([a, b], 2, 1, true)).toEqual({ transition: a, reverse: true });
  });

  it('ogni andamento parte da 0 e arriva a 1', () => {
    for (const easing of TRANSITION_EASINGS) {
      expect(EASINGS[easing](0)).toBeCloseTo(0, 6);
      expect(EASINGS[easing](1)).toBeCloseTo(1, 6);
    }
  });

  it('il percorso diretto non si allontana, il volo sì, e di più con un\'ampiezza maggiore', () => {
    const scaleAt = (path: ReturnType<typeof directPath>) => path.at(0.5).scale;
    const direct = directPath(viewport, from, to);
    expect(direct.at(0)).toMatchObject({ x: 0, y: 0 });
    expect(direct.at(1).x).toBeCloseTo(5000);
    expect(direct.at(1).scale).toBeCloseTo(1);
    // a metà percorso: diretto = media geometrica delle scale; il volo è più lontano (scala minore)
    expect(scaleAt(direct)).toBeCloseTo(Math.sqrt(0.1 * 1));
    const fly = zoomPath(viewport, from, to);
    const wide = zoomPath(viewport, from, to, 2.5);
    expect(scaleAt(fly)).toBeLessThan(scaleAt(direct));
    expect(scaleAt(wide)).toBeLessThan(scaleAt(fly));
    expect(wide.at(1).x).toBeCloseTo(5000);
    expect(wide.at(1).scale).toBeCloseTo(1);
  });

  it('i giri in più si sommano alla rotazione durante il movimento', () => {
    const options = motionFor({ ...DEFAULT_TRANSITION, kind: 'direct', easing: 'linear', spins: 2, spinAxis: 'z' });
    const path = directPath(viewport, from, to);
    expect(motionAt(path, from, to, options, 0.5).camera.rotation).toBeCloseTo(45 + 360);
    const flip = motionFor({ ...DEFAULT_TRANSITION, kind: 'direct', easing: 'linear', spins: -1, spinAxis: 'x' });
    expect(motionAt(path, from, to, flip, 0.5).camera.rotateX).toBeCloseTo(-180);
  });

  it('la dissolvenza copre la vista a metà e passa dall\'inquadratura di partenza a quella d\'arrivo', () => {
    const options = motionFor({ ...DEFAULT_TRANSITION, kind: 'fade', easing: 'linear', fadeColor: '#ffffff' });
    const path = zoomPath(viewport, from, to);
    expect(motionAt(path, from, to, options, 0).veil.opacity).toBeCloseTo(0);
    expect(motionAt(path, from, to, options, 0.25)).toMatchObject({ camera: from, veil: { opacity: 0.5, color: '#ffffff' } });
    expect(motionAt(path, from, to, options, 0.75)).toMatchObject({ camera: to, veil: { opacity: 0.5 } });
  });

  it('la promessa del movimento dice se la telecamera è arrivata o è stata interrotta', async () => {
    const motion = new CameraMotion({ min: 100, max: 200, perUnit: 100 }, () => {});
    expect(await motion.moveTo(viewport, from, false)).toBe(true);
    const interrupted = motion.moveTo(viewport, to, true);
    motion.jump(viewport, from);
    expect(await interrupted).toBe(false);
    // lo stacco senza attesa arriva subito
    expect(await motion.moveTo(viewport, to, true, motionFor({ ...DEFAULT_TRANSITION, kind: 'cut' }))).toBe(true);
  });

  it('tornando indietro rivede la stessa transizione al contrario', () => {
    // fotogrammi comandati a mano: si guarda la telecamera a un istante preciso del movimento
    let queue: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => (queue.push(cb), queue.length));
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const frameAt = (ms: number) => {
      const q = queue;
      queue = [];
      q.forEach((cb) => cb(ms));
    };
    let shown: DOMPoint | null = null;
    const motion = new CameraMotion({ min: 1, max: 1, perUnit: 1 }, (_t, _z, view) => (shown = view.matrix.transformPoint(new DOMPoint(1234, 567, 0))));
    // asimmetrica: accelera, con un giro in più e un'attesa (che all'indietro non c'è)
    const transition = { ...DEFAULT_TRANSITION, kind: 'direct' as const, duration: 1, easing: 'ease-in' as const, spins: 1, delay: 0.5 };

    motion.jump(viewport, from);
    void motion.moveTo(viewport, to, true, motionFor(transition));
    frameAt(500 + 250); // 25% dell'andata, dopo l'attesa
    const forward = shown!;

    motion.jump(viewport, to);
    void motion.moveTo(viewport, from, true, motionFor(transition, true));
    frameAt(750); // 75% del ritorno, senza attesa
    const backward = shown!;

    expect(backward.x / backward.w).toBeCloseTo(forward.x / forward.w, 6);
    expect(backward.y / backward.w).toBeCloseTo(forward.y / forward.w, 6);
    now.mockRestore();
    vi.restoreAllMocks();
  });
});
