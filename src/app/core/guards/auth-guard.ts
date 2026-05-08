import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // El guardia mira la variable 'user$' de nuestro servicio
  return authService.user$.pipe(
    take(1), // Solo mira el estado actual una vez
    map(user => {
      if (user) {
        return true; // Si hay usuario, le abre la puerta
      } else {
        router.navigate(['/login']); // Si no hay usuario, lo manda al login
        return false;
      }
    })
  );
};