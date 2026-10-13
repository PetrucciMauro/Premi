/*
 * Name : Manuel Fossa, Matteo Busetto, Giovanni Venturelli
 * Package : View
 * Description:
 *   Disegna la tela di una presentazione (sfondo, frame ed elementi).
 *   In modalità modificabile emette gli eventi con cui l'editor seleziona, sposta e ridimensiona.
 */
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  BASE_FONT_SIZE,
  FrameElement,
  MediaElement,
  Proper,
  SlideElement,
  TextElement,
  elementTransform,
  tiltLayers,
  mediaSrc,
} from '../model/presentation';
import { Guides } from '../model/arrange';
import { CameraView } from './camera';
import { FloorMode, culledElements, floorMode, floorTiles, hiddenFrom, sameIds, sceneCorners, tileCorners } from './culling';

export interface ElementPointerEvent {
  event: PointerEvent;
  element: SlideElement;
}

export interface TextCommitEvent {
  id: number;
  content: string;
}

@Component({
  selector: 'app-slide-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './slide-canvas.scss',
  host: {
    '[class.editable]': 'editable()',
  },
  // la scena è impaginata alla scala della telecamera (zoom), così testi, bordi e immagini
  // vengono disegnati alla risoluzione con cui si vedono; l'host riceve solo la transform
  template: `
    <div
      class="scene"
      [class.no-floor]="floor() !== 'whole'"
      [style.zoom]="zoom()"
      [style.width.px]="proper().background.width"
      [style.height.px]="proper().background.height"
      [style.font-size.px]="baseFontSize"
      [style.background-color]="floor() === 'whole' ? proper().background.color : null"
      [style.background-image]="floor() === 'whole' ? cssUrl(proper().background.image) : null"
    >
    <!-- con la tela a cavallo dell'occhio della telecamera lo sfondo è diviso in tessere (vedi culling.ts) -->
    @for (tile of tiles(); track $index) {
      <div
        class="floor-tile"
        [style.left.px]="tile.x"
        [style.top.px]="tile.y"
        [style.width.px]="tile.width"
        [style.height.px]="tile.height"
        [style.background-color]="proper().background.color"
        [style.background-image]="cssUrl(proper().background.image)"
        [style.background-size]="proper().background.width + 'px ' + proper().background.height + 'px'"
        [style.background-position]="-tile.x + 'px ' + -tile.y + 'px'"
      ></div>
    }
    @for (el of elements(); track el.type + el.id) {
      <div
        class="element"
        [class]="'element element-' + el.type"
        [class.selected]="selectedIds().includes(el.id)"
        [class.editing]="el.id === editingId()"
        [class.in-path]="el.type === 'frame' && pathIds().includes(el.id)"
        [class.highlighted]="el.id === highlightId()"
        [class.anchor-frame]="el.id === anchorFrameId()"
        [class.trigger]="triggerIds().includes(el.id)"
        [class.culled]="culled().has(el.id)"
        [attr.data-element-id]="el.id"
        [style.left.px]="el.xIndex"
        [style.top.px]="el.yIndex"
        [style.width.px]="el.width"
        [style.height.px]="el.height"
        [style.z-index]="el.zIndex"
        [style.transform]="transforms().get(el.id)"
        [style.background-color]="el.type === 'frame' ? asFrame(el).color : null"
        [style.background-image]="el.type === 'frame' ? cssUrl(asFrame(el).ref) : null"
        [style.background-size]="el.type === 'frame' ? backgroundSize(asFrame(el)) : null"
        (pointerdown)="elementPointerDown.emit({ event: $event, element: el })"
        (dblclick)="elementDblClick.emit(el)"
      >
        @switch (el.type) {
          @case ('text') {
            @let text = asText(el);
            @if (editable()) {
              <textarea
                placeholder="Testo..."
                [value]="text.content"
                [style.color]="text.color"
                [style.font-family]="text.font"
                [style.font-size.em]="text.fontSize"
                (blur)="textCommit.emit({ id: text.id, content: $any($event.target).value })"
              ></textarea>
            } @else {
              <p
                class="text-content"
                [style.color]="text.color"
                [style.font-family]="text.font"
                [style.font-size.em]="text.fontSize"
              >{{ text.content }}</p>
            }
          }
          @case ('image') {
            <img [src]="src(asMedia(el).url)" alt="" draggable="false" />
          }
          @case ('video') {
            <video [src]="src(asMedia(el).url)" [controls]="!editable()" preload="metadata" (loadedmetadata)="fixDuration($event)"></video>
          }
          @case ('audio') {
            <audio [src]="src(asMedia(el).url)" [controls]="!editable()" preload="metadata" (loadedmetadata)="fixDuration($event)"></audio>
          }
        }
        @if (editable() && selectedIds().length === 1 && selectedIds()[0] === el.id) {
          <div
            class="resize-handle"
            (pointerdown)="$event.stopPropagation(); resizePointerDown.emit({ event: $event, element: el })"
          ></div>
        }
      </div>
    }
    @if (guidePlane(); as plane) {
      <!-- guide di allineamento, nel sistema di riferimento del contenitore -->
      <div
        class="guides"
        [style.left.px]="plane.left"
        [style.top.px]="plane.top"
        [style.width.px]="plane.width"
        [style.height.px]="plane.height"
        [style.transform]="plane.transform"
        [style.--guide-width]="plane.lineWidth + 'px'"
      >
        @for (line of plane.lines; track $index) {
          <div
            class="guide"
            [class.vertical]="line.axis === 'x'"
            [style.left.px]="line.axis === 'x' ? line.at : line.from"
            [style.top.px]="line.axis === 'x' ? line.from : line.at"
            [style.width.px]="line.axis === 'x' ? null : line.to - line.from"
            [style.height.px]="line.axis === 'x' ? line.to - line.from : null"
          ></div>
        }
      </div>
    }
    </div>
  `,
})
export class SlideCanvas {
  readonly proper = input.required<Proper>();
  readonly editable = input(false);
  /** elementi selezionati: la maniglia di ridimensionamento compare solo se ce n'è uno */
  readonly selectedIds = input<number[]>([]);
  /** testo in modifica: solo questo riceve i clic nella sua casella di testo */
  readonly editingId = input<number | null>(null);
  readonly pathIds = input<number[]>([]);
  readonly highlightId = input<number | null>(null);
  /** frame a cui è associato l'elemento selezionato */
  readonly anchorFrameId = input<number | null>(null);
  /** scala a cui impaginare la tela; la transform applicata all'host deve compensarla */
  readonly zoom = input(1);
  /** guide di allineamento da mostrare durante un trascinamento */
  readonly guides = input<Guides | null>(null);
  /** spessore delle guide in pixel della tela (perché sullo schermo restino sottili a ogni zoom) */
  readonly guideWidth = input(1);
  /**
   * Vista della telecamera: gli elementi e le parti della tela che non si vedono (dietro di lei,
   * di taglio o fuori dallo schermo) vengono nascosti, vedi culling.ts.
   */
  readonly camera = input<CameraView | null>(null);
  /** elementi che avviano un sottopercorso */
  readonly triggerIds = input<number[]>([]);

  readonly elementPointerDown = output<ElementPointerEvent>();
  readonly resizePointerDown = output<ElementPointerEvent>();
  readonly elementDblClick = output<SlideElement>();
  readonly textCommit = output<TextCommitEvent>();

  protected readonly baseFontSize = BASE_FONT_SIZE;

  // i frame vengono prima nel DOM, così a parità di z-index restano sotto agli altri elementi
  protected readonly elements = computed<SlideElement[]>(() => {
    const p = this.proper();
    return [...p.frames, ...p.texts, ...p.images, ...p.videos, ...p.audios];
  });

  protected readonly transforms = computed(() => {
    const p = this.proper();
    const layers = tiltLayers(p);
    return new Map(this.elements().map((el) => [el.id, elementTransform(p, el, layers.get(el.id))]));
  });

  /** Posizione e trasformazione del contenitore delle guide: un frame (anche ruotato o inclinato) o la tela. */
  protected readonly guidePlane = computed(() => {
    const guides = this.guides();
    if (!guides) return null;
    const p = this.proper();
    const base = { lines: guides.lines, lineWidth: this.guideWidth() };
    const frame = guides.container === null ? undefined : p.frames.find((f) => f.id === guides.container);
    if (!frame) return { ...base, left: 0, top: 0, width: p.background.width, height: p.background.height, transform: null };
    // sopra a tutti gli elementi del piano, anche se inclinato
    const layer = this.elements().length + 1;
    return { ...base, left: frame.xIndex, top: frame.yIndex, width: frame.width, height: frame.height, transform: elementTransform(p, frame, layer) };
  });

  private readonly corners = computed(() => sceneCorners(this.proper()));

  /** come disegnare la tela (vedi culling.ts) */
  protected readonly floor = computed<FloorMode>(() => {
    const camera = this.camera();
    const { width, height } = this.proper().background;
    return camera ? floorMode(camera, width, height) : 'whole';
  });

  private readonly allTiles = computed(() => floorTiles(this.proper().background.width, this.proper().background.height));

  /** tessere dello sfondo che si vedono, quando la tela è divisa */
  protected readonly tiles = computed(
    () => {
      const camera = this.camera();
      if (!camera || this.floor() !== 'tiles') return [];
      return this.allTiles().filter((tile) => !hiddenFrom(camera, tileCorners(tile)));
    },
    { equal: (a, b) => a.length === b.length && a.every((t, i) => t === b[i]) },
  );

  /** elementi che non si vedono e non vanno disegnati (vedi culling.ts) */
  protected readonly culled = computed(
    () => {
      const camera = this.camera();
      return camera ? culledElements(this.corners(), camera, this.floor() === 'none') : new Set<number>();
    },
    { equal: sameIds },
  );

  protected src(url: string): string {
    return mediaSrc(url);
  }

  protected cssUrl(url: string): string | null {
    return url ? `url("${this.src(url).replace(/"/g, '\\"')}")` : null;
  }

  protected backgroundSize(frame: FrameElement): string {
    return frame.fit === 'fill' ? '100% 100%' : frame.fit;
  }

  /**
   * I file WebM registrati con MediaRecorder non dichiarano la durata (duration = Infinity)
   * e la barra di avanzamento non funziona. Cercando oltre la fine il browser legge tutto
   * il file e calcola la durata reale; poi si torna all'inizio.
   */
  protected fixDuration(event: Event): void {
    const media = event.target as HTMLMediaElement;
    if (Number.isFinite(media.duration)) return;
    const restore = () => {
      if (!Number.isFinite(media.duration)) return;
      media.removeEventListener('durationchange', restore);
      media.currentTime = 0;
    };
    media.addEventListener('durationchange', restore);
    media.currentTime = Number.MAX_SAFE_INTEGER;
  }

  protected asText = (el: SlideElement) => el as TextElement;
  protected asMedia = (el: SlideElement) => el as MediaElement;
  protected asFrame = (el: SlideElement) => el as FrameElement;
}
