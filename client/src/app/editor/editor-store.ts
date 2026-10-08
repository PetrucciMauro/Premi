/*
 * Name : Giovanni Venturelli, Matteo Busetto
 * Package : SlideShowActions / Command
 * Description:
 *   Stato dell'editor. Ogni modifica è un comando annullabile: lo stato della presentazione
 *   non viene mai modificato sul posto, quindi annulla/ripristina conservano semplicemente
 *   lo stato prima e dopo il comando.
 *   Il salvataggio confronta lo stato attuale con l'ultimo salvato e invia al server
 *   solo gli elementi inseriti, modificati o eliminati.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { PresentationApi } from '../core/presentation-api.service';
import {
  COLLECTIONS,
  ELEMENT_TYPES,
  FrameElement,
  Presentation,
  Proper,
  SlideElement,
  TextElement,
  addElement,
  allElements,
  findElement,
  nextElementId,
  nextZIndex,
  removeElement,
} from '../model/presentation';

interface HistoryEntry {
  label: string;
  before: Proper;
  after: Proper;
  mergeKey?: string;
}

const MAX_HISTORY = 200;

const INSERT_LABELS: Record<SlideElement['type'], string> = {
  frame: 'inserimento frame',
  text: 'inserimento testo',
  image: 'inserimento immagine',
  audio: 'inserimento audio',
  video: 'inserimento video',
  SVG: 'inserimento SVG',
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export type NewElement = Omit<SlideElement, 'id' | 'zIndex'>;

@Injectable()
export class EditorStore {
  private readonly api = inject(PresentationApi);

  readonly title = signal('');
  private readonly state = signal<Proper | null>(null);
  readonly selectedId = signal<number | null>(null);

  private readonly undoStack = signal<HistoryEntry[]>([]);
  private readonly redoStack = signal<HistoryEntry[]>([]);
  private readonly savedState = signal<Proper | null>(null);
  readonly saving = signal(false);
  private saveQueue: Promise<unknown> = Promise.resolve();

  readonly loaded = computed(() => this.state() !== null);
  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);
  readonly undoLabel = computed(() => this.undoStack().at(-1)?.label ?? '');
  readonly redoLabel = computed(() => this.redoStack().at(-1)?.label ?? '');
  readonly dirty = computed(() => this.state() !== this.savedState());

  readonly selected = computed(() => {
    const id = this.selectedId();
    const proper = this.state();
    return proper && id !== null ? (findElement(proper, id) ?? null) : null;
  });
  readonly mainPath = computed(() => this.state()?.paths.main ?? []);

  /** Stato corrente; da usare solo dopo load(). */
  proper(): Proper {
    const proper = this.state();
    if (!proper) throw new Error('Nessuna presentazione aperta');
    return proper;
  }

  readonly current = this.state.asReadonly();

  load(presentation: Presentation, raw?: unknown): void {
    const proper = presentation.proper;
    // se lo sfondo salvato non ha dimensioni (presentazione nuova) va salvato al primo salvataggio
    const rawBackground = (raw as { proper?: { background?: { width?: unknown } } } | undefined)?.proper?.background;
    const saved = rawBackground?.width ? proper : { ...proper, background: { ...proper.background, width: -1 } };

    this.title.set(presentation.meta.titolo);
    this.state.set(proper);
    this.savedState.set(saved);
    this.selectedId.set(null);
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  // ---------------------------------------------------------------- comandi

  /**
   * Esegue una modifica annullabile. I comandi consecutivi con la stessa mergeKey
   * (es. i passi dello slider di rotazione) diventano un'unica voce di annullamento.
   */
  execute(label: string, mutate: (draft: Proper) => void, mergeKey?: string): boolean {
    const before = this.proper();
    const after = structuredClone(before);
    mutate(after);
    if (same(before, after)) return false;

    this.state.set(after);
    this.redoStack.set([]);
    this.undoStack.update((stack) => {
      const last = stack.at(-1);
      if (mergeKey && last?.mergeKey === mergeKey)
        return [...stack.slice(0, -1), { ...last, after }];
      return [...stack, { label, before, after, mergeKey }].slice(-MAX_HISTORY);
    });
    return true;
  }

  /** Modifica temporanea (es. durante un trascinamento) da confermare con commit(). */
  preview(mutate: (draft: Proper) => void): void {
    const draft = structuredClone(this.proper());
    mutate(draft);
    this.state.set(draft);
  }

  /** Registra come comando le modifiche fatte con preview() a partire dallo stato `before`. */
  commit(label: string, before: Proper): void {
    const after = this.proper();
    if (same(before, after)) {
      this.state.set(before);
      return;
    }
    this.redoStack.set([]);
    this.undoStack.update((stack) => [...stack, { label, before, after }].slice(-MAX_HISTORY));
  }

  undo(): void {
    const entry = this.undoStack().at(-1);
    if (!entry) return;
    this.undoStack.update((stack) => stack.slice(0, -1));
    this.redoStack.update((stack) => [...stack, entry]);
    this.state.set(entry.before);
    this.dropMissingSelection();
  }

  redo(): void {
    const entry = this.redoStack().at(-1);
    if (!entry) return;
    this.redoStack.update((stack) => stack.slice(0, -1));
    this.undoStack.update((stack) => [...stack, entry]);
    this.state.set(entry.after);
    this.dropMissingSelection();
  }

  private dropMissingSelection(): void {
    if (!this.selected()) this.selectedId.set(null);
  }

  // ---------------------------------------------------------------- elementi

  insert(element: NewElement): number {
    const proper = this.proper();
    const id = nextElementId(proper);
    this.execute(INSERT_LABELS[element.type], (draft) =>
      addElement(draft, { ...element, id, zIndex: nextZIndex(draft) } as SlideElement),
    );
    this.selectedId.set(id);
    return id;
  }

  remove(id: number): void {
    const element = findElement(this.proper(), id);
    if (!element) return;
    const labels: Record<string, string> = { frame: 'frame', text: 'testo', image: 'immagine', audio: 'audio', video: 'video' };
    this.execute('eliminazione ' + (labels[element.type] ?? element.type), (draft) => {
      removeElement(draft, id);
      // gli elementi sopra quello eliminato scendono di un livello
      for (const el of allElements(draft)) if (el.zIndex > element.zIndex) el.zIndex--;
      if (element.type === 'frame') {
        draft.paths.main = draft.paths.main.filter((frameId) => frameId !== id);
        draft.paths.choices = draft.paths.choices.map((choice) => {
          const path = choice as { choicePath?: unknown[] };
          return Array.isArray(path.choicePath)
            ? { ...path, choicePath: path.choicePath.filter((frameId) => Number(frameId) !== id) }
            : choice;
        });
      }
    });
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  update<T extends SlideElement>(id: number, label: string, change: (el: T) => void, mergeKey?: string): void {
    this.execute(label, (draft) => {
      const el = findElement(draft, id) as T | undefined;
      if (el) change(el);
    }, mergeKey);
  }

  /** Scambia lo z-index con l'elemento immediatamente sopra (direction 1) o sotto (-1). */
  changeLayer(id: number, direction: 1 | -1): void {
    this.execute(direction === 1 ? 'porta avanti' : 'porta dietro', (draft) => {
      const element = findElement(draft, id);
      if (!element) return;
      const other = allElements(draft)
        .filter((el) => el.id !== id && (direction === 1 ? el.zIndex > element.zIndex : el.zIndex < element.zIndex))
        .sort((a, b) => direction * (a.zIndex - b.zIndex))[0];
      if (!other) return;
      [element.zIndex, other.zIndex] = [other.zIndex, element.zIndex];
    });
  }

  setContent(id: number, content: string): void {
    this.update<TextElement>(id, 'modifica testo', (el) => (el.content = content));
  }

  // ---------------------------------------------------------------- sfondo

  setBackground(change: { color?: string; image?: string }, label = 'modifica sfondo presentazione'): void {
    this.execute(label, (draft) => Object.assign(draft.background, change), 'background-' + Object.keys(change).join());
  }

  setFrameBackground(id: number, change: { color?: string; ref?: string }): void {
    this.update<FrameElement>(id, 'modifica sfondo', (el) => Object.assign(el, change), `frame-bg-${id}-${Object.keys(change).join()}`);
  }

  // ---------------------------------------------------------------- percorsi

  addToMainPath(id: number): void {
    this.execute('aggiungi a percorso principale', (draft) => {
      if (!draft.paths.main.includes(id)) draft.paths.main.push(id);
    });
  }

  removeFromMainPath(id: number): void {
    this.execute('rimuovi da percorso principale', (draft) => {
      draft.paths.main = draft.paths.main.filter((frameId) => frameId !== id);
      const frame = draft.frames.find((f) => f.id === id);
      if (frame) frame.bookmark = 0;
    });
  }

  moveInMainPath(from: number, to: number): void {
    this.execute('modifica percorso principale', (draft) => {
      const [id] = draft.paths.main.splice(from, 1);
      draft.paths.main.splice(to, 0, id);
    });
  }

  toggleBookmark(id: number): void {
    const frame = this.proper().frames.find((f) => f.id === id);
    if (!frame) return;
    this.update<FrameElement>(id, frame.bookmark ? 'rimuovi bookmark' : 'assegna bookmark', (el) => {
      el.bookmark = el.bookmark ? 0 : 1;
    });
  }

  // ---------------------------------------------------------------- salvataggio

  /** Salva sul server le differenze rispetto all'ultimo salvataggio. */
  save(): Promise<void> {
    const run = this.saveQueue.then(() => this.saveChanges());
    this.saveQueue = run.catch(() => undefined);
    return run;
  }

  private async saveChanges(): Promise<void> {
    const current = this.state();
    const saved = this.savedState();
    if (!current || !saved || current === saved) return;

    const title = this.title();
    // stato confermato dal server, aggiornato richiesta per richiesta: se qualcosa fallisce
    // il salvataggio successivo invia solo ciò che manca (senza duplicare gli inserimenti)
    const confirmed = structuredClone(saved);
    const deletes: (() => Promise<unknown>)[] = [];
    const changes: (() => Promise<unknown>)[] = [];

    for (const type of ELEMENT_TYPES) {
      const collection = COLLECTIONS[type];
      const before = new Map((saved[collection] as SlideElement[]).map((el) => [el.id, el]));
      const after = new Map((current[collection] as SlideElement[]).map((el) => [el.id, el]));

      for (const [id, el] of before)
        if (!after.has(id))
          deletes.push(() => this.api.deleteElement(title, el.type, id).then(() => removeElement(confirmed, id)));
      for (const [id, el] of after) {
        const old = before.get(id);
        if (!old)
          changes.push(() => this.api.newElement(title, el).then(() => addElement(confirmed, el)));
        else if (!same(old, el))
          changes.push(() => this.api.updateElement(title, el).then(() => {
            removeElement(confirmed, id);
            addElement(confirmed, el);
          }));
      }
    }
    if (!same(saved.paths, current.paths))
      changes.push(() => this.api.updatePaths(title, current.paths).then(() => (confirmed.paths = current.paths)));
    if (!same(saved.background, current.background))
      changes.push(() => this.api.updateElement(title, current.background).then(() => (confirmed.background = current.background)));

    this.saving.set(true);
    try {
      // prima le eliminazioni, come faceva il vecchio Loader
      await Promise.all(deletes.map((send) => send()));
      await Promise.all(changes.map((send) => send()));
      this.savedState.set(current);
    } catch (err) {
      this.savedState.set(confirmed);
      throw err;
    } finally {
      this.saving.set(false);
    }
  }
}
