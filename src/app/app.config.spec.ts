import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

describe('appConfig HTTP interceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('adds the bearer token when a session exists', () => {
    localStorage.setItem('datashare.token', 'jwt-token');
    http.get('/protected').subscribe();

    const request = controller.expectOne('/protected');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });

  it('leaves public requests unchanged without a session', () => {
    http.get('/public').subscribe();

    const request = controller.expectOne('/public');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
