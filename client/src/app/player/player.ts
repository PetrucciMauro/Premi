/*
 * Name : Matteo Busetto, Manuel Fossa
 * Module : Controller::executionController
 * Description:
 *   Esecuzione di una presentazione a schermo intero. La "telecamera" parte dalla vista
 *   d'insieme e percorre i frame del percorso principale; spazio salta al bookmark successivo.
 *   Sostituisce la versione modificata di impress.js usata in precedenza.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { PresentationApi } from '../core/presentation-api.service';
import { FrameElement, Presentation, SubPath, frameName } from '../model/presentation';
import { findLink, transitionBetween } from '../model/transition';
import { SlideCanvas } from '../shared/slide-canvas';
import { CameraAnimator, Size, cameraFor, focusCamera, motionFor, sameCamera } from '../shared/view-transform';

const viewportSize = (): Size => ({ width: window.innerWidth, height: window.innerHeight });

@Component({
  selector: 'app-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, SlideCanvas],
  templateUrl: './player.html',
  styleUrl: './player.scss',
  host: {
    '(document:keyup)': 'onKeyUp($event)',
    '(document:keydown)': 'onKeyDown($event)',
    '(window:resize)': 'onResize()',
  },
})
export class Player implements OnInit {
  readonly title = input.required<string>();

  private readonly api = inject(PresentationApi);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly presentation = signal<Presentation | null>(null);
  protected readonly viewport = signal<Size>(viewportSize());
  protected readonly menuOpen = signal(false);
  protected readonly frameName = frameName;
  /** indice del passo corrente: 0 è la vista d'insieme, poi i frame del percorso principale */
  protected readonly step = signal(0);
  /** frame inquadrato fuori dal percorso (cliccandolo) */
  private readonly extraFrame = signal<FrameElement | null>(null);

  /** sottopercorso in corso e posizione al suo interno */
  protected readonly sub = signal<{ path: SubPath; frames: FrameElement[]; index: number } | null>(null);

  private framesOf(ids: number[]): FrameElement[] {
    const proper = this.presentation()?.proper;
    if (!proper) return [];
    return ids.map((id) => proper.frames.find((frame) => frame.id === id)).filter((frame): frame is FrameElement => !!frame);
  }

  protected readonly frames = computed(() => this.framesOf(this.presentation()?.proper.paths.main ?? []));

  /** sottopercorsi utilizzabili, per frame di partenza */
  protected readonly subPaths = computed(() => {
    const map = new Map<number, { path: SubPath; frames: FrameElement[] }[]>();
    for (const path of this.presentation()?.proper.paths.choices ?? []) {
      const frames = this.framesOf(path.choicePath);
      if (path.trigger === null || !frames.length) continue;
      map.set(path.frame, [...(map.get(path.frame) ?? []), { path, frames }]);
    }
    return map;
  });

  /** frame del percorso principale inquadrato (non durante un sottopercorso) */
  private readonly mainFrame = computed(() => (this.sub() || this.extraFrame() ? null : (this.frames()[this.step() - 1] ?? null)));

  /** elementi su cui si può fare clic per avviare un sottopercorso */
  protected readonly triggerIds = computed(() => {
    const frame = this.mainFrame();
    return frame ? (this.subPaths().get(frame.id) ?? []).map((s) => s.path.trigger!) : [];
  });

  /** frame inquadrato al passo corrente (null nella vista d'insieme) */
  private readonly target = computed(() => {
    const sub = this.sub();
    return this.extraFrame() ?? (sub ? sub.frames[sub.index] : this.frames()[this.step() - 1]) ?? null;
  });

  /** frame a cui porta il prossimo passo in avanti (null se si torna alla vista d'insieme) */
  private upcoming(): FrameElement | null {
    if (this.extraFrame()) return null;
    const sub = this.sub();
    const main = this.frames()[this.step() - 1] ?? null;
    if (sub) return sub.frames[sub.index + 1] ?? main;
    return this.frames()[this.step()] ?? null;
  }

  /** inquadratura del passo corrente */
  private readonly camera = computed(() => {
    const proper = this.presentation()?.proper;
    if (!proper) return null;
    const frame = this.target();
    // un frame inclinato viene raddrizzato: la telecamera ne segue la rotazione 3D
    return frame
      ? focusCamera(this.viewport(), proper, frame)
      : cameraFor(this.viewport(), { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background });
  }, { equal: sameCamera });

  private readonly animator = new CameraAnimator({ min: 900, max: 2200, perUnit: 650 });
  protected readonly transform = this.animator.transform;
  protected readonly zoom = this.animator.zoom;
  protected readonly cameraView = this.animator.view;
  protected readonly veil = this.animator.veil;
  /** passaggio automatico al passo successivo (vedi Transition.advance) */
  private advanceTimer: ReturnType<typeof setTimeout> | undefined;
  /** il prossimo movimento torna indietro: si rivede a ritroso la transizione del frame che si lascia */
  private back = false;
  /** frame inquadrato finora (quello che si lascia al prossimo passo) */
  private shown: FrameElement | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.advanceTimer);
      this.animator.stop();
    });

    // la telecamera si muove verso ogni nuovo passo; al ridimensionamento della finestra salta
    let lastViewport: Size | null = null;
    effect(() => {
      const camera = this.camera();
      const viewport = this.viewport();
      if (!camera) return;
      untracked(() => {
        // si usa la transizione del collegamento tra il frame che si lascia e quello d'arrivo
        // (al contrario se lo si percorre all'indietro). La partenza automatica vale solo
        // andando avanti (altrimenti tornando indietro si verrebbe rispinti in avanti)
        clearTimeout(this.advanceTimer);
        const back = this.back;
        this.back = false;
        const leaving = this.shown;
        const frame = this.target();
        this.shown = frame;
        const transitions = this.presentation()?.proper.paths.transitions ?? [];
        const link = transitionBetween(transitions, leaving?.id, frame?.id, back);
        const motion = link ? motionFor(link.transition, link.reverse) : motionFor(undefined, back);
        this.animator.moveTo(viewport, camera, viewport === lastViewport, motion).then((arrived) => {
          const advance = findLink(transitions, frame?.id, this.upcoming()?.id)?.advance;
          if (arrived && !back && advance != null && this.target() === frame) this.advanceTimer = setTimeout(() => this.next(), advance * 1000);
        });
      });
      lastViewport = viewport;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.presentation.set((await this.api.get(this.title())).presentation);
    } catch (err) {
      this.notify.error(err);
      this.goHome();
    }
  }

  // ---------------------------------------------------------------- navigazione

  protected goto(step: number): void {
    const count = this.frames().length + 1;
    this.back = step < this.step();
    this.extraFrame.set(null);
    this.sub.set(null);
    this.step.set(((step % count) + count) % count);
    this.menuOpen.set(false);
  }

  /** Avvia un sottopercorso del frame `frameId` del percorso principale. */
  protected startSub(frameId: number, pathId: number): void {
    const index = this.frames().findIndex((frame) => frame.id === frameId);
    const sub = this.subPaths().get(frameId)?.find((s) => s.path.id === pathId);
    if (index === -1 || !sub) return;
    this.goto(index + 1);
    this.back = false;
    this.sub.set({ ...sub, index: 0 });
  }

  /** Avanti e indietro nel sottopercorso: oltre la fine (o prima dell'inizio) si torna al frame di partenza. */
  private moveInSub(delta: 1 | -1): boolean {
    const sub = this.sub();
    if (!sub) return false;
    this.extraFrame.set(null);
    this.back = delta < 0;
    const index = sub.index + delta;
    this.sub.set(index >= 0 && index < sub.frames.length ? { ...sub, index } : null);
    return true;
  }

  protected next(): void {
    if (this.extraFrame()) this.leaveExtraFrame();
    else if (!this.moveInSub(1)) this.goto(this.step() + 1);
  }

  protected prev(): void {
    if (this.extraFrame()) this.leaveExtraFrame();
    else if (!this.moveInSub(-1)) this.goto(this.step() - 1);
  }

  /** Torna al passo da cui si era aperto un frame fuori dal percorso: è un ritorno indietro. */
  private leaveExtraFrame(): void {
    this.back = true;
    this.extraFrame.set(null);
  }

  /** Salta al frame con bookmark successivo a quello corrente. */
  protected nextBookmark(): void {
    const frames = this.frames();
    const index = frames.findIndex((frame, i) => i + 1 > this.step() && frame.bookmark);
    if (index !== -1) this.goto(index + 1);
  }

  protected onCanvasClick(event: MouseEvent): void {
    // clic su un elemento che avvia un sottopercorso del frame inquadrato
    const clicked = Number((event.target as HTMLElement).closest<HTMLElement>('.element.trigger')?.dataset['elementId']);
    const current = this.mainFrame();
    const trigger = current && this.subPaths().get(current.id)?.find((s) => s.path.trigger === clicked);
    if (current && trigger) {
      this.startSub(current.id, trigger.path.id);
      return;
    }

    const element = (event.target as HTMLElement).closest<HTMLElement>('.element-frame');
    if (!element) return;
    const id = Number(element.dataset['elementId']);
    // un frame del sottopercorso in corso
    const sub = this.sub();
    const subIndex = sub?.frames.findIndex((frame) => frame.id === id) ?? -1;
    if (sub && subIndex !== -1) {
      this.back = subIndex < sub.index;
      this.extraFrame.set(null);
      this.sub.set({ ...sub, index: subIndex });
      return;
    }
    const index = this.frames().findIndex((frame) => frame.id === id);
    if (index !== -1) {
      this.goto(index + 1);
      return;
    }
    const frame = this.presentation()?.proper.frames.find((f) => f.id === id);
    if (frame) this.extraFrame.set(frame);
  }

  protected onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1 || (event.target as HTMLElement).closest('.player-menu, audio, video')) return;
    const x = event.touches[0].clientX;
    const edge = window.innerWidth * 0.3;
    if (x < edge) this.prev();
    else if (x > window.innerWidth - edge) this.next();
  }

  private static readonly KEYS = new Set(['Tab', ' ', 'PageUp', 'PageDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

  protected onKeyDown(event: KeyboardEvent): void {
    if (Player.KEYS.has(event.key) && !(event.target instanceof HTMLMediaElement)) event.preventDefault();
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (event.target instanceof HTMLMediaElement) return;
    switch (event.key) {
      case 'PageUp':
      case 'ArrowLeft':
      case 'ArrowUp':
        this.prev();
        break;
      case 'Tab':
      case 'PageDown':
      case 'ArrowRight':
      case 'ArrowDown':
        this.next();
        break;
      case ' ':
        this.nextBookmark();
        break;
      case 'Backspace':
        // torna al frame di partenza del sottopercorso
        this.back = true;
        this.extraFrame.set(null);
        this.sub.set(null);
        break;
      case 'Escape':
        this.menuOpen.update((open) => !open);
        break;
    }
  }

  protected onResize(): void {
    this.viewport.set(viewportSize());
  }

  protected goHome(): void {
    this.router.navigate(['/private/home']);
  }

  protected goEdit(): void {
    this.router.navigate(['/private/edit', this.title()]);
  }
}
