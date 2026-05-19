import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // <-- ¡NUEVO! Para las listas desplegables
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Tus Servicios
import { OrdenService } from '../../../core/services/orden';
import { MonturaService } from '../../../core/services/montura';
import { PacienteService } from '../../../core/services/paciente'; // Asegúrate de tener la ruta correcta

@Component({
  selector: 'app-orden-registro',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './orden-registro.html'
})
export class OrdenRegistroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordenService = inject(OrdenService);
  private monturaService = inject(MonturaService);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cargando = false;
  pacientes: any[] = [];
  monturas: any[] = [];

  ventaForm = this.fb.group({
    paciente_id: ['', Validators.required],
    montura_id: ['', Validators.required],
    monto_total: [0, [Validators.required, Validators.min(1)]],
    adelanto: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    // 1. Cargamos la lista de pacientes para el desplegable
    this.pacienteService.pacientes$.subscribe(data => {
      this.pacientes = data;
    });

    // 2. Cargamos la lista de monturas (solo las que tienen stock mayor a 0)
    this.monturaService.monturas$.subscribe(data => {
      this.monturas = data.filter(m => m.stock > 0);
    });

    // 🌟 TRUCO PRO: Si el usuario elige una montura, autocompletamos el precio total
    this.ventaForm.get('montura_id')?.valueChanges.subscribe(idSeleccionado => {
      const monturaElegida = this.monturas.find(m => m.id === idSeleccionado);
      if (monturaElegida) {
        this.ventaForm.patchValue({ monto_total: monturaElegida.precio });
      }
    });
  }

  async guardarVenta() {
    if (this.ventaForm.invalid) return;

    this.cargando = true;
    const { paciente_id, montura_id, monto_total, adelanto } = this.ventaForm.value;

    const exito = await this.ordenService.crearOrden(
      paciente_id!, 
      montura_id!, 
      Number(monto_total), 
      Number(adelanto)
    );
    
    this.cargando = false;
    
    if (exito) {
      this.snackBar.open('✅ Venta registrada y stock descontado', 'Cerrar', {
        duration: 3500, horizontalPosition: 'center', verticalPosition: 'bottom'
      });
      this.router.navigate(['/pedidos']); // Redirige a la lista de laboratorio
    } else {
      this.snackBar.open('❌ Error al registrar la venta.', 'Cerrar', { duration: 4000 });
    }
  }
}