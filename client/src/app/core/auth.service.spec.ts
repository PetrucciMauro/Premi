import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { sha1 } from './crypto';

// token firmato per l'utente "mario", senza scadenza
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user: 'mario' })).replace(/=+$/, '') + '.firma';

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sha1 è compatibile con le password salvate dalla vecchia versione (CryptoJS)', async () => {
    expect(await sha1('abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('il login invia le credenziali cifrate e conserva il token', async () => {
    const login = auth.login('mario', 'segreto1');
    await flush();
    const req = http.expectOne('/account/authenticate');
    expect(req.request.headers.get('Authorization')).toBe('mario:' + (await sha1('segreto1')));
    req.flush({ success: true, message: 'ok' }, { headers: { Authorization: TOKEN } });
    await login;

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.username()).toBe('mario');
    expect(localStorage.getItem('premi.token')).toBe(TOKEN);

    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('premi.token')).toBeNull();
  });

  it('il cambio password invia utente, vecchia e nuova password', async () => {
    localStorage.setItem('premi.token', TOKEN);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    const change = auth.changePassword('vecchia1', 'nuova123');
    await flush();
    const req = http.expectOne('/account/changepassword');
    expect(req.request.headers.get('Authorization')).toBe(
      ['mario', await sha1('vecchia1'), await sha1('nuova123')].join(':'),
    );
    req.flush({ success: true, message: 'Password updated' });
    await change;
  });
});
