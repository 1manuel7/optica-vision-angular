import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// Importamos las interfaces que ya creamos antes
import { Paciente } from './paciente';
import { Montura } from './models/montura.model';

// Definimos los estados que pidió Luis en el documento
export type EstadoOrden = 'Pendiente' | 'En Proceso' | 'Entregado';

export interface OrdenTrabajo {
  id: string;
  paciente: Paciente;
  montura: Montura;
  fechaEmision: string;
  estado: EstadoOrden;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private readonly STORAGE_KEY = 'optica_ordenes';
  
  private ordenesSubject = new BehaviorSubject<OrdenTrabajo[]>(this.cargarOrdenes());
  ordenes$ = this.ordenesSubject.asObservable();

  // Lee las órdenes guardadas en el navegador
  private cargarOrdenes(): OrdenTrabajo[] {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
  }

  // Genera una nueva venta/orden de trabajo
  crearOrden(paciente: Paciente, montura: Montura) {
    const nuevaOrden: OrdenTrabajo = {
      id: crypto.randomUUID(),
      paciente: paciente,
      montura: montura,
      fechaEmision: new Date().toISOString(), // Fecha y hora exacta de la venta
      estado: 'Pendiente' // Toda orden nueva entra como pendiente
    };

    const listaActualizada = [nuevaOrden, ...this.ordenesSubject.value];
    this.ordenesSubject.next(listaActualizada);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(listaActualizada));
  }

  // Permite actualizar el estado (ej. pasarlo a "Entregado")
  actualizarEstado(idOrden: string, nuevoEstado: EstadoOrden) {
    const ordenes = this.ordenesSubject.value.map(orden => 
      orden.id === idOrden ? { ...orden, estado: nuevoEstado } : orden
    );
    this.ordenesSubject.next(ordenes);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ordenes));
  }
}