import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; // Asegúrate de tener estas
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service'; // Importamos el servicio de seguridad

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  // 1. Hacemos público el servicio de auth para que el HTML pueda leerlo
  authService = inject(AuthService);
  private router = inject(Router);

  // 2. Función para el botón "Salir"
  async cerrarSesion() {
    await this.authService.logout(); // Cierra la bóveda en Supabase
    this.router.navigate(['/login']); // Te patea de vuelta al login
  }
}