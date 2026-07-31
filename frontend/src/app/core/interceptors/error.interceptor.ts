import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Error Interceptor — maps HTTP errors to PrimeNG toast notifications.
 * 401 → redirect to login. 403 → show access denied toast.
 * All other errors → show server error code and message.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      const status = err.status;
      const apiError = err.error;

      if (status === 401) {
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }

      if (status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'You do not have permission to perform this action.',
          life: 5000
        });
        return throwError(() => err);
      }

      const code = apiError?.error?.code ?? 'ERR';
      const message = apiError?.error?.message ?? apiError?.message ?? 'An unexpected error occurred.';

      messageService.add({
        severity: 'error',
        summary: `Error [${code}]`,
        detail: message,
        life: 6000
      });

      return throwError(() => err);
    })
  );
};
