import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos la tabla corporativa de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { PacienteService } from '../../../core/services/paciente';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './paciente-list.html'
})
export class PacienteListComponent {
  private pacienteService = inject(PacienteService);
  
  // Traemos la lista reactiva de pacientes directamente del servicio
  pacientes$ = this.pacienteService.pacientes$;
  
  // Le decimos a la tabla exactamente qué columnas queremos mostrar
  columnasMostrar: string[] = ['dni', 'nombre', 'telefono', 'receta'];
}