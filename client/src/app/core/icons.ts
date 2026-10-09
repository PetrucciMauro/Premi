import { inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS, svg } from './icon-shapes';

/** Registra le icone di Premi per usarle con <mat-icon svgIcon="...">. */
export function registerIcons(): void {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);
  for (const [name, body] of Object.entries(ICONS))
    registry.addSvgIconLiteral(name, sanitizer.bypassSecurityTrustHtml(svg(body)));
}
