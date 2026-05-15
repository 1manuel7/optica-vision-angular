import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonturaService } from '../../../core/services/montura';

// 1. ¡IMPORTAMOS EL SNACKBAR!
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-montura-registro',
  standalone: true,
  // 2. Lo agregamos a los imports del componente
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule 
  ],
  templateUrl: './montura-registro.html'
})
export class MonturaRegistroComponent {
  private fb = inject(FormBuilder);
  private monturaService = inject(MonturaService);
  private router = inject(Router);
  
  // 3. Inyectamos la herramienta para poder usarla
  private snackBar = inject(MatSnackBar);

  archivoSeleccionado: File | null = null;
  cargando = false;

  monturaForm = this.fb.group({
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    color: ['', Validators.required],
    material: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  async guardar() {
    if (this.monturaForm.invalid) return;

    this.cargando = true;
    const datosForm = this.monturaForm.value;
    let urlImagen = '';

    if (this.archivoSeleccionado) {
      const urlSubida = await this.monturaService.subirFotoMontura(this.archivoSeleccionado);
      if (urlSubida) urlImagen = urlSubida;
    }

    const nuevaMontura: any = {
      ...datosForm,
      imagen_url: urlImagen 
    };

    // 1. Ahora guardamos y esperamos un true o false
    const exito = await this.monturaService.crearMontura(nuevaMontura);
    
    this.cargando = false;
    
    // 2. Evaluamos la respuesta correctamente
    if (exito) {
      // LA MAGIA DE LA NOTIFICACIÓN
      this.snackBar.open('✅ Montura guardada exitosamente en el catálogo', 'Cerrar', {
        duration: 3500, // Desaparece sola en 3.5 segundos
        horizontalPosition: 'center', // Aparece en el centro
        verticalPosition: 'bottom', // Aparece abajo
      });

      this.router.navigate(['/catalogo']); 
    } else {
      // Notificación de error por si algo falla en Supabase
      this.snackBar.open('❌ Error al guardar la montura. Inténtalo de nuevo.', 'Cerrar', {
        duration: 4000,
      });
    }
  }
}