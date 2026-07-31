import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor — attaches Supabase access token to every API request.
 * The Spring Boot API Gateway validates this token.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip auth header for Supabase direct calls and public endpoints
  if (req.url.includes('supabase.co') || req.url.includes('/auth/login')) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
      return next(req);
    })
  );
};
