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
import { OfflineStore } from '../core/offline-store.service';
import { PresentationApi } from '../core/presentation-api.service';
import { FrameElement, Presentation, mediaSrc } from '../model/presentation';
import { SlideCanvas } from '../shared/slide-canvas';
import { CameraAnimator, Size, Target, cameraFor, sameCamera } from '../shared/view-transform';

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
  /** true quando la presentazione viene letta da quelle salvate offline. */
  readonly offline = input(false);

  private readonly api = inject(PresentationApi);
  private readonly offlineStore = inject(OfflineStore);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly presentation = signal<Presentation | null>(null);
  protected readonly viewport = signal<Size>(viewportSize());
  protected readonly menuOpen = signal(false);
  /** indice del passo corrente: 0 è la vista d'insieme, poi i frame del percorso principale */
  protected readonly step = signal(0);
  /** frame inquadrato fuori dal percorso (cliccandolo) */
  private readonly extraFrame = signal<FrameElement | null>(null);
  protected readonly mediaUrl = signal<(url: string) => string>(mediaSrc);

  protected readonly frames = computed(() => {
    const proper = this.presentation()?.proper;
    if (!proper) return [];
    return proper.paths.main
      .map((id) => proper.frames.find((frame) => frame.id === id))
      .filter((frame): frame is FrameElement => !!frame);
  });

  /** inquadratura del passo corrente */
  private readonly camera = computed(() => {
    const proper = this.presentation()?.proper;
    if (!proper) return null;
    const target: Target = this.extraFrame() ?? this.frames()[this.step() - 1] ?? { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background };
    return cameraFor(this.viewport(), target);
  }, { equal: sameCamera });

  private readonly animator = new CameraAnimator({ min: 900, max: 2200, perUnit: 650 });
  protected readonly transform = this.animator.transform;

  // indirizzi locali dei file salvati offline, da liberare all'uscita
  private readonly objectUrls: string[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.animator.stop();
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });

    // la telecamera si muove verso ogni nuovo passo; al ridimensionamento della finestra salta
    let lastViewport: Size | null = null;
    effect(() => {
      const camera = this.camera();
      const viewport = this.viewport();
      if (!camera) return;
      untracked(() => this.animator.moveTo(viewport, camera, viewport === lastViewport));
      lastViewport = viewport;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.offline()) {
        const saved = await this.offlineStore.get(this.title());
        if (!saved) throw new Error('Presentazione non disponibile offline');
        const urls = new Map(
          Object.entries(saved.media).map(([url, blob]) => {
            const objectUrl = URL.createObjectURL(blob);
            this.objectUrls.push(objectUrl);
            return [url, objectUrl];
          }),
        );
        this.mediaUrl.set((url) => urls.get(url) ?? mediaSrc(url));
        this.presentation.set(saved.presentation);
      } else {
        this.presentation.set((await this.api.get(this.title())).presentation);
      }
    } catch (err) {
      this.notify.error(err);
      this.goHome();
    }
  }

  // ---------------------------------------------------------------- navigazione

  protected goto(step: number): void {
    const count = this.frames().length + 1;
    this.extraFrame.set(null);
    this.step.set(((step % count) + count) % count);
    this.menuOpen.set(false);
  }

  protected next(): void {
    this.goto(this.step() + 1);
  }

  protected prev(): void {
    this.goto(this.step() - 1);
  }

  /** Salta al frame con bookmark successivo a quello corrente. */
  protected nextBookmark(): void {
    const frames = this.frames();
    const index = frames.findIndex((frame, i) => i + 1 > this.step() && frame.bookmark);
    if (index !== -1) this.goto(index + 1);
  }

  protected onCanvasClick(event: MouseEvent): void {
    const element = (event.target as HTMLElement).closest<HTMLElement>('.element-frame');
    if (!element) return;
    const id = Number(element.dataset['elementId']);
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
      case 'Escape':
        this.menuOpen.update((open) => !open);
        break;
    }
  }

  protected onResize(): void {
    this.viewport.set(viewportSize());
  }

  protected goHome(): void {
    this.router.navigate([this.offline() ? '/offline' : '/private/home']);
  }

  protected goEdit(): void {
    this.router.navigate(['/private/edit', this.title()]);
  }
}
