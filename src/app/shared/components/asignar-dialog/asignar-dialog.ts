import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Herramientas del Modal de Material
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; // Para el menú desplegable

// Nuestro servicio de base de datos de pacientes
import { PacienteService } from '../../../core/services/paciente';

@Component({
  selector: 'app-asignar-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatSelectModule
  ],
  templateUrl: './asignar-dialog.html'
})
export class AsignarDialogComponent {
  // Inyectamos los servicios necesarios
  private pacienteService = inject(PacienteService);
  
  // Estas dos líneas son la magia para que el modal funcione y reciba datos
  dialogRef = inject(MatDialogRef<AsignarDialogComponent>);
  datosMontura = inject(MAT_DIALOG_DATA); // Recibe la info desde la pantalla de detalle

  // Obtenemos la lista reactiva de pacientes
  pacientes$ = this.pacienteService.pacientes$;
  pacienteSeleccionado: any = null;

  cancelar() {
    this.dialogRef.close(); // Cierra el modal sin hacer nada
  }

  confirmarAsignacion() {
    if (this.pacienteSeleccionado) {
      // Cierra el modal y envía el paciente elegido de vuelta
      this.dialogRef.close(this.pacienteSeleccionado);
    }
  }
}