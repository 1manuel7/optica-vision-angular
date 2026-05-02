import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { PacienteService, Paciente } from '../../../core/services/paciente';
import { OrdenService, OrdenTrabajo } from '../../../core/services/orden';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatDividerModule, MatIconModule
  ],
  templateUrl: './paciente-detalle.html'
})
export class PacienteDetalleComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private ordenService = inject(OrdenService);
  private cdr = inject(ChangeDetectorRef);

  pacienteId!: string;
  pacienteActual!: Paciente;
  pacienteForm!: FormGroup;
  historialOrdenes: OrdenTrabajo[] = [];

  // 1. Agregamos 'async' porque ahora nos comunicamos con la nube
async ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';

    const pacienteEncontrado = await this.pacienteService.getPacientePorId(this.pacienteId);
    
    if (pacienteEncontrado) {
      this.pacienteActual = pacienteEncontrado;
      this.inicializarFormulario();
      this.cargarHistorial();
      
      // 2. ¡EL PELLIZCO! Obligamos a Angular a pintar los datos inmediatamente
      this.cdr.detectChanges();

    } else {
      alert('Paciente no encontrado');
      this.router.navigate(['/directorio']);
    }
  }

  inicializarFormulario() {
    this.pacienteForm = this.fb.group({
      nombre: [this.pacienteActual.nombre, [Validators.required, Validators.minLength(3)]],
      dni: [this.pacienteActual.dni, [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      telefono: [this.pacienteActual.telefono, Validators.required],
      esferaOD: [this.pacienteActual.esferaOD, Validators.required],
      cilindroOD: [this.pacienteActual.cilindroOD],
      ejeOD: [this.pacienteActual.ejeOD],
      esferaOI: [this.pacienteActual.esferaOI, Validators.required],
      cilindroOI: [this.pacienteActual.cilindroOI],
      ejeOI: [this.pacienteActual.ejeOI]
    });
  }

  cargarHistorial() {
    // Nota: Aún usamos el servicio de órdenes local, luego lo migraremos también
    this.ordenService.ordenes$.subscribe(todasLasOrdenes => {
      this.historialOrdenes = todasLasOrdenes.filter(orden => orden.paciente_id === this.pacienteId);
    });
  }

  // 3. Agregamos 'async' para el proceso de guardado
  async guardarCambios() {
    if (this.pacienteForm.valid) {
      try {
        // 4. Pasamos los 2 argumentos que exige el nuevo servicio (ID y Formulario)
        await this.pacienteService.actualizarPaciente(this.pacienteId, this.pacienteForm.value);
        
        alert('¡Datos actualizados en la nube correctamente!');
        this.router.navigate(['/directorio']);
      } catch (error) {
        alert('Hubo un error al actualizar los datos.');
        console.error(error);
      }
    }
  }

  volver() {
    this.router.navigate(['/directorio']);
  }
}