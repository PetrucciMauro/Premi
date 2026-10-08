/*
 * Elenco delle presentazioni salvate per la consultazione offline (ex homeoffline.html).
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { NotifyService } from '../../core/notify.service';
import { OfflinePresentation, OfflineStore } from '../../core/offline-store.service';

@Component({
  selector: 'app-offline-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatListModule, RouterLink],
  template: `
    <h1>Presentazioni disponibili offline</h1>
    @if (saved().length === 0) {
      <p>Nessuna presentazione salvata. Dalla home usa "Salva offline" per poterla vedere anche senza connessione.</p>
    }
    <mat-list>
      @for (item of saved(); track item.titolo) {
        <mat-list-item>
          <span matListItemTitle>{{ item.titolo }}</span>
          <span matListItemLine>Salvata il {{ item.savedAt | date: 'short' }}</span>
          <span matListItemMeta class="actions">
            <a matButton="filled" [routerLink]="['/offline', item.titolo]">Visualizza</a>
            <button matButton (click)="remove(item.titolo)">Elimina</button>
          </span>
        </mat-list-item>
      }
    </mat-list>
  `,
  styles: `
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    h1 {
      font-weight: 400;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class OfflineList implements OnInit {
  private readonly store = inject(OfflineStore);
  private readonly notify = inject(NotifyService);
  protected readonly saved = signal<OfflinePresentation[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.saved.set((await this.store.list()).sort((a, b) => a.titolo.localeCompare(b.titolo)));
    } catch (err) {
      this.notify.error(err);
    }
  }

  protected async remove(titolo: string): Promise<void> {
    await this.store.remove(titolo);
    this.saved.update((list) => list.filter((item) => item.titolo !== titolo));
  }
}
