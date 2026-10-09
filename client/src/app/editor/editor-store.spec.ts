import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PresentationApi } from '../core/presentation-api.service';
import { FrameElement, TextElement, normalizePresentation } from '../model/presentation';
import { EditorStore } from './editor-store';

const frame = (id: number, zIndex: number): FrameElement => ({
  id, zIndex, type: 'frame', xIndex: 0, yIndex: 0, width: 100, height: 100, rotation: 0, bookmark: 0, ref: '', color: '', fit: 'cover', rotateX: 0, rotateY: 0,
});

const text = (id: number, zIndex: number): TextElement => ({
  id, zIndex, type: 'text', xIndex: 10, yIndex: 10, width: 50, height: 20, rotation: 0,
  content: 'ciao', font: 'Arial', fontSize: 1, color: 'black',
});

describe('EditorStore', () => {
  let store: EditorStore;
  let api: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    api = {
      newElement: vi.fn().mockResolvedValue({}),
      updateElement: vi.fn().mockResolvedValue({}),
      deleteElement: vi.fn().mockResolvedValue({}),
      updatePaths: vi.fn().mockResolvedValue({}),
    };
    TestBed.configureTestingModule({ providers: [EditorStore, { provide: PresentationApi, useValue: api }] });
    store = TestBed.inject(EditorStore);

    const raw = {
      meta: { titolo: 'Prova' },
      proper: {
        paths: { main: [1], choices: [] },
        frames: [frame(1, 0)],
        texts: [text(2, 1)],
        background: { id: 0, type: 'background', color: 'white', image: '', width: 1000, height: 500 },
      },
    };
    store.load(normalizePresentation(raw), raw);
  });

  it('annulla e ripristina un inserimento', () => {
    const id = store.insert({ ...frame(0, 0), xIndex: 50 });
    expect(id).toBe(3);
    expect(store.proper().frames.find((f) => f.id === 3)?.zIndex).toBe(2);
    expect(store.undoLabel()).toBe('inserimento frame');

    store.undo();
    expect(store.proper().frames.map((f) => f.id)).toEqual([1]);
    expect(store.selectedId()).toBeNull();
    store.redo();
    expect(store.proper().frames.map((f) => f.id)).toEqual([1, 3]);
  });

  it('eliminando un frame lo toglie dal percorso e abbassa gli elementi sopra', () => {
    store.remove(1);
    expect(store.proper().paths.main).toEqual([]);
    expect(store.proper().texts[0].zIndex).toBe(0);
    store.undo();
    expect(store.proper().paths.main).toEqual([1]);
  });

  it('unisce i comandi consecutivi con la stessa chiave', () => {
    store.update(2, 'ruota elemento', (el) => (el.rotation = 10), 'rotate-2');
    store.update(2, 'ruota elemento', (el) => (el.rotation = 20), 'rotate-2');
    store.undo();
    expect(store.proper().texts[0].rotation).toBe(0);
    expect(store.canUndo()).toBe(false);
  });

  it('gli elementi associati seguono il frame', () => {
    store.attach([2], 1);
    expect(store.proper().texts[0].anchor).toMatchObject({ frame: 1, x: 0.35, y: 0.2, width: 0.5, height: 0.2 });

    // spostamento e ingrandimento proporzionale: il testo scala, compreso il font
    store.update(1, 'ridimensiona', (f) => {
      f.xIndex = 100;
      f.width = 200;
      f.height = 200;
    });
    expect(store.proper().texts[0]).toMatchObject({ xIndex: 120, yIndex: 20, width: 100, height: 40, fontSize: 2 });

    // rotazione del frame: il testo ruota attorno al centro del frame
    store.update(1, 'ruota', (f) => (f.rotation = 180));
    expect(store.proper().texts[0]).toMatchObject({ xIndex: 180, yIndex: 140, rotation: 180 });

    // spostando il testo cambia solo la sua posizione relativa
    store.update(2, 'sposta', (el) => (el.xIndex += 20));
    expect(store.proper().frames[0].xIndex).toBe(100);
    expect(store.proper().texts[0].anchor?.x).toBeCloseTo(0.25);

    store.undo();
    store.undo();
    expect(store.proper().texts[0]).toMatchObject({ xIndex: 120, rotation: 0 });
  });

  it('associando un elemento la sua rotazione diventa relativa al frame', () => {
    store.update(1, 'ruota', (f) => (f.rotation = 30));
    store.update(2, 'ruota', (el) => (el.rotation = 10));
    store.attach([2], 1);
    expect(store.proper().texts[0].rotation).toBe(40);
    expect(store.proper().texts[0].anchor?.rotation).toBe(10);
    // il centro dell'elemento non si sposta
    expect(store.proper().texts[0]).toMatchObject({ xIndex: 10, yIndex: 10 });
  });

  describe('livelli degli elementi associati', () => {
    const layers = () => Object.fromEntries([...store.proper().frames, ...store.proper().texts].map((el) => [el.id, el.zIndex]));

    beforeEach(() => {
      // frame 1 (z 0), testo 2 (z 1), frame 3 (z 2), testo 4 (z 3)
      store.insert({ ...frame(0, 0), xIndex: 300 });
      store.insert({ ...text(0, 0), xIndex: 310 });
    });

    it('associando un elemento che sta sotto al frame lo porta sopra', () => {
      store.attach([2], 3);
      expect(layers()).toEqual({ 1: 0, 3: 1, 2: 2, 4: 3 });
    });

    it('un elemento associato non scende sotto il suo frame', () => {
      store.attach([4], 3);
      store.changeLayer(4, -1);
      expect(layers()).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3 });
      expect(store.canUndo()).toBe(true);
      expect(store.undoLabel()).toBe('associa al frame');
    });

    it('il frame cambia livello insieme ai suoi elementi', () => {
      store.attach([4], 3);
      store.changeLayer(3, -1);
      expect(layers()).toEqual({ 1: 0, 3: 1, 4: 2, 2: 3 });
      store.changeLayer(3, -1);
      expect(layers()).toEqual({ 3: 0, 4: 1, 1: 2, 2: 3 });
      store.changeLayer(3, 1);
      store.changeLayer(3, 1);
      expect(layers()).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3 });
    });

    it('un elemento non può passare sotto un frame portandoci sopra il frame', () => {
      store.attach([2], 1);
      store.changeLayer(1, 1);
      expect(layers()).toEqual({ 3: 0, 1: 1, 2: 2, 4: 3 });
    });
  });

  describe('sottopercorsi', () => {
    beforeEach(() => {
      // frame 3 e 4 oltre al frame 1 del percorso principale; testo 2 associato al frame 1
      store.insert({ ...frame(0, 0), xIndex: 300 });
      store.insert({ ...frame(0, 0), xIndex: 500 });
      store.attach([2], 1);
    });

    it('un frame appartiene a un solo percorso', () => {
      const sub = store.createSubPath(1, 2);
      store.addToMainPath(3);
      store.addToSubPath(sub, 3);
      store.addToSubPath(sub, 4);
      expect(store.proper().paths.main).toEqual([1]);
      expect(store.proper().paths.choices[0]).toMatchObject({ frame: 1, trigger: 2, choicePath: [3, 4] });

      store.addToMainPath(4);
      expect(store.proper().paths.main).toEqual([1, 4]);
      expect(store.proper().paths.choices[0].choicePath).toEqual([3]);

      // il frame di partenza non può entrare nel proprio sottopercorso
      store.addToSubPath(sub, 1);
      expect(store.proper().paths.choices[0].choicePath).toEqual([3]);
    });

    it('un elemento avvia un solo sottopercorso', () => {
      const a = store.createSubPath(1, 2);
      const b = store.createSubPath(1, null);
      store.setSubPathTrigger(b, 2);
      expect(store.proper().paths.choices.map((s) => [s.id, s.trigger])).toEqual([[a, null], [b, 2]]);
    });

    it('eliminando elementi e frame i sottopercorsi restano coerenti', () => {
      const sub = store.createSubPath(1, 2);
      store.addToSubPath(sub, 3);
      store.addToSubPath(sub, 4);
      store.remove(3);
      expect(store.proper().paths.choices[0].choicePath).toEqual([4]);
      store.remove(2);
      expect(store.proper().paths.choices[0].trigger).toBeNull();
      store.remove(1);
      expect(store.proper().paths.choices).toEqual([]);
    });
  });

  it('riordina gli elementi di un frame, ognuno con i propri elementi', () => {
    // frame 1: testo 2, frame 3 (con testo 4), testo 5
    store.insert({ ...frame(0, 0), xIndex: 10, yIndex: 10, width: 50, height: 50 });
    store.insert(text(0, 0));
    store.insert(text(0, 0));
    store.attach([2, 3, 5], 1);
    store.attach([4], 3);
    const layers = () => Object.fromEntries([...store.proper().frames, ...store.proper().texts].map((el) => [el.id, el.zIndex]));
    expect(layers()).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 });

    // dall'alto: frame 3 in primo piano, poi testo 2, poi testo 5
    store.reorderChildren(1, [3, 2, 5]);
    expect(layers()).toEqual({ 1: 0, 5: 1, 2: 2, 3: 3, 4: 4 });

    // elementi non associati al frame: nessuna modifica
    store.reorderChildren(1, [4, 2]);
    expect(layers()).toEqual({ 1: 0, 5: 1, 2: 2, 3: 3, 4: 4 });
  });

  it('ridimensionamento libero del frame', () => {
    store.attach([2], 1);
    store.update(1, 'ridimensiona', (f) => (f.width = 200));
    expect(store.proper().texts[0]).toMatchObject({ xIndex: 20, yIndex: 10, width: 100, height: 20 });
  });

  it('eliminando il frame gli elementi restano dove sono, non più associati', () => {
    store.attach([2], 1);
    store.remove(1);
    expect(store.proper().texts[0].anchor).toBeUndefined();
    expect(store.proper().texts[0].xIndex).toBe(10);
  });

  it('non permette associazioni circolari', () => {
    store.insert({ ...frame(0, 0), anchor: { frame: 1, x: 0, y: 0, width: 0, height: 0, rotation: 0 } });
    expect(store.proper().frames[1].anchor?.frame).toBe(1);
    expect(store.canAttach(store.proper(), 1, 3)).toBe(false);
    store.attach([1], 3);
    expect(store.proper().frames[0].anchor).toBeUndefined();

    // i frame annidati seguono il frame esterno, e con loro i propri elementi
    store.attach([2], 3);
    store.update(1, 'sposta', (f) => (f.yIndex = 50));
    expect(store.proper().frames[1].yIndex).toBe(50);
    expect(store.proper().texts[0].yIndex).toBe(60);
  });

  it('scambia i livelli', () => {
    store.changeLayer(1, 1);
    expect(store.proper().frames[0].zIndex).toBe(1);
    expect(store.proper().texts[0].zIndex).toBe(0);
  });

  it('salva solo le differenze', async () => {
    // al primo salvataggio va inviato lo sfondo, che nel documento originale era già completo
    await store.save();
    expect(api['updateElement']).not.toHaveBeenCalled();

    store.insert(frame(0, 0));
    store.setContent(2, 'modificato');
    store.remove(1);
    expect(store.dirty()).toBe(true);
    await store.save();

    expect(api['deleteElement']).toHaveBeenCalledWith('Prova', 'frame', 1);
    expect(api['newElement']).toHaveBeenCalledWith('Prova', expect.objectContaining({ id: 3 }));
    expect(api['updateElement']).toHaveBeenCalledWith('Prova', expect.objectContaining({ id: 2, content: 'modificato' }));
    expect(api['updatePaths']).toHaveBeenCalledWith('Prova', { main: [], choices: [] });
    expect(store.dirty()).toBe(false);
  });

  it('dopo un errore non reinvia gli inserimenti già salvati', async () => {
    store.insert(frame(0, 0));
    api['updatePaths'].mockRejectedValueOnce(new Error('rete'));
    store.addToMainPath(3);
    await expect(store.save()).rejects.toThrow('rete');
    expect(store.dirty()).toBe(true);

    await store.save();
    expect(api['newElement']).toHaveBeenCalledTimes(1);
    expect(api['updatePaths']).toHaveBeenCalledTimes(2);
    expect(store.dirty()).toBe(false);
  });

  it('salva lo sfondo di una presentazione nuova', async () => {
    const raw = { meta: { titolo: 'Nuova' }, proper: { background: { id: 0 } } };
    store.load(normalizePresentation(raw), raw);
    await store.save();
    expect(api['updateElement']).toHaveBeenCalledWith('Nuova', expect.objectContaining({ type: 'background', width: 1600 }));
  });
});
