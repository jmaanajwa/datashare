import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';
import { SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  let fixture: ComponentFixture<SiteHeaderComponent>;
  let auth: { isAuthenticated: jest.Mock };

  beforeEach(async () => {
    auth = { isAuthenticated: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('shows a link to the login page when the user is not authenticated', () => {
    auth.isAuthenticated.mockReturnValue(false);
    fixture = TestBed.createComponent(SiteHeaderComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.login-button') as HTMLAnchorElement;
    expect(button.textContent?.trim()).toBe('Se connecter');
    expect(button.getAttribute('href')).toBe('/login');
  });

  it('shows a link to the dashboard when the user is authenticated', () => {
    auth.isAuthenticated.mockReturnValue(true);
    fixture = TestBed.createComponent(SiteHeaderComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.login-button') as HTMLAnchorElement;
    expect(button.textContent?.trim()).toBe('Mon espace');
    expect(button.getAttribute('href')).toBe('/dashboard');
  });
});
