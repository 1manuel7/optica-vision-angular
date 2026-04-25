import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material para una tabla profesional
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips'; // Para etiquetas de colores

import { OrdenService, EstadoOrden } from '../../../core/services/orden';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatTableModule, 
    MatCardModule, 
    MatSelectModule, 
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './orden-list.html'
})
export class OrdenListComponent {
  private ordenService = inject(OrdenService);
  
  ordenes$ = this.ordenService.ordenes$;
  
  // Columnas para la trazabilidad total
  columnas: string[] = ['fecha', 'paciente', 'montura', 'estado', 'acciones'];

  // Los estados posibles para el menú desplegable
  estados: EstadoOrden[] = ['Pendiente', 'En Proceso', 'Entregado'];

  cambiarEstado(id: string, nuevoEstado: any) {
    this.ordenService.actualizarEstado(id, nuevoEstado);
  }

 // Función para darle un estilo corporativo a los estados
  getEstadoStyle(estado: string) {
    switch (estado) {
      case 'Pendiente': 
        return { 'background-color': '#fff3cd', 'color': '#856404', 'font-weight': 'bold', 'padding': '6px 12px', 'border-radius': '16px', 'display': 'inline-block' };
      case 'En Proceso': 
        return { 'background-color': '#cce5ff', 'color': '#004085', 'font-weight': 'bold', 'padding': '6px 12px', 'border-radius': '16px', 'display': 'inline-block' };
      case 'Entregado': 
        return { 'background-color': '#d4edda', 'color': '#155724', 'font-weight': 'bold', 'padding': '6px 12px', 'border-radius': '16px', 'display': 'inline-block' };
      default: 
        return {};
    }
  }
}