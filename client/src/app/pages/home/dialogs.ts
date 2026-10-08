import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface TitleDialogData {
  heading: string;
  message: string;
  title?: string;
}

/** Richiesta del titolo di una presentazione (creazione e rinomina). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <form (ngSubmit)="title.trim() && ref.close(title.trim())">
      <h2 mat-dialog-title>{{ data.heading }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
        <mat-form-field class="full">
          <mat-label>Titolo</mat-label>
          <input matInput name="title" cdkFocusInitial [(ngModel)]="title" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton type="button" mat-dialog-close>Annulla</button>
        <button matButton="filled" type="submit" [disabled]="!title.trim()">OK</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `.full { width: 100%; }`,
})
export class TitleDialog {
  protected readonly data = inject<TitleDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<TitleDialog, string>>(MatDialogRef);
  protected title = this.data.title ?? '';
}

export interface ConfirmDialogData {
  heading: string;
  message: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.heading }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="false">No</button>
      <button matButton="filled" [mat-dialog-close]="true" cdkFocusInitial>Sì</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
