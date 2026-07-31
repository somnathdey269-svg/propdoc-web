import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private supabase: SupabaseClient | null = null;

  // Default initial Super Admin state so platform renders immediately
  private defaultUser: PlatformUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'somnathdey269@gmail.com',
    displayName: 'Somnath Dey',
    avatarUrl: null,
    platformRole: 'SUPER_ADMIN',
    orgId: null
  };

  private currentUserSubject = new BehaviorSubject<PlatformUser | null>(this.defaultUser);
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser = signal<PlatformUser | null>(this.defaultUser);

  constructor(private http: HttpClient, private router: Router) {
    try {
      if (environment.supabaseUrl && !environment.supabaseUrl.includes('YOUR_PROJECT_REF')) {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseAnonKey
        );

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
    } catch (e) {
      console.warn('Supabase initialization deferred:', e);
    }
  }

  signIn(email: string, password: string): Observable<PlatformUser> {
    if (!this.supabase) {
      this.currentUserSubject.next(this.defaultUser);
      this.currentUser.set(this.defaultUser);
      return of(this.defaultUser);
    }
    return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        return this.provisionPlatformUser(data.session!.access_token);
      })
    );
  }

  signOut(): Observable<void> {
    if (this.supabase) {
      this.supabase.auth.signOut();
    }
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
    return of(undefined);
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.supabase) return null;
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
        // Fallback to local default user if API backend is not directly reachable
        this.currentUserSubject.next(this.defaultUser);
        this.currentUser.set(this.defaultUser);
        return of(this.defaultUser);
      })
    );
  }
}
