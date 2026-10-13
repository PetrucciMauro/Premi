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
import { DEFAULT_TRANSITION, Transition, syncTransitions } from '../model/transition';
import { Alignment, Axis, alignElements, distributeElements, parentOf } from '../model/arrange';
import {
  COLLECTIONS,
  ELEMENT_TYPES,
  FrameElement,
  FrameImageFit,
  Presentation,
  Proper,
  SlideElement,
  TextElement,
  addElement,
  allElements,
  anchorChain,
  byLayer,
  cleanName,
  findElement,
  newAnchor,
  nextElementId,
  nextZIndex,
  removeElement,
  removeFromPaths,
  syncAnchors,
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
  /** elementi selezionati, tutti nello stesso contenitore (stesso frame o la tela) */
  readonly selectedIds = signal<number[]>([]);
  /** l'elemento selezionato quando ce n'è uno solo */
  readonly selectedId = computed(() => {
    const ids = this.selectedIds();
    return ids.length === 1 ? ids[0] : null;
  });

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
  /** tutti gli elementi selezionati */
  readonly selection = computed(() => {
    const proper = this.state();
    return proper ? this.selectedIds().map((id) => findElement(proper, id)).filter((el): el is SlideElement => !!el) : [];
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
    this.selectedIds.set([]);
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
    syncAnchors(before, after);
    syncTransitions(after.paths, before.paths);
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
    const before = this.proper();
    const draft = structuredClone(before);
    mutate(draft);
    syncAnchors(before, draft);
    syncTransitions(draft.paths, before.paths);
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

  /** Dopo annulla/ripristina restano selezionati gli elementi ancora presenti nello stesso contenitore. */
  private dropMissingSelection(): void {
    const selection = this.selection();
    const parent = selection.length ? parentOf(selection[0]) : null;
    const ids = selection.filter((el) => parentOf(el) === parent).map((el) => el.id);
    if (ids.length !== this.selectedIds().length) this.selectedIds.set(ids);
  }

  // ---------------------------------------------------------------- selezione

  /** Seleziona solo l'elemento indicato (o nessuno). */
  select(id: number | null): void {
    this.selectedIds.set(id === null ? [] : [id]);
  }

  /**
   * Aggiunge o toglie l'elemento dalla selezione. Gli elementi selezionati devono stare nello
   * stesso contenitore: un elemento di un altro contenitore sostituisce la selezione e la
   * funzione restituisce false.
   */
  toggleSelect(id: number): boolean {
    const proper = this.proper();
    const el = findElement(proper, id);
    if (!el) return true;
    const ids = this.selectedIds();
    if (ids.includes(id)) {
      this.selectedIds.set(ids.filter((x) => x !== id));
      return true;
    }
    const first = ids.length ? findElement(proper, ids[0]) : undefined;
    if (first && parentOf(first) !== parentOf(el)) {
      this.selectedIds.set([id]);
      return false;
    }
    this.selectedIds.set([...ids, id]);
    return true;
  }

  /** Seleziona tutti gli elementi del contenitore della selezione (la tela se non c'è selezione). */
  selectSiblings(): void {
    const first = this.selection()[0];
    const parent = first ? parentOf(first) : null;
    this.selectedIds.set(byLayer(this.proper()).filter((el) => parentOf(el) === parent).map((el) => el.id));
  }

  // ---------------------------------------------------------------- elementi

  insert(element: NewElement): number {
    const proper = this.proper();
    const id = nextElementId(proper);
    this.execute(INSERT_LABELS[element.type], (draft) =>
      addElement(draft, { ...element, id, zIndex: nextZIndex(draft) } as SlideElement),
    );
    this.select(id);
    return id;
  }

  /** Elimina gli elementi indicati con un solo comando. */
  remove(...ids: number[]): void {
    const elements = ids.map((id) => findElement(this.proper(), id)).filter((el): el is SlideElement => !!el);
    if (!elements.length) return;
    const labels: Record<string, string> = { frame: 'frame', text: 'testo', image: 'immagine', audio: 'audio', video: 'video' };
    const label =
      elements.length > 1 ? `eliminazione ${elements.length} elementi` : 'eliminazione ' + (labels[elements[0].type] ?? elements[0].type);
    this.execute(label, (draft) => {
      for (const { id, type } of elements) {
        const removed = removeElement(draft, id);
        if (!removed) continue;
        // gli elementi sopra quello eliminato scendono di un livello
        for (const el of allElements(draft)) if (el.zIndex > removed.zIndex) el.zIndex--;
        if (type === 'frame') {
          removeFromPaths(draft.paths, id);
          // i sottopercorsi che partivano da questo frame non sono più raggiungibili
          draft.paths.choices = draft.paths.choices.filter((sub) => sub.frame !== id);
        }
        // i sottopercorsi avviati da questo elemento restano, in attesa di un nuovo elemento
        for (const sub of draft.paths.choices) if (sub.trigger === id) sub.trigger = null;
      }
    });
    this.selectedIds.update((selected) => selected.filter((id) => !ids.includes(id)));
  }

  update<T extends SlideElement>(id: number, label: string, change: (el: T) => void, mergeKey?: string): void {
    this.execute(label, (draft) => {
      const el = findElement(draft, id) as T | undefined;
      if (el) change(el);
    }, mergeKey);
  }

  /** Sposta gli elementi di (dx, dy); i comandi con la stessa `mergeKey` diventano uno solo. */
  move(ids: number[], dx: number, dy: number, mergeKey?: string): void {
    this.execute(ids.length > 1 ? 'sposta elementi' : 'sposta elemento', (draft) => {
      for (const id of ids) {
        const el = findElement(draft, id);
        if (el) {
          el.xIndex += dx;
          el.yIndex += dy;
        }
      }
    }, mergeKey);
  }

  /** Allinea un elemento al suo contenitore o più elementi tra loro (vedi alignElements). */
  align(ids: number[], alignment: Alignment, toContainer = ids.length < 2): void {
    this.execute(toContainer ? 'posiziona nel contenitore' : 'allinea elementi', (draft) =>
      alignElements(draft, ids, alignment, toContainer),
    );
  }

  /** Distribuisce gli elementi a distanze uguali lungo un asse. */
  distribute(ids: number[], axis: Axis): void {
    this.execute('distribuisci elementi', (draft) => distributeElements(draft, ids, axis));
  }

  /**
   * Porta l'elemento sopra l'elemento immediatamente sopra (direction 1) o sotto quello
   * immediatamente sotto (-1). Un frame si sposta insieme agli elementi associati; un
   * elemento associato non può scendere sotto il suo frame (vedi enforceLayering).
   */
  changeLayer(id: number, direction: 1 | -1): void {
    this.execute(direction === 1 ? 'porta avanti' : 'porta dietro', (draft) => {
      const order = byLayer(draft);
      const levels = order.map((el) => el.zIndex);
      const inGroup = (el: SlideElement) => el.id === id || anchorChain(draft, el).includes(id);
      const group = order.filter(inGroup);
      if (!group.length) return;
      const rest = order.filter((el) => !inGroup(el));
      // vicino: il primo elemento fuori dal gruppo sopra il suo elemento più alto o sotto il più basso
      const edge = order.indexOf(direction === 1 ? group.at(-1)! : group[0]);
      const neighbor = direction === 1 ? order.slice(edge + 1).find((el) => !inGroup(el)) : order.slice(0, edge).reverse().find((el) => !inGroup(el));
      if (!neighbor) return;
      const at = rest.indexOf(neighbor) + (direction === 1 ? 1 : 0);
      [...rest.slice(0, at), ...group, ...rest.slice(at)].forEach((el, i) => (el.zIndex = levels[i]));
    });
  }

  /**
   * Riordina gli elementi associati direttamente al frame; `ids` va dal più in alto al più
   * in basso. Ogni elemento si sposta con i propri elementi associati; i livelli usati sono
   * quelli che il gruppo occupava già, così il resto della presentazione non cambia.
   */
  reorderChildren(frameId: number, ids: number[]): void {
    this.execute('riordina elementi del frame', (draft) => {
      if (!ids.every((id) => findElement(draft, id)?.anchor?.frame === frameId)) return;
      const order = byLayer(draft);
      const groupOf = (id: number) => order.filter((el) => el.id === id || anchorChain(draft, el).includes(id));
      const members = [...ids].reverse().flatMap(groupOf);
      const levels = members.map((el) => el.zIndex).sort((a, b) => a - b);
      members.forEach((el, i) => (el.zIndex = levels[i]));
    });
  }

  /**
   * Associa gli elementi a un frame (o li separa con frameId null): da quel momento
   * seguono spostamenti, ridimensionamenti e rotazioni del frame.
   */
  attach(ids: number[], frameId: number | null, label = frameId === null ? 'separa dal frame' : 'associa al frame'): void {
    this.execute(label, (draft) => {
      for (const id of ids) {
        const el = findElement(draft, id);
        if (!el) continue;
        if (frameId === null || !this.canAttach(draft, id, frameId)) delete el.anchor;
        else if (el.anchor?.frame !== frameId) {
          // la rotazione che aveva (rispetto alla tela o al frame precedente) diventa quella rispetto al nuovo frame
          const relative = el.anchor ? el.anchor.rotation : el.rotation;
          const frame = draft.frames.find((f) => f.id === frameId)!;
          el.rotation = (((frame.rotation + relative) % 360) + 360) % 360;
          el.anchor = newAnchor(frameId);
        }
      }
    });
  }

  /** Un frame non può essere associato a sé stesso né a un frame che dipende da lui. */
  canAttach(proper: Proper, id: number, frameId: number): boolean {
    const frame = proper.frames.find((f) => f.id === frameId);
    return !!frame && frame.id !== id && !anchorChain(proper, frame).includes(id);
  }

  /** Dà un nome all'elemento; un nome vuoto lo toglie. */
  rename(id: number, name: string): void {
    const clean = cleanName(name);
    this.update(id, clean ? 'rinomina' : 'rimuovi nome', (el) => {
      if (clean) el.name = clean;
      else delete el.name;
    });
  }

  setContent(id: number, content: string): void {
    this.update<TextElement>(id, 'modifica testo', (el) => (el.content = content));
  }

  // ---------------------------------------------------------------- sfondo

  setBackground(change: { color?: string; image?: string }, label = 'modifica sfondo presentazione'): void {
    this.execute(label, (draft) => Object.assign(draft.background, change), 'background-' + Object.keys(change).join());
  }

  setFrameBackground(id: number, change: { color?: string; ref?: string; fit?: FrameImageFit }): void {
    this.update<FrameElement>(id, 'modifica sfondo', (el) => Object.assign(el, change), `frame-bg-${id}-${Object.keys(change).join()}`);
  }

  // ---------------------------------------------------------------- transizioni

  /**
   * Modifica la transizione tra i frame `from` e `to` (null torna a quella predefinita).
   * Le transizioni nascono e spariscono con i collegamenti dei percorsi (vedi syncTransitions).
   */
  setTransition(from: number, to: number, transition: Transition | null, mergeKey?: string): void {
    this.execute(transition ? 'modifica transizione' : 'transizione predefinita', (draft) => {
      const link = draft.paths.transitions.find((t) => t.from === from && t.to === to);
      if (link) Object.assign(link, transition ?? DEFAULT_TRANSITION, { from, to });
    }, mergeKey);
  }

  /** Stessa transizione per tutti i collegamenti dei percorsi. */
  setTransitionForAll(transition: Transition): void {
    this.execute('transizione per tutti i passi', (draft) => {
      for (const link of draft.paths.transitions) Object.assign(link, transition, { from: link.from, to: link.to });
    });
  }

  // ---------------------------------------------------------------- percorsi

  /** Aggiunge il frame al percorso principale, togliendolo dall'eventuale sottopercorso. */
  addToMainPath(id: number): void {
    this.execute('aggiungi a percorso principale', (draft) => {
      if (draft.paths.main.includes(id)) return;
      removeFromPaths(draft.paths, id);
      draft.paths.main.push(id);
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

  /** Crea un sottopercorso che parte dal frame `frame`, avviato dall'elemento `trigger`. */
  createSubPath(frame: number, trigger: number | null = null): number {
    const id = Math.max(0, ...this.proper().paths.choices.map((sub) => sub.id)) + 1;
    this.execute('nuovo sottopercorso', (draft) => {
      for (const sub of draft.paths.choices) if (trigger !== null && sub.trigger === trigger) sub.trigger = null;
      draft.paths.choices.push({ id, frame, trigger, choicePath: [] });
    });
    return id;
  }

  removeSubPath(id: number): void {
    this.execute('elimina sottopercorso', (draft) => {
      draft.paths.choices = draft.paths.choices.filter((sub) => sub.id !== id);
    });
  }

  /** Un elemento avvia al massimo un sottopercorso. */
  setSubPathTrigger(id: number, trigger: number | null): void {
    this.execute('modifica avvio sottopercorso', (draft) => {
      for (const sub of draft.paths.choices) {
        if (sub.id === id) sub.trigger = trigger;
        else if (trigger !== null && sub.trigger === trigger) sub.trigger = null;
      }
    });
  }

  /** Aggiunge il frame al sottopercorso, togliendolo dagli altri percorsi. */
  addToSubPath(id: number, frameId: number): void {
    this.execute('aggiungi a sottopercorso', (draft) => {
      const sub = draft.paths.choices.find((s) => s.id === id);
      if (!sub || sub.frame === frameId || sub.choicePath.includes(frameId)) return;
      removeFromPaths(draft.paths, frameId);
      const frame = draft.frames.find((f) => f.id === frameId);
      if (frame) frame.bookmark = 0;
      sub.choicePath.push(frameId);
    });
  }

  removeFromSubPath(id: number, frameId: number): void {
    this.execute('rimuovi da sottopercorso', (draft) => {
      const sub = draft.paths.choices.find((s) => s.id === id);
      if (sub) sub.choicePath = sub.choicePath.filter((f) => f !== frameId);
    });
  }

  moveInSubPath(id: number, from: number, to: number): void {
    this.execute('modifica sottopercorso', (draft) => {
      const sub = draft.paths.choices.find((s) => s.id === id);
      if (!sub) return;
      const [frameId] = sub.choicePath.splice(from, 1);
      sub.choicePath.splice(to, 0, frameId);
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
