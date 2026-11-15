import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let auth: { isAuthenticated: jest.Mock };
  let router: { createUrlTree: jest.Mock };

  beforeEach(() => {
    auth = { isAuthenticated: jest.fn() };
    router = { createUrlTree: jest.fn().mockReturnValue({ redirect: '/login' }) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows access for an authenticated user', () => {
    auth.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects anonymous users to login', () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toEqual({ redirect: '/login' });
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
