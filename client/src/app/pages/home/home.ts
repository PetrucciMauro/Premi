/*
 * Name : Matteo Busetto
 * Module : Controller::homeController
 * Description: elenco delle presentazioni dell'utente e relative operazioni.
 */
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { OfflineStore } from '../../core/offline-store.service';
import { PresentationApi } from '../../core/presentation-api.service';
import { Background, mediaSrc } from '../../model/presentation';
import { ConfirmDialog, ConfirmDialogData, TitleDialog, TitleDialogData } from './dialogs';

interface SlideShowCard {
  titolo: string;
  background?: Background;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly api = inject(PresentationApi);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  protected readonly offline = inject(OfflineStore);

  protected readonly slideShows = signal<SlideShowCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly savingOffline = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return query
      ? this.slideShows().filter((s) => s.titolo.toLocaleLowerCase().includes(query))
      : this.slideShows();
  });

  ngOnInit(): void {
    this.update();
  }

  private async update(): Promise<void> {
    try {
      const metas = (await this.api.list()).sort((a, b) => a.titolo.localeCompare(b.titolo));
      this.slideShows.set(metas.map(({ titolo }) => ({ titolo })));
      // le anteprime mostrano lo sfondo di ogni presentazione
      const cards = await Promise.all(
        metas.map(async ({ titolo }) => {
          try {
            return { titolo, background: (await this.api.get(titolo)).presentation.proper.background };
          } catch {
            return { titolo };
          }
        }),
      );
      this.slideShows.set(cards);
    } catch (err) {
      this.notify.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  protected thumbnailImage(card: SlideShowCard): string | null {
    const image = card.background?.image;
    return image ? `url("${mediaSrc(image)}")` : null;
  }

  protected edit(titolo: string): void {
    this.router.navigate(['/private/edit', titolo]);
  }

  protected execute(titolo: string): void {
    this.router.navigate(['/private/execution', titolo]);
  }

  private async askTitle(data: TitleDialogData): Promise<string | undefined> {
    const title = await firstValueFrom(
      this.dialog.open<TitleDialog, TitleDialogData, string>(TitleDialog, { data, width: '440px' }).afterClosed(),
    );
    if (!title) return undefined;
    if (this.slideShows().some((s) => s.titolo === title)) {
      this.notify.error('Titolo già presente: scegliere un altro titolo per la presentazione.');
      return undefined;
    }
    if (title.includes('/')) {
      this.notify.error('Il titolo non può contenere il carattere "/".');
      return undefined;
    }
    return title;
  }

  protected async create(): Promise<void> {
    const title = await this.askTitle({
      heading: 'Nuova presentazione',
      message: 'Dai un titolo alla tua presentazione: potrai cambiarlo in qualsiasi momento.',
    });
    if (!title) return;
    try {
      await this.api.create(title);
      await this.update();
    } catch (err) {
      this.notify.error(err);
    }
  }

  protected async rename(titolo: string): Promise<void> {
    const title = await this.askTitle({
      heading: 'Rinomina presentazione',
      message: 'Scegli il nuovo titolo della presentazione.',
      title: titolo,
    });
    if (!title || title === titolo) return;
    try {
      await this.api.rename(titolo, title);
      await this.update();
    } catch (err) {
      this.notify.error(err);
    }
  }

  protected async remove(titolo: string): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
          data: {
            heading: `Eliminare "${titolo}"?`,
            message: "La presentazione verrà eliminata definitivamente: non sarà più possibile tornare indietro.",
            confirm: 'Elimina',
          },
        })
        .afterClosed(),
    );
    if (!confirmed) return;
    try {
      await this.api.remove(titolo);
      await this.update();
    } catch (err) {
      this.notify.error(err);
    }
  }

  protected async saveOffline(titolo: string): Promise<void> {
    this.savingOffline.set(titolo);
    try {
      await this.offline.save((await this.api.get(titolo)).presentation);
      this.notify.info(`"${titolo}" è disponibile offline`);
    } catch (err) {
      this.notify.error(err);
    } finally {
      this.savingOffline.set(null);
    }
  }

  protected async removeOffline(titolo: string): Promise<void> {
    try {
      await this.offline.remove(titolo);
    } catch (err) {
      this.notify.error(err);
    }
  }
}
