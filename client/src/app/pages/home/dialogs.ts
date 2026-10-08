import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

const DIALOG_STYLES = `
  .dialog-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    margin: 24px 24px 0;
    border-radius: 14px;
    background: var(--mat-sys-primary-container);
    color: var(--mat-sys-on-primary-container);
  }
  .dialog-icon.danger {
    background: var(--mat-sys-error-container);
    color: var(--mat-sys-on-error-container);
  }
  h2[mat-dialog-title] {
    padding-top: 16px;
  }
  .message {
    margin: 0 0 16px;
    color: var(--mat-sys-on-surface-variant);
  }
  .full {
    width: 100%;
  }
  .danger-button {
    --mat-button-filled-container-color: var(--mat-sys-error);
    --mat-button-filled-label-text-color: var(--mat-sys-on-error);
  }
`;

export interface TitleDialogData {
  heading: string;
  message: string;
  title?: string;
  /** Testo del pulsante di conferma, se diverso da "Crea"/"Rinomina". */
  confirm?: string;
}

/** Richiesta del titolo di una presentazione (creazione e rinomina). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <form (ngSubmit)="title.trim() && ref.close(title.trim())">
      <span class="dialog-icon"><mat-icon [svgIcon]="data.title ? 'type' : 'presentation'" /></span>
      <h2 mat-dialog-title>{{ data.heading }}</h2>
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        <mat-form-field class="full">
          <mat-label>Titolo</mat-label>
          <input matInput name="title" cdkFocusInitial autocomplete="off" [(ngModel)]="title" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton type="button" mat-dialog-close>Annulla</button>
        <button matButton="filled" type="submit" [disabled]="!title.trim()">
          {{ data.confirm ?? (data.title ? 'Rinomina' : 'Crea') }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: DIALOG_STYLES,
})
export class TitleDialog {
  protected readonly data = inject<TitleDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<TitleDialog, string>>(MatDialogRef);
  protected title = this.data.title ?? '';
}

export interface ConfirmDialogData {
  heading: string;
  message: string;
  /** Testo del pulsante di conferma; se presente l'azione è considerata distruttiva. */
  confirm?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <span class="dialog-icon" [class.danger]="data.confirm"><mat-icon [svgIcon]="data.confirm ? 'trash' : 'check'" /></span>
    <h2 mat-dialog-title>{{ data.heading }}</h2>
    <mat-dialog-content><p class="message">{{ data.message }}</p></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="false">Annulla</button>
      <button matButton="filled" [class.danger-button]="data.confirm" [mat-dialog-close]="true" cdkFocusInitial>
        {{ data.confirm ?? 'Conferma' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: DIALOG_STYLES,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
