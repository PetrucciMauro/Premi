import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Messaggio leggibile da un errore qualsiasi (anche le risposte d'errore del server). */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const message = (err.error as { message?: unknown } | null)?.message;
    if (typeof message === 'string' && message) return message;
    return err.status === 0 ? 'Il server non risponde' : `Errore del server (${err.status})`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snackBar = inject(MatSnackBar);

  info(message: string): void {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }

  error(err: unknown): void {
    this.snackBar.open(errorMessage(err), 'Chiudi', { duration: 6000, panelClass: 'snack-error' });
  }
}

/** Mostra all'utente gli errori non gestiti invece di lasciarli solo nella console. */
@Injectable()
export class NotifyErrorHandler implements ErrorHandler {
  private readonly notify = inject(NotifyService);

  handleError(error: unknown): void {
    console.error(error);
    this.notify.error((error as { rejection?: unknown })?.rejection ?? error);
  }
}
