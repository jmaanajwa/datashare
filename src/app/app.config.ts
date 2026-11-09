import {ApplicationConfig} from '@angular/core';
import {HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

const authInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('datashare.token');
  return next(token ? request.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : request);
};

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
};
