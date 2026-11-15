import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let auth: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string>>;
    isAuthenticated: jest.Mock;
    register: jest.Mock;
  };
  let router: Router;
  let navigateByUrl: jest.SpyInstance;

  beforeEach(async () => {
    auth = {
      loading: signal(false),
      error: signal(''),
      isAuthenticated: jest.fn().mockReturnValue(false),
      register: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrl = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.useRealTimers());

  it('rejects a confirmation password that does not match', async () => {
    component.form.setValue({
      email: 'alice@example.com',
      password: 'secret',
      confirmPassword: 'different',
    });

    await component.submit();

    expect(component.submitted()).toBe(true);
    expect(component.form.controls.confirmPassword.invalid).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers the user and redirects to login after confirmation', async () => {
    jest.useFakeTimers();
    auth.register.mockResolvedValue(true);
    component.form.setValue({
      email: 'alice@example.com',
      password: 'secret',
      confirmPassword: 'secret',
    });

    await component.submit();

    expect(auth.register).toHaveBeenCalledWith('alice@example.com', 'secret');
    expect(component.confirmation()).toContain('Compte');
    expect(navigateByUrl).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not show a confirmation when registration fails', async () => {
    auth.register.mockResolvedValue(false);
    component.form.setValue({
      email: 'alice@example.com',
      password: 'secret',
      confirmPassword: 'secret',
    });

    await component.submit();

    expect(auth.register).toHaveBeenCalled();
    expect(component.confirmation()).toBe('');
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
