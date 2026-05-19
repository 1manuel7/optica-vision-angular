import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Buscamos si ya tenía el modo oscuro guardado en su navegador, si no, empezamos en falso (claro)
  private isDarkMode = new BehaviorSubject<boolean>(
    localStorage.getItem('darkMode') === 'true'
  );
  
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Al iniciar la app, aplicamos el tema que estaba guardado
    this.aplicarTema(this.isDarkMode.value);
  }

  toggleDarkMode() {
    const nuevoEstado = !this.isDarkMode.value;
    this.isDarkMode.next(nuevoEstado);
    localStorage.setItem('darkMode', String(nuevoEstado));
    this.aplicarTema(nuevoEstado);
  }

  private aplicarTema(esOscuro: boolean) {
    if (esOscuro) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}