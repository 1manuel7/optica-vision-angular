import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // BehaviorSubject para saber si hay alguien logueado (empieza en false)
  private usuarioAutenticado = new BehaviorSubject<boolean>(false);
  
  // Observable público para que otras partes de la app lo escuchen
  isLoggedIn$ = this.usuarioAutenticado.asObservable();

  // Getter simple para usar en los Guards
  get isLoggedIn(): boolean {
    return this.usuarioAutenticado.value;
  }

  // Método simulado de Login
  login(usuario: string, contrasena: string): boolean {
    // En la vida real, aquí haríamos una petición HTTP al backend.
    // Por ahora, simularemos que el usuario correcto es 'admin' y clave '1234'
    if (usuario === 'admin' && contrasena === '1234') {
      this.usuarioAutenticado.next(true);
      this.router.navigate(['/catalogo']); // Lo enviamos al sistema
      return true;
    }
    return false; // Credenciales incorrectas
  }

  // Método para cerrar sesión
  logout() {
    this.usuarioAutenticado.next(false);
    this.router.navigate(['/login']); // Lo pateamos a la pantalla de login
  }
}