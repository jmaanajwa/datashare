import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let navigateByUrl: jest.Mock;

  const encode = (value: string): string =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const tokenFor = (email: string): string =>
    `${encode('{"alg":"none"}')}.${encode(JSON.stringify({ sub: email }))}.signature`;

  beforeEach(() => {
    localStorage.clear();
    navigateByUrl = jest.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigateByUrl } },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('authenticates a user and stores the JWT identity', async () => {
    const promise = service.login('alice@example.com', 'secret');
    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'alice@example.com', password: 'secret' });
    request.flush({ token: tokenFor('alice@example.com') });

    await expect(promise).resolves.toBe(true);
    expect(service.user()).toEqual({ id: 'alice@example.com', email: 'alice@example.com' });
    expect(localStorage.getItem('datashare.token')).toContain(tokenFor('alice@example.com'));
    expect(service.isAuthenticated()).toBe(true);
  });

  it('exposes the backend error when login fails', async () => {
    const promise = service.login('alice@example.com', 'wrong');
    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/login`);
    request.flush({ message: 'Compte invalide' }, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).resolves.toBe(false);
    expect(service.error()).toBe('Compte invalide');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('registers a user with the backend', async () => {
    const promise = service.register('new@example.com', 'secret');
    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/register`);

    expect(request.request.body).toEqual({ email: 'new@example.com', password: 'secret' });
    request.flush({ token: tokenFor('new@example.com') });

    await expect(promise).resolves.toBe(true);
    expect(service.user()).toBeNull();
  });

  it('clears the session and redirects on logout', () => {
    localStorage.setItem('datashare.token', 'token');
    localStorage.setItem('datashare.user', JSON.stringify({ id: 'a', email: 'a@example.com' }));

    service.logout();

    expect(service.user()).toBeNull();
    expect(localStorage.getItem('datashare.token')).toBeNull();
    expect(navigateByUrl).toHaveBeenCalledWith('/upload');
  });
});
