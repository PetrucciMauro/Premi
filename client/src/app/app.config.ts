import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import {
  ApplicationConfig,
  ErrorHandler,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { registerIcons } from './core/icons';
import { NotifyErrorHandler } from './core/notify.service';

registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'it' },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAppInitializer(registerIcons),
    { provide: ErrorHandler, useClass: NotifyErrorHandler },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
  ],
};
