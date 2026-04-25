import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos la tabla corporativa de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { PacienteService } from '../../../core/services/paciente';
import { Router } from '@angular/router'; // Agrega esta importación arriba

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './paciente-list.html'
})
export class PacienteListComponent {
  private pacienteService = inject(PacienteService);
  private router = inject(Router); // Inyecta el enrutador
  
  // Traemos la lista reactiva de pacientes directamente del servicio
  pacientes$ = this.pacienteService.pacientes$;
  
  // Añade 'acciones' al final
  columnasMostrar: string[] = ['dni', 'nombre', 'telefono', 'receta', 'acciones'];

  verPerfil(id: string) {
    this.router.navigate(['/paciente', id]);
  }
}