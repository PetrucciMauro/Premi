/*
 * Elenco delle presentazioni salvate per la consultazione offline (ex homeoffline.html).
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NotifyService } from '../../core/notify.service';
import { OfflinePresentation, OfflineStore } from '../../core/offline-store.service';

@Component({
  selector: 'app-offline-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  template: `
    <div class="page narrow">
      <p class="eyebrow">Su questo dispositivo</p>
      <h1 class="page-title">Presentazioni offline</h1>
      <p class="page-subtitle">Disponibili anche senza connessione, direttamente dal browser.</p>

      @if (saved().length === 0) {
        <div class="empty-state">
          <span class="empty-icon"><mat-icon svgIcon="cloud-off" /></span>
          <h2>Nessuna presentazione salvata</h2>
          <p>Dalle tue presentazioni apri il menu di una card e scegli "Rendi disponibile offline".</p>
        </div>
      } @else {
        <ul class="list">
          @for (item of saved(); track item.titolo) {
            <li class="row">
              <span class="row-icon"><mat-icon svgIcon="presentation" /></span>
              <div class="row-text">
                <span class="row-title">{{ item.titolo }}</span>
                <span class="row-meta">Salvata il {{ item.savedAt | date: 'd MMMM y, HH:mm' }}</span>
              </div>
              <button
                matIconButton
                class="delete"
                matTooltip="Rimuovi da questo dispositivo"
                [attr.aria-label]="'Rimuovi ' + item.titolo"
                (click)="remove(item.titolo)"
              >
                <mat-icon svgIcon="trash" />
              </button>
              <a matButton="filled" [routerLink]="['/offline', item.titolo]"><mat-icon svgIcon="play" />Presenta</a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .narrow {
      max-width: 820px;
    }
    .empty-state,
    .list {
      margin-top: 32px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 14px 14px 16px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 18px;
      background: var(--mat-sys-surface-container-lowest);
      transition: box-shadow 0.2s;
    }
    .row:hover {
      box-shadow: var(--premi-shadow-md);
    }
    .row-icon {
      display: grid;
      flex: none;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .row-text {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
    }
    .row-title {
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-meta {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }
    .delete {
      color: var(--mat-sys-on-surface-variant);
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
