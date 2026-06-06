import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
// Importamos módulos nativos para el Datepicker de Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CitaService, Cita } from '../../core/services/cita.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule // <-- Agregados para el calendario interactivo
  ],
  templateUrl: './agenda.html'
})
export class AgendaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private miServicioCitas = inject(CitaService);
  private cdr = inject(ChangeDetectorRef); // <-- Inyectamos el "recargador" visual

  citaForm!: FormGroup;
  citas: Cita[] = [];

  ngOnInit() {
    this.citaForm = this.fb.group({
      paciente_nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      // Usaremos dos campos separados para la UI: fecha (calendario) y hora (texto/selector)
      fecha_ui: ['', Validators.required],
      hora_ui: ['', Validators.required],
      motivo: ['Medición de Vista', Validators.required]
    });

    this.miServicioCitas.citas$.subscribe(data => {
      this.citas = data;
      this.cdr.detectChanges(); // <-- Forzamos a que Angular pinte la nueva lista de inmediato
    });
  }

  async agendar() {
    if (this.citaForm.valid) {
      // 1. Construimos la fecha completa a partir de la fecha (Date) y la hora (string)
      const fechaBase: Date = this.citaForm.value.fecha_ui;
      const horaStr: string = this.citaForm.value.hora_ui; // Formato esperado "HH:mm" (ej. "14:30")
      
      const [horas, minutos] = horaStr.split(':');
      fechaBase.setHours(parseInt(horas, 10), parseInt(minutos, 10), 0, 0);

      // Convertimos a ISO string para guardar en BD
      const fechaFinalISO = fechaBase.toISOString();

      // 2. Verificamos choques de horario
      // Comparamos el inicio de la hora elegida. 
      // Ojo: En un sistema estricto, darías un margen de 30 mins, aquí checamos la hora exacta.
      const conflicto = this.citas.find(c => {
        const fechaExistente = new Date(c.fecha);
        return fechaExistente.getTime() === fechaBase.getTime();
      });

      if (conflicto) {
        alert('¡Horario ocupado! Ya hay una cita programada a esa hora exacta.');
        return; // Detenemos el guardado
      }

      // 3. Preparamos el objeto para guardar
      const nuevaCita: Cita = {
        paciente_nombre: this.citaForm.value.paciente_nombre,
        telefono: this.citaForm.value.telefono,
        motivo: this.citaForm.value.motivo,
        fecha: fechaFinalISO,
        estado: 'PENDIENTE'
      };

      // 4. Guardamos en la base de datos
      const { error } = await this.miServicioCitas.crearCita(nuevaCita);
      
      if (!error) {
        alert('¡Cita registrada con éxito!');
        // Reseteamos el formulario manteniendo valores por defecto útiles
        this.citaForm.reset({ motivo: 'Medición de Vista', hora_ui: '10:00' }); 
        // La lista se actualizará sola gracias a la suscripción del ngOnInit
      } else {
        alert('Error al registrar la cita');
      }
    }
  }

  cambiarEstado(id: string, estado: string) {
    this.miServicioCitas.actualizarEstado(id, estado);
  }
}