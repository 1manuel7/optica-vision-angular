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
import { jsPDF } from 'jspdf';

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

  imprimirReceta() {
    if (!this.pacienteActual) return;

    // 1. Creamos un nuevo documento tamaño A4
    const doc = new jsPDF();

    // 2. Encabezado de la Óptica
    doc.setFontSize(22);
    doc.setTextColor(25, 118, 210); // Color azul de tu tema
    doc.text('ÓPTICA VISIÓN', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Receta Optométrica Oficial', 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35); // Línea separadora

    // 3. Datos del Paciente
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${this.pacienteActual.nombre}`, 20, 45);
    doc.text(`DNI: ${this.pacienteActual.dni}`, 20, 53);
    doc.text(`Teléfono: ${this.pacienteActual.telefono}`, 20, 61);
    
    // Fecha actual
    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha: ${fecha}`, 150, 45);

    // 4. Tabla de Medidas Visuales
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 75, 170, 10, 'F'); // Fondo gris para el título
    doc.setFont('helvetica', 'bold');
    doc.text('MEDIDAS VISUALES', 105, 82, { align: 'center' });
    
    // Ojo Derecho
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(211, 47, 47); // Rojo para OD
    doc.text('Ojo Derecho (OD):', 20, 100);
    doc.setTextColor(0, 0, 0);
    doc.text(`Esfera: ${this.pacienteActual.esferaOD || '0'}`, 60, 100);
    doc.text(`Cilindro: ${this.pacienteActual.cilindroOD || '0'}`, 110, 100);
    doc.text(`Eje: ${this.pacienteActual.ejeOD || '0'}°`, 160, 100);

    // Ojo Izquierdo
    doc.setTextColor(25, 118, 210); // Azul para OI
    doc.text('Ojo Izquierdo (OI):', 20, 115);
    doc.setTextColor(0, 0, 0);
    doc.text(`Esfera: ${this.pacienteActual.esferaOI || '0'}`, 60, 115);
    doc.text(`Cilindro: ${this.pacienteActual.cilindroOI || '0'}`, 110, 115);
    doc.text(`Eje: ${this.pacienteActual.ejeOI || '0'}°`, 160, 115);

    doc.line(20, 125, 190, 125); // Línea separadora final

    // 5. Firma y pie de página
    doc.text('_________________________', 105, 160, { align: 'center' });
    doc.text('Firma del Optómetra', 105, 168, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado por el Sistema de Gestión - Óptica Visión', 105, 280, { align: 'center' });

    // 6. ¡Magia! Descarga el archivo automáticamente
    doc.save(`Receta_${this.pacienteActual.nombre.replace(/\s+/g, '_')}.pdf`);
  }
}