import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Premi - Login',
    data: { mode: 'login' },
    loadComponent: () => import('./pages/access/access').then((m) => m.Access),
  },
  {
    path: 'registrazione',
    canActivate: [guestGuard],
    title: 'Premi - Registrazione',
    data: { mode: 'register' },
    loadComponent: () => import('./pages/access/access').then((m) => m.Access),
  },
  {
    path: 'private',
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Premi',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'profile',
        title: 'Premi - Profilo',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'edit/:title',
        title: 'Premi - Modifica',
        loadComponent: () => import('./editor/editor').then((m) => m.Editor),
      },
      {
        path: 'execution/:title',
        title: 'Premi - Esecuzione',
        data: { fullscreen: true },
        loadComponent: () => import('./player/player').then((m) => m.Player),
      },
    ],
  },
  {
    path: 'offline',
    title: 'Premi - Offline',
    loadComponent: () => import('./pages/offline/offline-list').then((m) => m.OfflineList),
  },
  {
    path: 'offline/:title',
    title: 'Premi - Offline',
    data: { fullscreen: true, offline: true },
    loadComponent: () => import('./player/player').then((m) => m.Player),
  },
  { path: '**', redirectTo: 'login' },
];
