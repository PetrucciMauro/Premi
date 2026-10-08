/*
 * Name : Matteo Busetto
 * Module : Controller::HeaderController
 * Description: intestazione con saluto e collegamenti alle pagine.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from './core/auth.service';

const deepest = (route: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  route.firstChild ? deepest(route.firstChild) : route;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatToolbarModule, RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Il player occupa tutto lo schermo, senza intestazione. */
  protected readonly fullscreen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => !!deepest(this.router.routerState.snapshot.root).data['fullscreen']),
    ),
    { initialValue: false },
  );

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
