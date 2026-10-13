/*
 * Name : Giovanni Venturelli
 * Package : Tutorial
 * Description:
 *   Visita guidata: una sequenza di passi che evidenziano una parte dell'interfaccia e la
 *   spiegano. Un passo può chiedere di compiere un'azione: appena è fatta si passa da soli
 *   al passo successivo. L'evidenziazione non blocca i clic, così si prova davvero.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TourStep {
  title: string;
  /** spiegazione; può contenere semplici tag HTML come <b> e <kbd> */
  text: string;
  /**
   * Parte dell'interfaccia da evidenziare: il valore dell'attributo data-tour, un selettore CSS
   * (se inizia con "[" o ".") o una funzione che lo calcola; senza, il passo sta al centro.
   */
  target?: string | (() => string | null);
  /** azione richiesta all'utente */
  task?: string;
  /** vera quando l'azione richiesta è stata fatta: si prosegue da soli */
  done?: () => boolean;
  /** eseguita quando il passo inizia (es. per selezionare l'elemento di cui si parla) */
  enter?: () => void;
}

/** attesa prima di passare al passo successivo dopo che l'azione richiesta è fatta */
const ADVANCE_MS = 900;

@Injectable({ providedIn: 'root' })
export class Tour {
  private readonly steps = signal<TourStep[]>([]);
  readonly index = signal(0);
  readonly count = computed(() => this.steps().length);
  readonly step = computed(() => this.steps()[this.index()] ?? null);
  /** l'azione richiesta dal passo corrente è stata fatta */
  readonly completed = computed(() => !!this.step()?.done?.());

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    effect(() => {
      clearTimeout(timer);
      const step = this.step();
      if (!step || !this.completed()) return;
      timer = setTimeout(() => {
        if (this.step() === step) this.next();
      }, ADVANCE_MS);
    });
  }

  start(steps: TourStep[]): void {
    this.steps.set(steps);
    this.go(0);
  }

  next(): void {
    if (this.index() + 1 < this.count()) this.go(this.index() + 1);
    else this.stop();
  }

  prev(): void {
    if (this.index() > 0) this.go(this.index() - 1);
  }

  stop(): void {
    this.steps.set([]);
    this.index.set(0);
  }

  private go(index: number): void {
    this.index.set(index);
    untracked(() => this.steps()[index]?.enter?.());
  }
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** spazio attorno alla parte evidenziata e distanza della scheda dai bordi */
const PADDING = 6;
const MARGIN = 16;

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height);

@Component({
  selector: 'app-tour',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  styleUrl: './tour.scss',
  template: `
    @if (tour.step(); as step) {
      <div
        class="spot"
        [class.centered]="!spot()"
        [style.left.px]="spot()?.left"
        [style.top.px]="spot()?.top"
        [style.width.px]="spot()?.width"
        [style.height.px]="spot()?.height"
      ></div>
      <section
        #card
        class="card"
        role="dialog"
        aria-labelledby="tour-title"
        [style.left.px]="position().left"
        [style.top.px]="position().top"
      >
        <div class="progress" aria-hidden="true">
          <span [style.width.%]="((tour.index() + 1) / tour.count()) * 100"></span>
        </div>
        <p class="counter">Passo {{ tour.index() + 1 }} di {{ tour.count() }}</p>
        <h2 id="tour-title">{{ step.title }}</h2>
        <p class="text" [innerHTML]="step.text"></p>
        @if (step.task) {
          <p class="task" [class.done]="tour.completed()" aria-live="polite">
            <mat-icon [svgIcon]="tour.completed() ? 'check' : 'chevron-right'" />
            <span>{{ tour.completed() ? 'Fatto!' : step.task }}</span>
          </p>
        }
        <footer>
          <button matButton class="exit" (click)="tour.stop()">Esci</button>
          <span class="spacer"></span>
          <button matButton [disabled]="tour.index() === 0" (click)="tour.prev()">Indietro</button>
          <button matButton="filled" (click)="tour.next()">
            {{ tour.index() + 1 === tour.count() ? 'Fine' : step.task && !tour.completed() ? 'Salta' : 'Avanti' }}
          </button>
        </footer>
      </section>
    }
  `,
})
export class TourOverlay {
  protected readonly tour = inject(Tour);
  private readonly card = viewChild<ElementRef<HTMLElement>>('card');

  /** parte evidenziata, in coordinate della finestra (null se il passo non ne ha) */
  protected readonly spot = signal<Rect | null>(null, { equal: sameRect });
  protected readonly position = signal({ left: MARGIN, top: MARGIN }, { equal: (a, b) => a.left === b.left && a.top === b.top });

  constructor() {
    // la parte evidenziata può spostarsi (menu, pannelli, animazioni): la si segue a ogni fotogramma
    let frame = 0;
    const follow = () => {
      this.measure();
      frame = requestAnimationFrame(follow);
    };
    effect(() => {
      cancelAnimationFrame(frame);
      if (this.tour.step()) frame = requestAnimationFrame(follow);
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(frame));
  }

  private measure(): void {
    const step = this.tour.step();
    const card = this.card()?.nativeElement;
    if (!step || !card) return;

    const target = typeof step.target === 'function' ? step.target() : step.target;
    const selector = !target ? null : /^[[.#]/.test(target) ? target : `[data-tour="${target}"]`;
    const box = selector ? document.querySelector(selector)?.getBoundingClientRect() : undefined;
    const visible = !!box && box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight;
    const spot = visible
      ? {
          left: Math.round(box.left - PADDING),
          top: Math.round(box.top - PADDING),
          width: Math.round(box.width + PADDING * 2),
          height: Math.round(box.height + PADDING * 2),
        }
      : null;
    this.spot.set(spot);
    this.position.set(this.place(spot, card.offsetWidth, card.offsetHeight));
  }

  /** Posizione della scheda: sotto la parte evidenziata, altrimenti sopra, a lato o al centro. */
  private place(spot: Rect | null, width: number, height: number): { left: number; top: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clampX = (x: number) => Math.round(Math.min(Math.max(x, MARGIN), vw - width - MARGIN));
    const clampY = (y: number) => Math.round(Math.min(Math.max(y, MARGIN), vh - height - MARGIN));
    if (!spot) return { left: clampX((vw - width) / 2), top: clampY((vh - height) / 2) };

    const centerX = clampX(spot.left + spot.width / 2 - width / 2);
    const centerY = clampY(spot.top + spot.height / 2 - height / 2);
    const below = spot.top + spot.height + MARGIN;
    const above = spot.top - MARGIN - height;
    if (below + height <= vh - MARGIN) return { left: centerX, top: below };
    if (above >= MARGIN) return { left: centerX, top: above };
    // parte evidenziata molto alta (es. la tela): accanto o, se non c'è spazio, nell'angolo in basso
    if (spot.left + spot.width + MARGIN + width <= vw - MARGIN) return { left: spot.left + spot.width + MARGIN, top: centerY };
    if (spot.left - MARGIN - width >= MARGIN) return { left: spot.left - MARGIN - width, top: centerY };
    return { left: clampX(vw - width - MARGIN), top: clampY(vh - height - MARGIN) };
  }
}
