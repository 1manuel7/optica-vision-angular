import { Component, inject, OnInit } from '@angular/core';
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

  pacienteId!: string;
  pacienteActual!: Paciente;
  pacienteForm!: FormGroup;
  historialOrdenes: OrdenTrabajo[] = [];

  ngOnInit() {
    // 1. Obtenemos el ID del paciente desde la URL
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';

    // 2. Buscamos al paciente en la base de datos
    const pacienteEncontrado = this.pacienteService.getPacientePorId(this.pacienteId);
    
    if (pacienteEncontrado) {
      this.pacienteActual = pacienteEncontrado;
      this.inicializarFormulario();
      this.cargarHistorial();
    } else {
      // Si escriben un ID falso en la URL, lo regresamos al directorio
      alert('Paciente no encontrado');
      this.router.navigate(['/directorio']);
    }
  }

  inicializarFormulario() {
    // Creamos el formulario PRE-LLENADO con los datos actuales
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
    // Filtramos todas las órdenes de la óptica para mostrar solo las de este paciente
    this.ordenService.ordenes$.subscribe(todasLasOrdenes => {
      this.historialOrdenes = todasLasOrdenes.filter(orden => orden.paciente.id === this.pacienteId);
    });
  }

  guardarCambios() {
    if (this.pacienteForm.valid) {
      // Unimos el ID original con los datos nuevos del formulario
      const pacienteActualizado: Paciente = {
        id: this.pacienteId,
        ...this.pacienteForm.value
      };
      
      this.pacienteService.actualizarPaciente(pacienteActualizado);
      alert('¡Datos del paciente actualizados correctamente!');
      this.router.navigate(['/directorio']);
    }
  }

  volver() {
    this.router.navigate(['/directorio']);
  }
}