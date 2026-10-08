import { inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const ICONS = [
  'background',
  'bookmark',
  'bookmark_delete',
  'bookmark_not_active',
  'bringback',
  'bringfront',
  'delete',
  'font',
  'fontsize',
  'insertElementIcon',
  'menu',
  'path',
  'path_disabled',
  'play',
  'redoIcon',
  'redoIcon_not_active',
  'rotation',
  'save',
  'undoIcon',
  'undoIcon_not_active',
  'zoomout',
];

/** Registra le icone SVG di Premi (public/assets/svg) per usarle con <mat-icon svgIcon="...">. */
export function registerIcons(): void {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);
  for (const name of ICONS)
    registry.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`/assets/svg/${name}.svg`));
}
