import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Le pagine private sono accessibili solo dopo il login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  auth.logout();
  return inject(Router).createUrlTree(['/login']);
};

/** Login e registrazione non servono a chi è già autenticato. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/private/home']) : true;
