/*
 * Gestione della sessione: login, registrazione, logout e cambio password.
 * Il token JWT restituito dal server viene conservato nel localStorage.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { decodeToken, sha1 } from './crypto';

const TOKEN_KEY = 'premi.token';

interface ServerResponse {
  success: boolean;
  message: string;
}

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(readToken());

  readonly token = this.tokenSignal.asReadonly();
  private readonly payload = computed(() => {
    const token = this.tokenSignal();
    return token ? decodeToken(token) : null;
  });
  readonly username = computed(() => this.payload()?.user ?? '');

  isLoggedIn(): boolean {
    const payload = this.payload();
    if (!payload) return false;
    return payload.exp === undefined || payload.exp * 1000 > Date.now();
  }

  async login(username: string, password: string): Promise<void> {
    const hash = await sha1(password);
    const res = await firstValueFrom(
      this.http.get<ServerResponse>('/account/authenticate', {
        headers: credentials(username, hash),
        observe: 'response',
      }),
    );
    const token = res.headers.get('Authorization');
    if (!token) throw new Error('Il server non ha restituito il token di sessione');
    this.setToken(token);
  }

  async register(username: string, password: string): Promise<void> {
    const hash = await sha1(password);
    await firstValueFrom(
      this.http.post<ServerResponse>('/account/register', null, { headers: credentials(username, hash) }),
    );
    await this.login(username, password);
  }

  async changePassword(password: string, newPassword: string): Promise<void> {
    const [hash, newHash] = await Promise.all([sha1(password), sha1(newPassword)]);
    await firstValueFrom(
      this.http.post<ServerResponse>('/account/changepassword', null, {
        headers: credentials(this.username(), hash, newHash),
      }),
    );
  }

  logout(): void {
    this.setToken(null);
  }

  private setToken(token: string | null): void {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // senza localStorage la sessione dura fino al refresh della pagina
    }
    this.tokenSignal.set(token);
  }
}

const credentials = (...parts: string[]) => new HttpHeaders({ Authorization: parts.join(':') });
