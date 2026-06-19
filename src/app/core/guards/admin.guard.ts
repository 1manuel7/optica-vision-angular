import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta si es necesario
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si la función nos confirma que es ADMIN, lo dejamos pasar
  if (authService.esAdmin()) {
    return true;
  } else {
    // Si es Vendedor, le bloqueamos el paso y le avisamos con estilo
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes permisos de Administrador para ver las finanzas.',
      confirmButtonColor: '#d32f2f'
    });
    
    // Lo redirigimos a la pantalla de la agenda o pedidos para que no se quede atascado
    router.navigate(['/pedidos']); 
    return false;
  }
};