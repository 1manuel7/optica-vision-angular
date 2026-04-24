import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Montura } from '../services/models/montura.model';



@Injectable({
  providedIn: 'root'
})
export class StateService {

  // BehaviorSubject guarda el estado actual y lo emite a quien se suscriba
  // Iniciamos en 'null' porque al principio no hay ninguna montura seleccionada
  private ultimaMonturaVista = new BehaviorSubject<Montura | null>(null);

  // Observable público para que los componentes puedan "escuchar" los cambios
  ultimaMonturaVista$ = this.ultimaMonturaVista.asObservable();

  constructor() { }

  // Método para actualizar la información (Lo llamaremos desde la vista de detalle)
  setUltimaMontura(montura: Montura) {
    this.ultimaMonturaVista.next(montura);
  }

  // Método para limpiar la información
  limpiarUltimaMontura() {
    this.ultimaMonturaVista.next(null);
  }
}