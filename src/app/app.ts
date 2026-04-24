import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para usar pipes y directivas
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'catalogo-optica';
  
  // Inyectamos el servicio para saber el estado
  authService = inject(AuthService);

  cerrarSesion() {
    this.authService.logout();
  }
}