import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/service/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: {
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string>>;
    isAuthenticated: jest.Mock;
    login: jest.Mock;
  };
  let router: Router;
  let navigateByUrl: jest.SpyInstance;

  beforeEach(async () => {
    auth = {
      loading: signal(false),
      error: signal(''),
      isAuthenticated: jest.fn().mockReturnValue(false),
      login: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateByUrl = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks an empty form as submitted without calling the service', async () => {
    await component.submit();

    expect(component.submitted()).toBe(true);
    expect(component.form.invalid).toBe(true);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the dashboard with valid credentials', async () => {
    auth.login.mockResolvedValue(true);
    component.form.setValue({ email: 'alice@example.com', password: 'secret' });

    await component.submit();

    expect(auth.login).toHaveBeenCalledWith('alice@example.com', 'secret');
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('does not redirect when authentication fails', async () => {
    auth.login.mockResolvedValue(false);
    component.form.setValue({ email: 'alice@example.com', password: 'wrong' });

    await component.submit();

    expect(auth.login).toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
