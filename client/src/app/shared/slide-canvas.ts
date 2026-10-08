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
    '[style.width.px]': 'proper().background.width',
    '[style.height.px]': 'proper().background.height',
    '[style.font-size.px]': 'baseFontSize',
    '[style.background-color]': 'proper().background.color',
    '[style.background-image]': 'cssUrl(proper().background.image)',
    '[class.editable]': 'editable()',
  },
  template: `
    @for (el of elements(); track el.type + el.id) {
      <div
        class="element"
        [class]="'element element-' + el.type"
        [class.selected]="el.id === selectedId()"
        [class.in-path]="el.type === 'frame' && pathIds().includes(el.id)"
        [class.highlighted]="el.id === highlightId()"
        [attr.data-element-id]="el.id"
        [style.left.px]="el.xIndex"
        [style.top.px]="el.yIndex"
        [style.width.px]="el.width"
        [style.height.px]="el.height"
        [style.z-index]="el.zIndex"
        [style.transform]="'rotate(' + el.rotation + 'deg)'"
        [style.background-color]="el.type === 'frame' ? asFrame(el).color : null"
        [style.background-image]="el.type === 'frame' ? cssUrl(asFrame(el).ref) : null"
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
            <video [src]="src(asMedia(el).url)" [controls]="!editable()" preload="metadata"></video>
          }
          @case ('audio') {
            <audio [src]="src(asMedia(el).url)" [controls]="!editable()" preload="none"></audio>
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
  `,
})
export class SlideCanvas {
  readonly proper = input.required<Proper>();
  readonly editable = input(false);
  readonly selectedId = input<number | null>(null);
  readonly pathIds = input<number[]>([]);
  readonly highlightId = input<number | null>(null);
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

  protected src(url: string): string {
    return this.mediaUrl()(url);
  }

  protected cssUrl(url: string): string | null {
    return url ? `url("${this.src(url).replace(/"/g, '\\"')}")` : null;
  }

  protected asText = (el: SlideElement) => el as TextElement;
  protected asMedia = (el: SlideElement) => el as MediaElement;
  protected asFrame = (el: SlideElement) => el as FrameElement;
}
