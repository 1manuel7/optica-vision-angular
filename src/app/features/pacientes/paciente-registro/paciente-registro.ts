import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { PacienteService } from '../../../core/services/paciente';
import Swal from 'sweetalert2'; // <-- IMPORTAMOS LAS ALERTAS MODERNAS

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
  private pacienteService = inject(PacienteService);

  pacienteForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    // DNI: Exactamente 8 dígitos numéricos
    dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    // Celular: Empieza con 9 y le siguen 8 números (9 en total)
    telefono: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]],
    esferaOD: ['', Validators.required], cilindroOD: [''], ejeOD: [''],
    esferaOI: ['', Validators.required], cilindroOI: [''], ejeOI: ['']
  });

  async guardarPaciente() {
    if (this.pacienteForm.valid) {
      try {
        await this.pacienteService.agregarPaciente(this.pacienteForm.value);
        
        // Alerta de éxito moderna
        Swal.fire({
          title: '¡Éxito!',
          text: 'Paciente y receta registrados correctamente en la nube.',
          icon: 'success',
          confirmButtonColor: '#1976d2'
        });
        
        this.pacienteForm.reset();
        
        // Limpiamos los colores rojos del formulario tras guardarlo
        Object.keys(this.pacienteForm.controls).forEach(key => {
          this.pacienteForm.get(key)?.setErrors(null);
        });

      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al conectar con la base de datos.',
          icon: 'error',
          confirmButtonColor: '#d32f2f'
        });
      }
    } else {
      this.pacienteForm.markAllAsTouched();
      // Alerta moderna si faltan datos
      Swal.fire({
        title: 'Formulario Incompleto',
        text: 'Por favor, corrige los campos marcados en rojo antes de guardar.',
        icon: 'warning',
        confirmButtonColor: '#ef6c00'
      });
    }
  }
}