import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  platformRole: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TEAM_LEAD' | 'BUILDER' | 'VIEWER';
  orgId: string | null;
}

/**
 * AuthService — handles Supabase auth + platform user provisioning.
 * On login: Supabase session → call identity-service /api/identity/auth/verify
 * to provision/fetch the platform user with correct RBAC role.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<PlatformUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /** Signal for reactive current user access */
  public currentUser = signal<PlatformUser | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    // Restore session on app load
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.provisionPlatformUser(session.access_token).subscribe();
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /** Sign in with email/password via Supabase */
  signIn(email: string, password: string): Observable<PlatformUser> {
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        return this.provisionPlatformUser(data.session!.access_token);
      })
    );
  }

  /** Sign in with Google OAuth */
  signInWithGoogle(): Observable<void> {
    return from(this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })).pipe(switchMap(() => of(undefined)));
  }

  signOut(): Observable<void> {
    return from(this.supabase.auth.signOut()).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.currentUser.set(null);
      }),
      switchMap(() => of(undefined))
    );
  }

  /** Get current Supabase JWT for API calls */
  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && roles.includes(user.platformRole);
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  /** Call Spring Boot identity-service to provision/verify platform user */
  private provisionPlatformUser(accessToken: string): Observable<PlatformUser> {
    return this.http.post<{ data: PlatformUser }>(
      `${environment.apiBaseUrl}/api/identity/auth/verify`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ).pipe(
      tap(response => {
        this.currentUserSubject.next(response.data);
        this.currentUser.set(response.data);
      }),
      switchMap(response => of(response.data)),
      catchError(err => {
        console.error('Platform user provision failed', err);
        throw err;
      })
    );
  }
}
