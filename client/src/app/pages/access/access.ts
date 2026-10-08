/*
 * Name : Matteo Busetto
 * Module : Controller::AuthenticationController
 * Description: pagine di login e di registrazione.
 */
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';

/** Come nella versione precedente: una password di 5 caratteri o meno è troppo debole. */
export const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-access',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './access.html',
  styleUrl: './access.scss',
})
export class Access {
  /** Impostato dai dati della rotta. */
  readonly mode = input<'login' | 'register'>('login');

  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected readonly usernameError = signal('');
  protected readonly passwordError = signal('');
  protected readonly busy = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly minLength = MIN_PASSWORD_LENGTH;

  protected async submit(): Promise<void> {
    const register = this.mode() === 'register';
    this.usernameError.set(this.username.trim() ? '' : 'Inserire username');
    this.passwordError.set(
      !this.password
        ? 'Inserire password'
        : register && this.password.length < MIN_PASSWORD_LENGTH
          ? `La password deve essere lunga almeno ${MIN_PASSWORD_LENGTH} caratteri`
          : '',
    );
    if (this.usernameError() || this.passwordError()) return;

    this.busy.set(true);
    try {
      if (register) await this.auth.register(this.username.trim(), this.password);
      else await this.auth.login(this.username.trim(), this.password);
      this.router.navigate(['/private/home']);
    } catch (err) {
      this.notify.error(err);
    } finally {
      this.busy.set(false);
    }
  }
}
