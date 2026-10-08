import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PresentationApi } from '../core/presentation-api.service';
import { FrameElement, TextElement, normalizePresentation } from '../model/presentation';
import { EditorStore } from './editor-store';

const frame = (id: number, zIndex: number): FrameElement => ({
  id, zIndex, type: 'frame', xIndex: 0, yIndex: 0, width: 100, height: 100, rotation: 0, bookmark: 0, ref: '', color: '',
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
