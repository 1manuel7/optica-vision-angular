import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; 

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el servicio de autenticación y el enrutador
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si hay sesión iniciada
  if (authService.isLoggedIn) {
    return true; // Acceso concedido
  } else {
    // Acceso denegado: lo enviamos al login
    router.navigate(['/login']);
    return false; 
  }
};