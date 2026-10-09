/*
 * Name : Matteo Busetto, Giovanni Venturelli, Manuel Fossa
 * Module : Controller::editController
 * Description:
 *   Pagina di modifica di una presentazione: inserimento, spostamento, ridimensionamento
 *   e rotazione degli elementi, sfondi, percorso principale e bookmark.
 */
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { PresentationApi, UploadService } from '../core/presentation-api.service';
import {
  DEFAULT_TEXT_FONT,
  FrameElement,
  FrameImageFit,
  MediaType,
  Proper,
  SlideElement,
  SubPath,
  TextElement,
  allElements,
  anchorChain,
  byLayer,
  findElement,
  mediaSrc,
  newAnchor,
  pathOf,
  planeMatrix,
  toFrameLocal,
  toHexColor,
} from '../model/presentation';
import { ElementPointerEvent, SlideCanvas, TextCommitEvent } from '../shared/slide-canvas';
import {
  CameraAnimator,
  Size,
  cameraFor,
  cameraMatrix,
  focusCamera,
  perspectiveFor,
  sameCamera,
  unproject,
} from '../shared/view-transform';
import { EditorStore } from './editor-store';

export const FONTS = [
  "'Times New Roman', Times, serif",
  'Georgia, serif',
  "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  'Verdana, Geneva, sans-serif',
  'Arial, Helvetica, sans-serif',
  "'Arial Black', Gadget, sans-serif",
  "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
  'Tahoma, Geneva, sans-serif',
  "'Comic Sans MS', cursive, sans-serif",
  'Impact, Charcoal, sans-serif',
  "'Trebuchet MS', Helvetica, sans-serif",
  "'Courier New', Courier, monospace",
  "'Lucida Console', Monaco, monospace",
].map((value) => ({ value, label: value.split(',')[0].replace(/'/g, '') }));

const KIND_LABELS: Record<string, string> = {
  frame: 'Frame',
  text: 'Testo',
  image: 'Immagine',
  video: 'Video',
  audio: 'Audio',
  SVG: 'Forma',
};

const KIND_ICONS: Record<string, string> = {
  frame: 'frame',
  text: 'type',
  image: 'image',
  video: 'video',
  audio: 'music',
};

type PanelTab = 'paths' | 'frames';

const AUTOSAVE_MS = 30_000;
const MIN_SIZE = 10;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/** Il punto (in coordinate della tela) cade dentro al frame, anche se ruotato. */
const isOnFrame = (frame: FrameElement, x: number, y: number) => {
  const p = toFrameLocal(frame, x, y);
  return p.x >= 0 && p.y >= 0 && p.x <= frame.width && p.y <= frame.height;
};

export const FRAME_FITS: { value: FrameImageFit; label: string }[] = [
  { value: 'cover', label: 'Riempi (cover)' },
  { value: 'contain', label: 'Adatta (fit)' },
  { value: 'fill', label: 'Estendi (deforma)' },
];

/** Dimensioni naturali di un'immagine o di un video. */
function naturalSize(type: MediaType, src: string): Promise<Size | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000);
    const done = (size: Size | null) => {
      clearTimeout(timeout);
      resolve(size && size.width > 0 && size.height > 0 ? size : null);
    };
    if (type === 'image') {
      const img = new Image();
      img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => done(null);
      img.src = src;
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => done({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => done(null);
      video.src = src;
    } else done(null);
  });
}

@Component({
  selector: 'app-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorStore],
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSliderModule,
    MatTooltipModule,
    SlideCanvas,
  ],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class Editor implements OnInit {
  /** Titolo della presentazione, dal parametro della rotta. */
  readonly title = input.required<string>();

  protected readonly store = inject(EditorStore);
  private readonly api = inject(PresentationApi);
  private readonly uploader = inject(UploadService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  protected readonly fonts = FONTS;
  protected readonly frameFits = FRAME_FITS;
  protected readonly pathsOpen = signal(false);
  protected readonly panelTab = signal<PanelTab>('paths');
  /** sottopercorso aperto nel pannello */
  protected readonly expandedSub = signal<number | null>(null);
  /** ridimensionando un frame se ne mantengono le proporzioni (Maiusc inverte la scelta) */
  protected readonly keepFrameRatio = signal(true);
  /** i nuovi elementi vengono associati al frame selezionato o inquadrato */
  protected readonly attachOnInsert = signal(true);
  protected readonly highlightId = signal<number | null>(null);
  protected readonly uploading = signal(0);
  private readonly viewportSize = signal<Size>({ width: 1, height: 1 });
  /** elemento inquadrato, con lo stato della presentazione al momento dello zoom (la vista non lo insegue) */
  private readonly zoom = signal<{ proper: Proper; element: SlideElement } | null>(null);
  private readonly zoomedId = computed(() => this.zoom()?.element.id ?? null);
  /** le transizioni della vista partono solo dopo il primo adattamento, per non animare il caricamento */
  protected readonly animated = signal(false);
  private keyMoveSession = 0;

  protected readonly proper = this.store.current;
  protected readonly selected = this.store.selected;
  protected readonly selectedText = computed(() => {
    const el = this.selected();
    return el?.type === 'text' ? el : null;
  });
  protected readonly selectedFrame = computed(() => {
    const el = this.selected();
    return el?.type === 'frame' ? el : null;
  });
  protected readonly selectedInPath = computed(() => {
    const frame = this.selectedFrame();
    return !!frame && this.store.mainPath().includes(frame.id);
  });
  /** percorso del frame selezionato: 'main', id del sottopercorso o null */
  protected readonly selectedPath = computed(() => {
    const frame = this.selectedFrame();
    const proper = this.proper();
    return frame && proper ? pathOf(proper.paths, frame.id) : null;
  });

  /** frame di cui la lista dei frame mostra gli elementi: quello selezionato o quello dell'elemento selezionato */
  protected readonly focusFrameId = computed(() => {
    const el = this.selected();
    return el?.type === 'frame' ? el.id : (el?.anchor?.frame ?? null);
  });

  /** Elementi associati direttamente al frame, dal livello più alto. */
  protected childrenOf(frameId: number): SlideElement[] {
    const proper = this.proper();
    return proper ? byLayer(proper).reverse().filter((el) => el.anchor?.frame === frameId) : [];
  }

  /** tutti i frame, con il percorso a cui appartengono */
  protected readonly frameList = computed(() => {
    const proper = this.proper();
    if (!proper) return [];
    return [...proper.frames]
      .sort((a, b) => a.id - b.id)
      .map((frame) => {
        const path = pathOf(proper.paths, frame.id);
        const step = path === 'main' ? proper.paths.main.indexOf(frame.id) + 1 : null;
        return { frame, path, step, children: this.childrenOf(frame.id).length };
      });
  });

  protected readonly subPaths = computed(() => {
    const proper = this.proper();
    return (proper?.paths.choices ?? []).map((sub) => ({
      sub,
      originInMain: proper!.paths.main.includes(sub.frame),
    }));
  });

  /** frame del percorso principale da cui l'elemento selezionato può avviare un sottopercorso */
  protected readonly subPathOrigin = computed(() => {
    const proper = this.proper();
    const el = this.selected();
    if (!proper || !el) return null;
    if (el.type === 'frame' && proper.paths.main.includes(el.id)) return el.id;
    return anchorChain(proper, el).find((id) => proper.paths.main.includes(id)) ?? null;
  });

  /** sottopercorso avviato dall'elemento selezionato */
  protected readonly selectedTriggerOf = computed(() => {
    const id = this.store.selectedId();
    return this.proper()?.paths.choices.find((sub) => sub.trigger === id) ?? null;
  });

  protected readonly triggerIds = computed(() =>
    (this.proper()?.paths.choices ?? []).map((sub) => sub.trigger).filter((id): id is number => id !== null),
  );

  /** frame a cui è associato l'elemento selezionato */
  protected readonly anchorFrameId = computed(() => this.selected()?.anchor?.frame ?? null);
  /** frame a cui si può associare l'elemento selezionato */
  protected readonly attachableFrames = computed(() => {
    const proper = this.proper();
    const el = this.selected();
    return proper && el ? proper.frames.filter((frame) => this.store.canAttach(proper, el.id, frame.id)) : [];
  });
  /** frame a cui associare gli elementi inseriti: quello selezionato, quello dell'elemento selezionato o quello inquadrato */
  protected readonly insertFrameTarget = computed(() => {
    const proper = this.proper();
    const el = this.selected();
    const zoomed = this.zoom()?.element;
    const id = el?.type === 'frame' ? el.id : (el?.anchor?.frame ?? (zoomed?.type === 'frame' ? zoomed.id : null));
    return proper?.frames.find((frame) => frame.id === id) ?? null;
  });

  protected kindLabel(element: SlideElement): string {
    return KIND_LABELS[element.type] ?? 'Elemento';
  }

  protected isBookmarked(id: number): boolean {
    return !!this.proper()?.frames.find((frame) => frame.id === id)?.bookmark;
  }

  protected readonly isMedia = computed(() => {
    const type = this.selected()?.type;
    return type === 'audio' || type === 'video';
  });

  /** inquadratura richiesta; quella mostrata la raggiunge con CameraAnimator */
  private readonly camera = computed(() => {
    const proper = this.proper();
    const viewport = this.viewportSize();
    // un frame inclinato (o un elemento che sta su di lui) si vede di fronte
    const zoom = this.zoom();
    if (zoom) return focusCamera(viewport, zoom.proper, zoom.element, 0.8);
    return proper ? cameraFor(viewport, { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background }, 0.98) : null;
  }, { equal: sameCamera });
  private readonly matrix = computed(() => {
    const camera = this.camera();
    const viewport = this.viewportSize();
    return camera ? cameraMatrix(viewport, camera, perspectiveFor(viewport)) : new DOMMatrix();
  });
  private readonly animator = new CameraAnimator({ min: 350, max: 900, perUnit: 400 });
  protected readonly canvasTransform = this.animator.transform;
  protected readonly canvasZoom = this.animator.zoom;
  protected readonly zoomed = computed(() => this.zoom() !== null);

  protected readonly backgroundHex = computed(() => toHexColor(this.proper()?.background.color ?? ''));
  protected readonly frameHex = computed(() => toHexColor(this.selectedFrame()?.color ?? ''));
  protected readonly textHex = computed(() => toHexColor(this.selectedText()?.color ?? '', '#000000'));

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.viewport().nativeElement;
      const measure = () =>
        this.viewportSize.set({ width: element.clientWidth || 1, height: element.clientHeight || 1 });
      const observer = new ResizeObserver(() => {
        measure();
        if (!this.animated()) setTimeout(() => this.animated.set(true), 100);
      });
      measure();
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // la vista si sposta con un'animazione solo dopo la prima misura e se la finestra non è cambiata
    let lastViewport: Size | null = null;
    effect(() => {
      const camera = this.camera();
      const viewport = this.viewportSize();
      if (!camera) return;
      untracked(() => this.animator.moveTo(viewport, camera, this.animated() && viewport === lastViewport));
      lastViewport = viewport;
    });
    destroyRef.onDestroy(() => this.animator.stop());

    const autosave = setInterval(() => this.autosave(), AUTOSAVE_MS);
    destroyRef.onDestroy(() => {
      clearInterval(autosave);
      this.autosave();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const { presentation, raw } = await this.api.get(this.title());
      this.store.load(presentation, raw);
    } catch (err) {
      this.notify.error(err);
      this.router.navigate(['/private/home']);
    }
  }

  // ---------------------------------------------------------------- salvataggio ed esecuzione

  protected async save(): Promise<void> {
    try {
      await this.store.save();
      this.notify.info('Salvato con successo');
    } catch (err) {
      this.notify.error(err);
    }
  }

  private autosave(): void {
    if (this.store.loaded() && this.store.dirty()) this.store.save().catch((err) => this.notify.error(err));
  }

  protected async execute(): Promise<void> {
    try {
      await this.store.save();
      this.router.navigate(['/private/execution', this.store.title()]);
    } catch (err) {
      this.notify.error(err);
    }
  }

  protected goHome(): void {
    this.router.navigate(['/private/home']);
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.store.dirty()) event.preventDefault();
  }

  // ---------------------------------------------------------------- coordinate e vista

  /**
   * Punto sotto il puntatore, in coordinate della tela: proiettato sul piano su cui si muove
   * `element` (che può essere inclinato in 3D) o, senza elemento, su quello dell'elemento inquadrato.
   */
  private toCanvas(event: { clientX: number; clientY: number }, element?: SlideElement): { x: number; y: number } {
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    return unproject(this.matrix().multiply(this.plane(element)), event.clientX - rect.left, event.clientY - rect.top);
  }

  private plane(element?: SlideElement): DOMMatrix {
    const proper = this.store.proper();
    if (element) return planeMatrix(proper, element);
    const zoomed = this.zoomedId();
    const target = zoomed === null ? undefined : findElement(proper, zoomed);
    return target ? planeMatrix(proper, target, true) : new DOMMatrix();
  }

  /** Centro dell'area visibile, in coordinate della tela. */
  private viewCenter(): { x: number; y: number } {
    const { width, height } = this.viewportSize();
    return unproject(this.matrix().multiply(this.plane()), width / 2, height / 2);
  }

  protected zoomOut(): void {
    this.zoom.set(null);
  }

  /**
   * Doppio clic su un elemento: un testo entra in modifica; gli altri elementi vengono
   * inquadrati (o, se sono già quelli inquadrati, si torna alla vista d'insieme).
   */
  protected onElementDblClick(element: SlideElement): void {
    if (element.type === 'text') {
      this.editText(element.id);
      return;
    }
    if (this.zoomedId() === element.id) this.zoomOut();
    else this.zoomTo(element);
  }

  protected readonly editingId = signal<number | null>(null);

  /** Mette il testo in modifica e gli dà il focus. */
  private editText(id: number): void {
    this.store.selectedId.set(id);
    this.editingId.set(id);
    // il focus dopo che la casella di testo ha ricevuto i clic (classe editing)
    setTimeout(() => {
      const area = this.viewport().nativeElement.querySelector<HTMLTextAreaElement>(`[data-element-id="${id}"] textarea`);
      area?.focus();
    });
  }

  private zoomTo(element: SlideElement): void {
    this.zoom.set({ proper: this.store.proper(), element });
  }

  // ---------------------------------------------------------------- selezione, spostamento, ridimensionamento

  protected onViewportPointerDown(event: PointerEvent): void {
    if (!(event.target as HTMLElement).closest('.element')) {
      this.blurActive();
      this.store.selectedId.set(null);
    }
  }

  /** Doppio clic fuori dagli elementi: torna alla vista d'insieme. */
  protected onViewportDblClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.element')) this.zoomOut();
  }

  private blurActive(): void {
    (document.activeElement as HTMLElement | null)?.blur?.();
  }

  protected onElementPointerDown({ event, element }: ElementPointerEvent): void {
    if (event.button !== 0) return;
    this.store.selectedId.set(element.id);
    if (event.target instanceof HTMLTextAreaElement) return; // si sta scrivendo nel testo

    event.preventDefault();
    this.blurActive();

    const proper = this.store.proper();
    const { width, height } = proper.background;
    const start = this.toCanvas(event, element);

    // gli elementi associati a un frame lo seguono da soli (EditorStore.preview)
    this.track(
      (e) => {
        const p = this.toCanvas(e, element);
        this.store.preview((draft) => {
          const el = findElement(draft, element.id);
          if (el) {
            el.xIndex = Math.round(clamp(element.xIndex + p.x - start.x, 0, width - element.width));
            el.yIndex = Math.round(clamp(element.yIndex + p.y - start.y, 0, height - element.height));
          }
        });
      },
      () => this.store.commit('sposta elemento', proper),
    );
  }

  protected onResizePointerDown({ event, element }: ElementPointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.blurActive();

    const before = this.store.proper();
    const start = this.toCanvas(event, element);
    const ratio = element.width / Math.max(element.height, 1);
    const angle = (-element.rotation * Math.PI) / 180;
    const ratioByDefault = element.type === 'frame' ? this.keepFrameRatio() : element.type !== 'text';

    this.track(
      (e) => {
        const p = this.toCanvas(e, element);
        // spostamento del puntatore nel sistema di riferimento (ruotato) dell'elemento
        const dx = (p.x - start.x) * Math.cos(angle) - (p.y - start.y) * Math.sin(angle);
        const dy = (p.x - start.x) * Math.sin(angle) + (p.y - start.y) * Math.cos(angle);
        const keepRatio = ratioByDefault !== e.shiftKey;
        const width = Math.max(MIN_SIZE, element.width + dx);
        const height = keepRatio ? width / ratio : Math.max(MIN_SIZE, element.height + dy);
        this.store.preview((draft) => {
          const el = findElement(draft, element.id);
          if (el) {
            el.width = Math.round(width);
            el.height = Math.round(height);
          }
        });
      },
      () => this.store.commit('ridimensiona elemento', before),
    );
  }

  /** Segue il puntatore fino al rilascio. */
  private track(move: (e: PointerEvent) => void, end: () => void): void {
    const onMove = (e: PointerEvent) => move(e);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      end();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  protected onTextCommit({ id, content }: TextCommitEvent): void {
    if (this.editingId() === id) this.editingId.set(null);
    this.store.setContent(id, content);
  }

  // ---------------------------------------------------------------- tastiera

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.store.loaded()) return;
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.save();
      return;
    }
    if (isTyping(event.target)) return;

    if (ctrl && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) this.store.redo();
      else this.store.undo();
      return;
    }
    if (ctrl && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.store.redo();
      return;
    }

    const selected = this.selected();
    if (event.key === 'Escape') {
      if (this.zoom()) this.zoomOut();
      else this.store.selectedId.set(null);
      return;
    }
    if (!selected) return;

    if (event.key === 'Delete') {
      this.store.remove(selected.id);
      return;
    }

    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const { width, height } = this.store.proper().background;
    this.store.update(
      selected.id,
      'sposta elemento',
      (el) => {
        el.xIndex = clamp(el.xIndex + move[0], 0, width - el.width);
        el.yIndex = clamp(el.yIndex + move[1], 0, height - el.height);
      },
      `key-move-${selected.id}-${this.keyMoveSession}`,
    );
  }

  protected onKeyUp(event: KeyboardEvent): void {
    // ogni sequenza di frecce diventa una sola voce di annullamento
    if (event.key.startsWith('Arrow')) this.keyMoveSession++;
  }

  // ---------------------------------------------------------------- inserimento

  protected insertFrame(): void {
    const { width: w, height: h } = this.store.proper().background;
    const size = Math.round(w * 0.12);
    const center = this.viewCenter();
    this.store.insert({
      type: 'frame',
      xIndex: Math.round(clamp(center.x - size / 2, 0, w - size)),
      yIndex: Math.round(clamp(center.y - size / 2, 0, h - size)),
      width: size,
      height: size,
      rotation: 0,
      bookmark: 0,
      ref: '',
      color: 'rgba(255,255,255,0)',
      fit: 'cover',
      rotateX: 0,
      rotateY: 0,
    } as Omit<FrameElement, 'id' | 'zIndex'>);
  }

  /** Frame a cui associare un elemento inserito nel punto `at` (o al centro della vista). */
  private frameForInsert(at?: { x: number; y: number }): FrameElement | null {
    if (!this.attachOnInsert()) return null;
    if (!at) return this.insertFrameTarget();
    // trascinando un file si usa il frame più in alto sotto il puntatore
    return [...this.store.proper().frames]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((frame) => isOnFrame(frame, at.x, at.y)) ?? null;
  }

  /**
   * Posizione di un nuovo elemento di dimensioni `size` centrato in `at`. Associato a un frame
   * ne prende la rotazione e, se serve, viene rimpicciolito (di `scale`) per starci dentro.
   */
  private placement(size: Size, at: { x: number; y: number }, frame: FrameElement | null) {
    const { width: w, height: h } = this.store.proper().background;
    const scale = frame ? Math.min(1, (frame.width * 0.8) / size.width, (frame.height * 0.8) / size.height) : 1;
    const width = Math.max(MIN_SIZE, Math.round(size.width * scale));
    const height = Math.max(MIN_SIZE, Math.round(size.height * scale));
    const x = at.x - width / 2;
    const y = at.y - height / 2;
    return {
      scale,
      geometry: {
        xIndex: Math.round(frame ? x : clamp(x, 0, w - width)),
        yIndex: Math.round(frame ? y : clamp(y, 0, h - height)),
        width,
        height,
        rotation: frame?.rotation ?? 0,
        ...(frame ? { anchor: newAnchor(frame.id) } : {}),
      },
    };
  }

  private frameCenter(frame: FrameElement) {
    return { x: frame.xIndex + frame.width / 2, y: frame.yIndex + frame.height / 2 };
  }

  protected insertText(): void {
    const w = this.store.proper().background.width;
    const frame = this.frameForInsert();
    const { scale, geometry } = this.placement(
      { width: w * 0.15, height: w * 0.05 },
      frame ? this.frameCenter(frame) : this.viewCenter(),
      frame,
    );
    const id = this.store.insert({
      type: 'text',
      ...geometry,
      content: '',
      font: DEFAULT_TEXT_FONT,
      fontSize: Math.round(scale * 100) / 100 || 0.1,
      color: 'black',
    } as Omit<TextElement, 'id' | 'zIndex'>);
    // il testo riceve il focus quando il menu di inserimento è chiuso del tutto
    this.pendingFocus = id;
  }

  private pendingFocus: number | null = null;

  protected onInsertMenuClosed(): void {
    const id = this.pendingFocus;
    this.pendingFocus = null;
    if (id !== null) this.editText(id);
  }

  protected onFilesSelected(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.insertMedia(files);
  }

  protected onDragOver(event: DragEvent): void {
    if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.length || !this.store.loaded()) return;
    event.preventDefault();
    this.insertMedia(files, this.toCanvas(event));
  }

  /** Inserisce i file nel punto `at` della tela o, senza punto, al centro della vista o del frame selezionato. */
  private async insertMedia(files: File[], at?: { x: number; y: number }): Promise<void> {
    // il frame va scelto subito: durante il caricamento la selezione può cambiare
    const frame = this.frameForInsert(at);
    const center = at ?? (frame ? this.frameCenter(frame) : this.viewCenter());
    for (const [index, file] of files.entries()) {
      this.uploading.update((n) => n + 1);
      try {
        const { type, url } = await this.uploader.upload(file);
        const { width: w, height: h } = this.store.proper().background;
        const natural = await naturalSize(type, mediaSrc(url));

        let size: Size;
        if (type === 'audio') size = { width: w * 0.1, height: w * 0.1 };
        else {
          const fallback = type === 'video' ? { width: 16, height: 9 } : { width: 1, height: 1 };
          const { width, height } = natural ?? fallback;
          const scale = Math.min((w * (type === 'video' ? 0.2 : 0.25)) / width, (h * 0.4) / height, natural ? 1 : Infinity);
          size = { width: width * scale, height: height * scale };
        }
        const offset = index * 20;
        // il frame potrebbe essere stato eliminato durante il caricamento
        const target = frame && this.store.proper().frames.find((f) => f.id === frame.id);
        const { geometry } = this.placement(size, { x: center.x + offset, y: center.y + offset }, target ?? null);
        this.store.insert({ type, url, ...geometry } as Omit<SlideElement, 'id' | 'zIndex'>);
      } catch (err) {
        this.notify.error(err);
      } finally {
        this.uploading.update((n) => n - 1);
      }
    }
  }

  /** Carica un'immagine da usare come sfondo e ne restituisce l'indirizzo nell'archivio. */
  private async uploadImage(input: HTMLInputElement): Promise<string | null> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      this.notify.error('Scegliere un file immagine');
      return null;
    }
    this.uploading.update((n) => n + 1);
    try {
      return (await this.uploader.upload(file)).url;
    } catch (err) {
      this.notify.error(err);
      return null;
    } finally {
      this.uploading.update((n) => n - 1);
    }
  }

  // ---------------------------------------------------------------- sfondi

  protected setBackgroundColor(color: string): void {
    this.store.setBackground({ color });
  }

  protected async setBackgroundImage(input: HTMLInputElement): Promise<void> {
    const url = await this.uploadImage(input);
    if (url) this.store.setBackground({ image: url });
  }

  protected removeBackground(): void {
    this.store.setBackground({ color: 'rgb(255,255,255)', image: '' }, 'elimina sfondo presentazione');
  }

  protected setFrameColor(color: string): void {
    const frame = this.selectedFrame();
    if (frame) this.store.setFrameBackground(frame.id, { color });
  }

  protected async setFrameImage(input: HTMLInputElement): Promise<void> {
    const frame = this.selectedFrame();
    const url = await this.uploadImage(input);
    if (frame && url) this.store.setFrameBackground(frame.id, { ref: url });
  }

  protected removeFrameBackground(): void {
    const frame = this.selectedFrame();
    if (frame) this.store.setFrameBackground(frame.id, { color: '', ref: '' });
  }

  protected setFrameFit(fit: FrameImageFit): void {
    const frame = this.selectedFrame();
    if (frame) this.store.setFrameBackground(frame.id, { fit });
  }

  // ---------------------------------------------------------------- associazione ai frame

  protected attachTo(frameId: number | null): void {
    const el = this.selected();
    if (el) this.store.attach([el.id], frameId);
  }

  /** Associa al frame selezionato gli elementi non ancora associati che hanno il centro sopra di esso. */
  protected attachElementsOnFrame(): void {
    const frame = this.selectedFrame();
    if (!frame) return;
    const proper = this.store.proper();
    const area = frame.width * frame.height;
    const ids = allElements(proper)
      .filter(
        (el) =>
          !el.anchor &&
          el.id !== frame.id &&
          // un frame più grande contiene questo, non il contrario
          (el.type !== 'frame' || el.width * el.height < area) &&
          isOnFrame(frame, el.xIndex + el.width / 2, el.yIndex + el.height / 2) &&
          this.store.canAttach(proper, el.id, frame.id),
      )
      .map((el) => el.id);
    if (ids.length) this.store.attach(ids, frame.id, 'associa elementi al frame');
    this.notify.info(
      ids.length === 0 ? 'Nessun elemento da associare' : ids.length === 1 ? 'Associato 1 elemento' : `Associati ${ids.length} elementi`,
    );
  }

  // ---------------------------------------------------------------- elemento selezionato

  protected remove(): void {
    const el = this.selected();
    if (el) this.store.remove(el.id);
  }

  protected changeLayer(direction: 1 | -1): void {
    const el = this.selected();
    if (el) this.store.changeLayer(el.id, direction);
  }

  /** Rotazione sul piano o, per i frame, inclinazione 3D; segue lo slider mentre si trascina. */
  protected rotate(axis: 'rotation' | 'rotateX' | 'rotateY', value: number): void {
    const el = this.selected();
    if (!el || !Number.isFinite(value) || (axis !== 'rotation' && el.type !== 'frame')) return;
    this.store.update(el.id, 'ruota elemento', (x) => ((x as FrameElement)[axis] = value), `rotate-${el.id}-${axis}`);
  }

  protected resetTilt(): void {
    const frame = this.selectedFrame();
    if (frame)
      this.store.update<FrameElement>(frame.id, 'azzera rotazione 3D', (el) => {
        el.rotateX = 0;
        el.rotateY = 0;
      });
  }

  protected setTextColor(color: string): void {
    const text = this.selectedText();
    if (text) this.store.update<TextElement>(text.id, 'modifica colore testo', (el) => (el.color = color), `text-color-${text.id}`);
  }

  protected setFontSize(value: number): void {
    const text = this.selectedText();
    if (text && value > 0)
      this.store.update<TextElement>(text.id, 'modifica font', (el) => (el.fontSize = value), `font-size-${text.id}`);
  }

  protected setFont(font: string): void {
    const text = this.selectedText();
    if (text) this.store.update<TextElement>(text.id, 'modifica font', (el) => (el.font = font));
  }

  protected toggleMedia(): void {
    const el = this.selected();
    if (!el) return;
    const media = this.viewport().nativeElement.querySelector<HTMLMediaElement>(
      `[data-element-id="${el.id}"] video, [data-element-id="${el.id}"] audio`,
    );
    if (!media) return;
    if (media.paused) media.play().catch((err) => this.notify.error(err));
    else media.pause();
  }

  // ---------------------------------------------------------------- percorso principale

  protected addToMainPath(): void {
    const frame = this.selectedFrame();
    if (frame) this.store.addToMainPath(frame.id);
  }

  protected removeFromMainPath(id: number): void {
    this.store.removeFromMainPath(id);
  }

  protected toggleBookmark(): void {
    const frame = this.selectedFrame();
    if (frame) this.store.toggleBookmark(frame.id);
  }

  protected reorderPath(event: CdkDragDrop<number[]>): void {
    if (event.previousIndex !== event.currentIndex) this.store.moveInMainPath(event.previousIndex, event.currentIndex);
  }

  protected focusFrame(id: number): void {
    const frame = this.store.proper().frames.find((f) => f.id === id);
    if (!frame) return;
    this.store.selectedId.set(id);
    this.zoomTo(frame);
  }

  protected select(id: number): void {
    this.blurActive();
    this.store.selectedId.set(id);
  }

  protected openPanel(tab: PanelTab): void {
    this.panelTab.set(tab);
    this.pathsOpen.set(true);
  }

  // ---------------------------------------------------------------- elementi del frame

  /** Riordina trascinando gli elementi associati al frame espanso nella lista dei frame. */
  protected reorderChildren(frameId: number, event: CdkDragDrop<SlideElement[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const ids = this.childrenOf(frameId).map((el) => el.id);
    moveItemInArray(ids, event.previousIndex, event.currentIndex);
    this.store.reorderChildren(frameId, ids);
  }

  // ---------------------------------------------------------------- sottopercorsi

  /** Nuovo sottopercorso avviato dall'elemento selezionato (o dal frame selezionato, scegliendo dopo l'elemento). */
  protected newSubPath(): void {
    const el = this.selected();
    const origin = this.subPathOrigin();
    if (!el || origin === null) return;
    const id = this.store.createSubPath(origin, el.type === 'frame' && el.id === origin ? null : el.id);
    this.expandedSub.set(id);
    this.openPanel('paths');
  }

  protected showSubPath(id: number): void {
    this.expandedSub.set(id);
    this.openPanel('paths');
  }

  protected addToSubPath(subId: number): void {
    const frame = this.selectedFrame();
    if (frame) this.store.addToSubPath(subId, frame.id);
  }

  protected reorderSubPath(subId: number, event: CdkDragDrop<number[]>): void {
    if (event.previousIndex !== event.currentIndex) this.store.moveInSubPath(subId, event.previousIndex, event.currentIndex);
  }

  /** Elementi che possono avviare il sottopercorso: quelli associati (anche indirettamente) al frame di partenza. */
  protected triggerCandidates(sub: SubPath): SlideElement[] {
    const proper = this.proper();
    return proper ? byLayer(proper).reverse().filter((el) => anchorChain(proper, el).includes(sub.frame)) : [];
  }

  protected elementLabel(id: number | null): string {
    const el = id === null ? undefined : findElement(this.store.proper(), id);
    if (!el) return '';
    if (el.type === 'frame') return `Frame ${el.id}`;
    if (el.type === 'text') return el.content.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Testo vuoto';
    if ('url' in el && !el.url.startsWith('data:')) {
      const name = el.url.split('/').pop() ?? '';
      try {
        return decodeURIComponent(name);
      } catch {
        return name;
      }
    }
    return KIND_LABELS[el.type] ?? 'Elemento';
  }

  protected kindIcon(el: SlideElement): string {
    return KIND_ICONS[el.type] ?? 'frame';
  }
}
