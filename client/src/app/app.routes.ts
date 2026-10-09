import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'private/home' },
  {
    path: 'private',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Premi',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'edit/:title',
        title: 'Premi - Modifica',
        data: { fullscreen: true },
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
  { path: '**', redirectTo: 'private/home' },
];
