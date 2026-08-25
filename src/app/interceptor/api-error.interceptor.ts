import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      console.error('Monitor API error:', error);

      const isMonitorApi =
        req.url.startsWith(environment.apiUrl);

      const backendUnavailable =
        error.status === 0 ||
        error.status >= 500;

      if (isMonitorApi && backendUnavailable) {

        router.navigate(['/']);

      }

      return throwError(() => error);

    })

  );

};