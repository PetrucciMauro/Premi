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
      [style.zoom]="zoom()"
      [style.width.px]="proper().background.width"
      [style.height.px]="proper().background.height"
      [style.font-size.px]="baseFontSize"
      [style.background-color]="proper().background.color"
      [style.background-image]="cssUrl(proper().background.image)"
    >
    @for (el of elements(); track el.type + el.id) {
      <div
        class="element"
        [class]="'element element-' + el.type"
        [class.selected]="el.id === selectedId()"
        [class.editing]="el.id === editingId()"
        [class.in-path]="el.type === 'frame' && pathIds().includes(el.id)"
        [class.highlighted]="el.id === highlightId()"
        [class.anchor-frame]="el.id === anchorFrameId()"
        [class.trigger]="triggerIds().includes(el.id)"
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
        @if (editable() && el.id === selectedId()) {
          <div
            class="resize-handle"
            (pointerdown)="$event.stopPropagation(); resizePointerDown.emit({ event: $event, element: el })"
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
  readonly selectedId = input<number | null>(null);
  /** testo in modifica: solo questo riceve i clic nella sua casella di testo */
  readonly editingId = input<number | null>(null);
  readonly pathIds = input<number[]>([]);
  readonly highlightId = input<number | null>(null);
  /** frame a cui è associato l'elemento selezionato */
  readonly anchorFrameId = input<number | null>(null);
  /** scala a cui impaginare la tela; la transform applicata all'host deve compensarla */
  readonly zoom = input(1);
  /** elementi che avviano un sottopercorso */
  readonly triggerIds = input<number[]>([]);
  /** Permette al player offline di sostituire gli indirizzi dei file con quelli salvati in locale. */
  readonly mediaUrl = input<(url: string) => string>(mediaSrc);

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

  protected src(url: string): string {
    return this.mediaUrl()(url);
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
