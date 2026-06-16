import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CitaService, Cita } from '../../core/services/cita.service';
import Swal from 'sweetalert2'; // <-- IMPORTAMOS SWEETALERT2

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './agenda.html'
})
export class AgendaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private miServicioCitas = inject(CitaService);
  private cdr = inject(ChangeDetectorRef);

  citaForm!: FormGroup;
  
  // Dividimos la lista en dos arreglos
  citasPendientes: Cita[] = [];
  citasPasadas: Cita[] = [];

  ngOnInit() {
    this.citaForm = this.fb.group({
      paciente_nombre: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]], // Validación peruana añadida
      fecha_ui: ['', Validators.required],
      hora_ui: ['', Validators.required],
      motivo: ['Medición de Vista', Validators.required]
    });

    this.miServicioCitas.citas$.subscribe(data => {
      // Filtramos las citas automáticamente
      this.citasPendientes = data.filter(c => c.estado === 'PENDIENTE');
      this.citasPasadas = data.filter(c => c.estado === 'COMPLETADO' || c.estado === 'CANCELADO');
      
      this.cdr.detectChanges(); 
    });
  }

  async agendar() {
    if (this.citaForm.valid) {
      const fechaBase: Date = this.citaForm.value.fecha_ui;
      const horaStr: string = this.citaForm.value.hora_ui; 
      
      const [horas, minutos] = horaStr.split(':');
      fechaBase.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);

      const fechaFinalISO = fechaBase.toISOString();

      const conflicto = this.citasPendientes.find(c => {
        const fechaExistente = new Date(c.fecha);
        return fechaExistente.getTime() === fechaBase.getTime();
      });

      if (conflicto) {
        Swal.fire('Horario Ocupado', 'Ya hay una cita programada a esa hora exacta.', 'warning');
        return; 
      }

      const nuevaCita: Cita = {
        paciente_nombre: this.citaForm.value.paciente_nombre,
        telefono: this.citaForm.value.telefono,
        motivo: this.citaForm.value.motivo,
        fecha: fechaFinalISO,
        estado: 'PENDIENTE'
      };

      const { error } = await this.miServicioCitas.crearCita(nuevaCita);
      
      if (!error) {
        Swal.fire('¡Cita Agendada!', 'El turno ha sido registrado correctamente.', 'success');
        this.citaForm.reset({ motivo: 'Medición de Vista', hora_ui: '10:00' }); 
        
        // Limpiamos los colores de error
        Object.keys(this.citaForm.controls).forEach(key => {
          this.citaForm.get(key)?.setErrors(null);
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al registrar la cita en la nube.', 'error');
      }
    } else {
      this.citaForm.markAllAsTouched();
    }
  }

  cambiarEstado(id: string, estado: string) {
    this.miServicioCitas.actualizarEstado(id, estado);
    
    // Mostramos un mensajito rápido en la esquina (Toast) para no interrumpir
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      icon: 'success',
      title: `Estado cambiado a ${estado}`
    });
  }
}