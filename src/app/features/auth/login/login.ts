import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulario con validaciones (requerido y formato correo)
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMensaje = '';
  cargando = false;

  async iniciarSesion() {
    if (this.loginForm.invalid) return;

    this.cargando = true;
    this.errorMensaje = '';
    
    // Obtenemos los datos del formulario
    const email = this.loginForm.value.email!;
    const password = this.loginForm.value.password!;

    // Llamamos a nuestro servicio de seguridad
    const { error } = await this.authService.login(email, password);

    if (error) {
      this.errorMensaje = 'Correo o contraseña incorrectos. Intente de nuevo.';
      this.cargando = false;
    } else {
      // Si todo sale bien, lo mandamos al Dashboard
      this.router.navigate(['/dashboard']); 
    }
  }
}