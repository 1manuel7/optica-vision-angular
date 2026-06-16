import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Montura } from '../../../core/services/models/montura.model';
import { MatIconModule } from '@angular/material/icon';
import { MonturaService } from '../../../core/services/montura';
import Swal from 'sweetalert2'; // <-- IMPORTAMOS LA LIBRERÍA DE ALERTAS

@Component({
  selector: 'app-montura-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './montura-card.html'
})
export class MonturaCardComponent {
  @Input({ required: true }) montura!: Montura;
  @Output() seleccionar = new EventEmitter<string>();

  // Inyectamos el servicio
  private monturaService = inject(MonturaService);

  onVerDetalle() {
    this.seleccionar.emit(this.montura.id);
  }

  // --- FUNCIÓN ACTUALIZADA: REABASTECIMIENTO CON SWEETALERT2 ---
  async reabastecer() {
    const { value: cantidadStr } = await Swal.fire({
      title: 'Agregar Stock',
      text: `¿Cuántas unidades nuevas de ${this.montura.marca} acaban de llegar?`,
      input: 'number',
      inputAttributes: { min: '1', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Añadir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2'
    });
    
    if (cantidadStr) {
      const cantidad = parseInt(cantidadStr, 10);
      
      if (!isNaN(cantidad) && cantidad > 0) {
        const exito = await this.monturaService.agregarStock(this.montura.id!, cantidad);
        
        if (exito) {
          Swal.fire('¡Actualizado!', `Se sumaron ${cantidad} unidades al inventario.`, 'success');
        } else {
          Swal.fire('Error', 'Hubo un error al intentar actualizar el stock.', 'error');
        }
      } else {
        Swal.fire('Atención', 'Por favor, ingresa un número válido mayor a 0.', 'warning');
      }
    }
  }

  // --- NUEVA FUNCIÓN: BORRAR CON SWEETALERT2 ---
  async borrar() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar la montura ${this.montura.marca} de forma permanente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
      const exito = await this.monturaService.eliminarMontura(this.montura.id!);
      
      if (exito) {
        Swal.fire('Eliminado', 'La montura fue borrada del catálogo.', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al intentar borrar.', 'error');
      }
    }
  }
}