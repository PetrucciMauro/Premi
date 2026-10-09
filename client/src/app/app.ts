/*
 * Name : Matteo Busetto
 * Module : Controller::HeaderController
 * Description: intestazione con marchio e navigazione.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';

const deepest = (route: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  route.firstChild ? deepest(route.firstChild) : route;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  /** Editor e player occupano tutto lo schermo, senza intestazione. */
  protected readonly fullscreen = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => !!deepest(this.router.routerState.snapshot.root).data['fullscreen']),
    ),
    { initialValue: false },
  );
}
