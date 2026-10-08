/*
 * Name : Mauro Petrucci, Matteo Busetto
 * Module : Controller::profileController
 * Description: profilo utente, con il cambio password.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import { MIN_PASSWORD_LENGTH } from '../access/access';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <div class="page narrow">
      <section class="identity">
        <span class="avatar">{{ (auth.username() || '?').charAt(0) }}</span>
        <div>
          <p class="eyebrow">Profilo</p>
          <h1 class="page-title">{{ auth.username() }}</h1>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <span class="panel-icon"><mat-icon svgIcon="lock" /></span>
          <div class="panel-heading">
            <h2>Password</h2>
            <p>Usa una password di almeno {{ minLength }} caratteri che non usi altrove.</p>
          </div>
          @if (!editPassword()) {
            <button matButton="outlined" (click)="editPassword.set(true); message.set('')">Cambia password</button>
          }
        </header>

        @if (editPassword()) {
          <form (ngSubmit)="changePassword()">
            <mat-form-field>
              <mat-label>Password attuale</mat-label>
              <input matInput name="password" type="password" autocomplete="current-password" [(ngModel)]="password" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Nuova password</mat-label>
              <input matInput name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Conferma nuova password</mat-label>
              <input matInput name="confirmPassword" type="password" autocomplete="new-password" [(ngModel)]="confirmPassword" />
            </mat-form-field>
            <div class="actions">
              <button matButton type="button" (click)="editPassword.set(false)">Annulla</button>
              <button matButton="filled" type="submit" [disabled]="busy()">Aggiorna password</button>
            </div>
          </form>
        }
        @if (message()) {
          <p class="message"><mat-icon svgIcon="check" />{{ message() }}</p>
        }
      </section>
    </div>
  `,
  styles: `
    .narrow {
      max-width: 720px;
    }
    .identity {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }
    .avatar {
      display: grid;
      flex: none;
      place-items: center;
      width: 72px;
      height: 72px;
      border-radius: 24px;
      background: var(--premi-gradient);
      color: #fff;
      font-family: var(--mat-sys-headline-medium-font);
      font-size: 32px;
      font-weight: 800;
      text-transform: uppercase;
      box-shadow: 0 10px 24px rgb(124 58 237 / 30%);
    }
    .panel {
      padding: 24px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 20px;
      background: var(--mat-sys-surface-container-lowest);
    }
    .panel-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
    .panel-icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .panel-heading {
      flex: 1;
      min-width: 200px;
    }
    h2 {
      margin: 0;
      font-size: 18px;
    }
    .panel-heading p {
      margin: 2px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 20px 0 0;
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      font-weight: 500;
    }
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly notify = inject(NotifyService);

  protected readonly minLength = MIN_PASSWORD_LENGTH;
  protected readonly editPassword = signal(false);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected password = '';
  protected newPassword = '';
  protected confirmPassword = '';

  protected async changePassword(): Promise<void> {
    this.message.set('');
    if (!this.password || !this.newPassword || !this.confirmPassword)
      return this.notify.error('I campi password non possono essere vuoti');
    if (this.newPassword !== this.confirmPassword)
      return this.notify.error('La nuova password e la sua conferma non coincidono');
    if (this.newPassword.length < MIN_PASSWORD_LENGTH)
      return this.notify.error(
        `Attenzione: la password è troppo corta. Deve essere di almeno ${MIN_PASSWORD_LENGTH} caratteri`,
      );

    this.busy.set(true);
    try {
      await this.auth.changePassword(this.password, this.newPassword);
      this.message.set('Password modificata con successo');
      this.password = this.newPassword = this.confirmPassword = '';
      this.editPassword.set(false);
    } catch (err) {
      this.notify.error(err);
    } finally {
      this.busy.set(false);
    }
  }
}
