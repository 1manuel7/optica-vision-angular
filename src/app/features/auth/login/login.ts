import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

// Módulos de Angular Material para un diseño corporativo
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  usuario = '';
  contrasena = '';
  mensajeError = false;

  // Inyectamos nuestro servicio de seguridad
  private authService = inject(AuthService);

  iniciarSesion() {
    // Llamamos al método login que creamos antes
    const exito = this.authService.login(this.usuario, this.contrasena);
    
    if (!exito) {
      this.mensajeError = true; // Mostramos el error en pantalla
    }
  }
}