/*
 * Creazione di una presentazione: titolo e, se si vuole, un modello da cui partire.
 * Le anteprime dei modelli usano la stessa tela del player, vista d'insieme compresa.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Proper } from '../../model/presentation';
import { SlideCanvas } from '../../shared/slide-canvas';
import { cameraFor, cameraMatrix, cssMatrix, perspectiveFor } from '../../shared/view-transform';
import { TEMPLATES } from '../../templates/templates';

export interface NewPresentation {
  title: string;
  /** contenuto del modello scelto; assente per una presentazione vuota */
  proper?: Proper;
}

const PREVIEW = { width: 248, height: 124 };

interface Choice {
  id: string;
  name: string;
  description: string;
  proper?: Proper;
  transform?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, SlideCanvas],
  template: `
    <form (ngSubmit)="submit()">
      <h2 mat-dialog-title>Nuova presentazione</h2>
      <mat-dialog-content>
        <mat-form-field class="full">
          <mat-label>Titolo</mat-label>
          <input matInput name="title" cdkFocusInitial autocomplete="off" [(ngModel)]="title" />
        </mat-form-field>
        <h3 class="section">Modello <span>facoltativo · una guida da cui partire, tutto si può modificare</span></h3>
        <div class="choices" role="radiogroup" aria-label="Modello">
          @for (choice of choices; track choice.id) {
            <button
              type="button"
              class="choice"
              role="radio"
              [attr.aria-checked]="selected() === choice.id"
              [class.selected]="selected() === choice.id"
              (click)="selected.set(choice.id)"
              (dblclick)="selected.set(choice.id); submit()"
            >
              <span class="preview">
                @if (choice.proper) {
                  <app-slide-canvas [proper]="choice.proper" [style.transform]="choice.transform" />
                } @else {
                  <mat-icon svgIcon="plus" />
                }
              </span>
              <span class="name">{{ choice.name }}</span>
              <span class="description">{{ choice.description }}</span>
            </button>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton type="button" mat-dialog-close>Annulla</button>
        <button matButton="filled" type="submit" [disabled]="!title.trim()">Crea</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    h2[mat-dialog-title] {
      padding-top: 20px;
    }
    .full {
      width: 100%;
      margin-top: 8px;
    }
    .section {
      margin: 4px 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--mat-sys-on-surface);

      span {
        margin-left: 6px;
        font-weight: 400;
        color: var(--mat-sys-on-surface-variant);
      }
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${PREVIEW.width + 18}px, 1fr));
      gap: 12px;
    }
    .choice {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 8px 12px;
      border: 1.5px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      background: var(--mat-sys-surface-container-low);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;

      &:hover {
        border-color: var(--mat-sys-outline);
      }
      &.selected {
        border-color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }
      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    }
    .preview {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      aspect-ratio: ${PREVIEW.width} / ${PREVIEW.height};
      overflow: hidden;
      border-radius: 10px;
      background: var(--mat-sys-surface-container-highest);
      color: var(--mat-sys-on-surface-variant);
      pointer-events: none;
    }
    .preview app-slide-canvas {
      top: 50%;
      left: 50%;
      margin: ${-PREVIEW.height / 2}px 0 0 ${-PREVIEW.width / 2}px;
    }
    .name {
      margin-top: 4px;
      padding: 0 4px;
      font-weight: 600;
    }
    .description {
      padding: 0 4px;
      font-size: 12px;
      line-height: 1.35;
      opacity: 0.8;
    }
  `,
})
export class NewPresentationDialog {
  private readonly ref = inject<MatDialogRef<NewPresentationDialog, NewPresentation>>(MatDialogRef);

  protected title = '';
  protected readonly selected = signal('empty');
  protected readonly choices: Choice[] = [
    { id: 'empty', name: 'Vuota', description: 'Una tela bianca, senza frame.' },
    ...TEMPLATES.map((template) => {
      const proper = template.build();
      // vista d'insieme della tela, come all'inizio della presentazione
      const camera = cameraFor(PREVIEW, { xIndex: 0, yIndex: 0, rotation: 0, ...proper.background });
      const transform = cssMatrix(cameraMatrix(PREVIEW, camera, perspectiveFor(PREVIEW)));
      return { ...template, proper, transform };
    }),
  ];

  protected submit(): void {
    const title = this.title.trim();
    if (!title) return;
    // un modello nuovo per ogni presentazione: le anteprime restano del dialog
    const template = TEMPLATES.find((t) => t.id === this.selected());
    this.ref.close({ title, proper: template?.build() });
  }
}
