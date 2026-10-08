/*
 * Name : Mauro Petrucci, Matteo Busetto
 * Module : Controller::profileController
 * Description: profilo utente, con il cambio password.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import { MIN_PASSWORD_LENGTH } from '../access/access';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Profilo di {{ auth.username() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button matButton="filled" (click)="editPassword.set(!editPassword())">Cambia Password</button>

        @if (editPassword()) {
          <form (ngSubmit)="changePassword()">
            <mat-form-field>
              <mat-label>Password Attuale</mat-label>
              <input matInput name="password" type="password" autocomplete="current-password" [(ngModel)]="password" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Nuova Password</mat-label>
              <input matInput name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Conferma Nuova Password</mat-label>
              <input matInput name="confirmPassword" type="password" autocomplete="new-password" [(ngModel)]="confirmPassword" />
            </mat-form-field>
            <button matButton="filled" type="submit" [disabled]="busy()">Conferma</button>
          </form>
        }
        @if (message()) {
          <p class="message">{{ message() }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }
    mat-card {
      width: 100%;
      max-width: 480px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .message {
      margin-top: 16px;
    }
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  private readonly notify = inject(NotifyService);

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
