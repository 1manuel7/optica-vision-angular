import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Montura } from '../../../core/services/models/montura.model';
import { MatIconModule } from '@angular/material/icon';
import { MonturaService } from '../../../core/services/montura'; // <-- Aseguramos la ruta correcta

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

  // --- NUEVA FUNCIÓN: REABASTECIMIENTO RÁPIDO ---
  async reabastecer() {
    const cantidadStr = prompt(`¿Cuántas unidades nuevas de ${this.montura.marca} acaban de llegar?`);
    
    if (cantidadStr) {
      const cantidad = parseInt(cantidadStr, 10);
      
      if (!isNaN(cantidad) && cantidad > 0) {
        // Llamamos a la función que acabas de crear en el servicio
        const exito = await this.monturaService.agregarStock(this.montura.id!, cantidad);
        
        if (exito) {
          alert(`¡Se agregaron ${cantidad} unidades al inventario con éxito!`);
        } else {
          alert('Hubo un error al intentar actualizar el stock.');
        }
      } else {
        alert('Por favor, ingresa un número válido mayor a 0.');
      }
    }
  }
}