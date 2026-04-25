import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
// IMPORTAMOS NUESTRO NUEVO SERVICIO
import { PacienteService } from '../../../core/services/paciente';

@Component({
  selector: 'app-paciente-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './paciente-registro.html'
})
export class PacienteRegistroComponent {
  
  private fb = inject(FormBuilder);
  // INYECTAMOS EL SERVICIO AQUÍ
  private pacienteService = inject(PacienteService);

  pacienteForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    telefono: ['', Validators.required],
    esferaOD: ['', Validators.required], cilindroOD: [''], ejeOD: [''],
    esferaOI: ['', Validators.required], cilindroOI: [''], ejeOI: ['']
  });

  guardarPaciente() {
    if (this.pacienteForm.valid) {
      // ENVIAMOS LOS DATOS AL SERVICIO PARA QUE LOS GUARDE
      this.pacienteService.agregarPaciente(this.pacienteForm.value);
      
      alert('¡Paciente y receta guardados exitosamente en la base de datos local!');
      this.pacienteForm.reset();
    } else {
      this.pacienteForm.markAllAsTouched();
    }
  }
}