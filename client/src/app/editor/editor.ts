/*
 * Name : Matteo Busetto, Giovanni Venturelli, Manuel Fossa
 * Module : Controller::editController
 * Description:
 *   Pagina di modifica di una presentazione: inserimento, spostamento, ridimensionamento
 *   e rotazione degli elementi, sfondi, percorso principale e bookmark.
 */
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
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
  MediaType,
  SlideElement,
  TextElement,
  allElements,
  findElement,
  mediaSrc,
  toHexColor,
} from '../model/presentation';
import { ElementPointerEvent, SlideCanvas, TextCommitEvent } from '../shared/slide-canvas';
import { Size, Target, cssMatrix, overviewMatrix, viewMatrix } from '../shared/view-transform';
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

const AUTOSAVE_MS = 30_000;
const MIN_SIZE = 10;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

const isInside = (outer: SlideElement, inner: SlideElement) =>
  inner.xIndex >= outer.xIndex &&
  inner.yIndex >= outer.yIndex &&
  inner.xIndex + inner.width <= outer.xIndex + outer.width &&
  inner.yIndex + inner.height <= outer.yIndex + outer.height;

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
  protected readonly pathsOpen = signal(false);
  protected readonly highlightId = signal<number | null>(null);
  protected readonly uploading = signal(0);
  private readonly viewportSize = signal<Size>({ width: 1, height: 1 });
  private readonly zoomTarget = signal<Target | null>(null);
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

  private readonly matrix = computed(() => {
    const proper = this.proper();
    const viewport = this.viewportSize();
    const target = this.zoomTarget();
    if (target) return viewMatrix(viewport, target, 0.8);
    return proper ? overviewMatrix(viewport, proper.background, 0.98) : new DOMMatrix();
  });
  protected readonly canvasTransform = computed(() => cssMatrix(this.matrix()));
  protected readonly zoomed = computed(() => this.zoomTarget() !== null);

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

  /** Punto della tela sotto il puntatore. */
  private toCanvas(event: { clientX: number; clientY: number }): DOMPoint {
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    return this.matrix().inverse().transformPoint(new DOMPoint(event.clientX - rect.left, event.clientY - rect.top));
  }

  /** Centro dell'area visibile, in coordinate della tela. */
  private viewCenter(): DOMPoint {
    const { width, height } = this.viewportSize();
    return this.matrix().inverse().transformPoint(new DOMPoint(width / 2, height / 2));
  }

  protected zoomOut(): void {
    this.zoomTarget.set(null);
  }

  protected toggleZoom(element: SlideElement): void {
    this.zoomTarget.set(this.zoomTarget() ? null : { ...element });
  }

  // ---------------------------------------------------------------- selezione, spostamento, ridimensionamento

  protected onViewportPointerDown(event: PointerEvent): void {
    if (!(event.target as HTMLElement).closest('.element')) {
      this.blurActive();
      this.store.selectedId.set(null);
    }
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
    const start = this.toCanvas(event);
    // spostando un frame si spostano anche gli elementi contenuti al suo interno
    const contained =
      element.type === 'frame' ? allElements(proper).filter((el) => el.id !== element.id && isInside(element, el)) : [];
    const moving = [element, ...contained];

    this.track(
      (e) => {
        const p = this.toCanvas(e);
        const dx = clamp(element.xIndex + p.x - start.x, 0, width - element.width) - element.xIndex;
        const dy = clamp(element.yIndex + p.y - start.y, 0, height - element.height) - element.yIndex;
        this.store.preview((draft) => {
          for (const original of moving) {
            const el = findElement(draft, original.id);
            if (el) {
              el.xIndex = Math.round(original.xIndex + dx);
              el.yIndex = Math.round(original.yIndex + dy);
            }
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
    const start = this.toCanvas(event);
    const ratio = element.width / Math.max(element.height, 1);
    const angle = (-element.rotation * Math.PI) / 180;
    const keepRatio = element.type !== 'text';

    this.track(
      (e) => {
        const p = this.toCanvas(e);
        // spostamento del puntatore nel sistema di riferimento (ruotato) dell'elemento
        const dx = (p.x - start.x) * Math.cos(angle) - (p.y - start.y) * Math.sin(angle);
        const dy = (p.x - start.x) * Math.sin(angle) + (p.y - start.y) * Math.cos(angle);
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
      if (this.zoomTarget()) this.zoomOut();
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
    } as Omit<FrameElement, 'id' | 'zIndex'>);
  }

  protected insertText(): void {
    const { width: w, height: h } = this.store.proper().background;
    const width = Math.round(w * 0.15);
    const height = Math.round(w * 0.05);
    const center = this.viewCenter();
    const id = this.store.insert({
      type: 'text',
      xIndex: Math.round(clamp(center.x - width / 2, 0, w - width)),
      yIndex: Math.round(clamp(center.y - height / 2, 0, h - height)),
      width,
      height,
      rotation: 0,
      content: '',
      font: DEFAULT_TEXT_FONT,
      fontSize: 1,
      color: 'black',
    } as Omit<TextElement, 'id' | 'zIndex'>);
    // il testo riceve il focus quando il menu di inserimento è chiuso del tutto
    this.pendingFocus = id;
  }

  private pendingFocus: number | null = null;

  protected onInsertMenuClosed(): void {
    const id = this.pendingFocus;
    this.pendingFocus = null;
    if (id === null) return;
    setTimeout(() =>
      this.viewport().nativeElement.querySelector<HTMLTextAreaElement>(`[data-element-id="${id}"] textarea`)?.focus(),
    );
  }

  protected onFilesSelected(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.insertMedia(files, this.viewCenter());
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

  private async insertMedia(files: File[], at: DOMPoint): Promise<void> {
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
        this.store.insert({
          type,
          url,
          xIndex: Math.round(clamp(at.x - size.width / 2 + offset, 0, w - size.width)),
          yIndex: Math.round(clamp(at.y - size.height / 2 + offset, 0, h - size.height)),
          width: Math.round(size.width),
          height: Math.round(size.height),
          rotation: 0,
        } as Omit<SlideElement, 'id' | 'zIndex'>);
      } catch (err) {
        this.notify.error(err);
      } finally {
        this.uploading.update((n) => n - 1);
      }
    }
  }

  /** Carica un'immagine da usare come sfondo e ne restituisce l'indirizzo. */
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

  // ---------------------------------------------------------------- elemento selezionato

  protected remove(): void {
    const el = this.selected();
    if (el) this.store.remove(el.id);
  }

  protected changeLayer(direction: 1 | -1): void {
    const el = this.selected();
    if (el) this.store.changeLayer(el.id, direction);
  }

  protected rotate(value: number): void {
    const el = this.selected();
    if (el) this.store.update(el.id, 'ruota elemento', (x) => (x.rotation = value), `rotate-${el.id}`);
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
    this.zoomTarget.set({ ...frame });
  }
}
