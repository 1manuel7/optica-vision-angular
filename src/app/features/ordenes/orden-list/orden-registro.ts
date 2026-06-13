import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Tus Servicios
import { OrdenService } from '../../../core/services/orden';
import { MonturaService } from '../../../core/services/montura';
import { PacienteService } from '../../../core/services/paciente'; 

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
    adelanto: [0, [Validators.required, Validators.min(0)]],
    notas_laboratorio: [''] // <-- 1. AQUÍ AGREGAMOS EL NUEVO CAMPO VACÍO
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
    
    // 1. Extraemos los valores forzando el tipo exacto para evitar errores de TypeScript (el "as string" o los "||")
    const paciente_id = this.ventaForm.value.paciente_id as string;
    const montura_id = this.ventaForm.value.montura_id as string;
    const monto_total = Number(this.ventaForm.value.monto_total || 0);
    const adelanto = Number(this.ventaForm.value.adelanto || 0);
    const notas_laboratorio = this.ventaForm.value.notas_laboratorio ? String(this.ventaForm.value.notas_laboratorio) : '';

    // 2. Enviamos los datos 100% seguros al servicio
    const exito = await this.ordenService.crearOrden(
      paciente_id, 
      montura_id, 
      monto_total, 
      adelanto,
      notas_laboratorio
    );
    
    this.cargando = false;
    
    if (exito) {
      this.snackBar.open('✅ Venta registrada y orden enviada a laboratorio', 'Cerrar', {
        duration: 3500, horizontalPosition: 'center', verticalPosition: 'bottom'
      });
      this.router.navigate(['/pedidos']); // Redirige a la lista
    } else {
      this.snackBar.open('❌ Error al registrar la venta.', 'Cerrar', { duration: 4000 });
    }
  }
}