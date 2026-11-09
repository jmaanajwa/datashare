import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AuthResponse, User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(this.readUser());
  readonly user = this.currentUser.asReadonly();
  readonly loading = signal(false);
  readonly error = signal('');

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  async login(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(
        `${API_CONFIG.baseUrl}/auth/login`, { email, password }));
      this.save(response);
      return true;
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Identifiants incorrects.'));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async register(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set('');
    try {
      await firstValueFrom(this.http.post<AuthResponse>(
        `${API_CONFIG.baseUrl}/auth/register`, { email, password }));
      return true;
    } catch (error) {
      this.error.set(this.errorMessage(error, 'Impossible de créer le compte.'));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('datashare.user');
    localStorage.removeItem('datashare.token');
    this.currentUser.set(null);
    void this.router.navigateByUrl('/upload');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && !!localStorage.getItem('datashare.token');
  }

  private save(response: AuthResponse): void {
    const email = this.readEmail(response.token);
    const user: User = { id: email, email };
    localStorage.setItem('datashare.user', JSON.stringify(user));
    localStorage.setItem('datashare.token', response.token);
    this.currentUser.set(user);
  }

  private readUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem('datashare.user') ?? 'null') as User | null;
    } catch {
      return null;
    }
  }

  private readEmail(token: string): string {
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = encoded.padEnd(encoded.length + (4 - encoded.length % 4) % 4, '=');
      const email = JSON.parse(atob(payload)).sub as string;
      if (!email) throw new Error('Sujet JWT absent.');
      return email;
    } catch {
      throw new Error('Réponse d’authentification invalide.');
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    return (error as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
