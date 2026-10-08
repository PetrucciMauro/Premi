/*
 * Name : Matteo Busetto
 * Module : Controller::HeaderController
 * Description: intestazione con marchio, navigazione e menu utente.
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from './core/auth.service';

const deepest = (route: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  route.firstChild ? deepest(route.firstChild) : route;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Editor e player occupano tutto lo schermo, senza intestazione. */
  protected readonly fullscreen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => !!deepest(this.router.routerState.snapshot.root).data['fullscreen']),
    ),
    { initialValue: false },
  );

  protected readonly initial = computed(() => (this.auth.username() || '?').charAt(0));

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
