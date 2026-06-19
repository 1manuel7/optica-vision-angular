import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { PacienteService, Paciente } from '../../../core/services/paciente';
import { OrdenService, OrdenTrabajo } from '../../../core/services/orden';
import { jsPDF } from 'jspdf';
import { IaService } from '../../../core/services/ia.service';

// <-- IMPORTAMOS CHART.JS -->
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatDividerModule, MatIconModule, RouterModule
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
  private iaService = inject(IaService);

  pacienteId!: string;
  pacienteActual!: Paciente;
  pacienteForm!: FormGroup;
  historialOrdenes: OrdenTrabajo[] = [];
  cargando = true;
  
  analisisIA: string = '';
  cargandoIA: boolean = false;

  // Variable para guardar el gráfico
  chartEvolucion: any;

  async ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';

    const pacienteEncontrado = await this.pacienteService.getPacientePorId(this.pacienteId);
    
    if (pacienteEncontrado) {
      this.pacienteActual = pacienteEncontrado;
      this.inicializarFormulario();
      this.cargarHistorial();
      
      this.cargando = false;
      this.cdr.detectChanges();

      // Damos un pequeño respiro de 100ms para que Angular dibuje el HTML antes de pintar el gráfico
      setTimeout(() => {
        this.crearGraficoEvolucion();
      }, 100);

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
    this.ordenService.ordenes$.subscribe(todasLasOrdenes => {
      this.historialOrdenes = todasLasOrdenes
        .filter(orden => orden.paciente_id === this.pacienteId)
        .sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime());
    });
  }

  async guardarCambios() {
    if (this.pacienteForm.valid) {
      try {
        await this.pacienteService.actualizarPaciente(this.pacienteId, this.pacienteForm.value);
        alert('¡Datos actualizados en la nube correctamente!');
        this.router.navigate(['/directorio']);
      } catch (error) {
        alert('Hubo un error al actualizar los datos.');
        console.error(error);
      }
    }
  }

  async generarAnalisisIA() {
    this.cargandoIA = true;
    this.analisisIA = '';
    try {
      this.analisisIA = await this.iaService.analizarMedidas(this.pacienteActual);
    } catch (error) {
      this.analisisIA = 'Hubo un problema al conectar con la IA.';
    }
    this.cargandoIA = false;
    this.cdr.detectChanges(); 
  }

  async pagarSaldo(orden: any) {
    const saldo = orden.monto_total - orden.adelanto;
    const confirmacion = confirm(`¿Confirmas que el paciente está pagando el saldo pendiente de S/ ${saldo}?`);
    
    if (confirmacion) {
      await this.ordenService.registrarPagoSaldo(orden.id, orden.monto_total);
      orden.adelanto = orden.monto_total;
      orden.estado = 'ENTREGADO';
      alert('¡Pago registrado y orden completada con éxito!');
    }
  }

  async enviarTicketCorreo(orden: any) {
    const correo = prompt(`Ingrese el correo electrónico de ${this.pacienteActual.nombre} para enviar el ticket:`);

    if (correo) {
      const descripcionMontura = orden.montura ? `${orden.montura.marca} - ${orden.montura.modelo}` : 'Montura Genérica';
      const saldo = (orden.monto_total || 0) - (orden.adelanto || 0);

      const templateParams = {
        to_email: correo,
        paciente_nombre: this.pacienteActual.nombre,
        fecha: new Date(orden.fecha || Date.now()).toLocaleDateString(),
        descripcion: descripcionMontura,
        notas_lab: orden.notas_laboratorio || 'N/A',
        total: orden.monto_total,
        adelanto: orden.adelanto,
        saldo: saldo
      };

      try {
        await emailjs.send('service_9lkhpzq', 'template_v4aqakl', templateParams, 'cY_7usaVDwoY1DtN-');
        alert('📧 ¡Ticket digital enviado con éxito al correo del paciente!');
      } catch (error) {
        alert('❌ Hubo un error al intentar enviar el correo. Revisa la consola.');
      }
    }
  }

  volver() {
    this.router.navigate(['/directorio']);
  }

  imprimirReceta() {
    // ... Tu código intacto de imprimir receta ...
    if (!this.pacienteActual) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(25, 118, 210); 
    doc.text('ÓPTICA VISIÓN', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Receta Optométrica Oficial', 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35); 
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${this.pacienteActual.nombre}`, 20, 45);
    doc.text(`DNI: ${this.pacienteActual.dni}`, 20, 53);
    doc.text(`Teléfono: ${this.pacienteActual.telefono}`, 20, 61);
    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha: ${fecha}`, 150, 45);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 75, 170, 10, 'F'); 
    doc.setFont('helvetica', 'bold');
    doc.text('MEDIDAS VISUALES', 105, 82, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(211, 47, 47); 
    doc.text('Ojo Derecho (OD):', 20, 100);
    doc.setTextColor(0, 0, 0);
    doc.text(`Esfera: ${this.pacienteActual.esferaOD || '0'}`, 60, 100);
    doc.text(`Cilindro: ${this.pacienteActual.cilindroOD || '0'}`, 110, 100);
    doc.text(`Eje: ${this.pacienteActual.ejeOD || '0'}°`, 160, 100);
    doc.setTextColor(25, 118, 210); 
    doc.text('Ojo Izquierdo (OI):', 20, 115);
    doc.setTextColor(0, 0, 0);
    doc.text(`Esfera: ${this.pacienteActual.esferaOI || '0'}`, 60, 115);
    doc.text(`Cilindro: ${this.pacienteActual.cilindroOI || '0'}`, 110, 115);
    doc.text(`Eje: ${this.pacienteActual.ejeOI || '0'}°`, 160, 115);
    doc.line(20, 125, 190, 125); 
    doc.text('_________________________', 105, 160, { align: 'center' });
    doc.text('Firma del Optómetra', 105, 168, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Documento generado por el Sistema de Gestión - Óptica Visión', 105, 280, { align: 'center' });
    doc.save(`Receta_${this.pacienteActual.nombre.replace(/\s+/g, '_')}.pdf`);
  }

  imprimirTicket(orden: any) {
    // ... Tu código intacto de imprimir ticket ...
    if (!this.pacienteActual) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 150] });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ÓPTICA VISIÓN', 40, 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('RUC: 20123456789', 40, 15, { align: 'center' });
    doc.text('Jiron. Bolivar 582, Trujillo', 40, 19, { align: 'center' });
    doc.text('Tel: 987 654 321', 40, 23, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.setDrawColor(150, 150, 150);
    doc.line(5, 27, 75, 27); 
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKET DE VENTA', 40, 33, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const fechaFormat = new Date(orden.fecha).toLocaleDateString();
    doc.text(`Fecha: ${fechaFormat}`, 5, 42);
    doc.text(`Cliente: ${this.pacienteActual.nombre}`, 5, 47);
    doc.text(`DNI: ${this.pacienteActual.dni}`, 5, 52);
    doc.line(5, 56, 75, 56); 
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción', 5, 62);
    doc.text('Total', 62, 62);
    doc.setFont('helvetica', 'normal');
    const descripcionMontura = orden.montura ? `${orden.montura.marca} - ${orden.montura.modelo}` : 'Montura Genérica';
    const lineasMontura = doc.splitTextToSize(descripcionMontura, 50);
    doc.text(lineasMontura, 5, 68);
    doc.text(`S/ ${orden.monto_total}`, 62, 68);
    if (orden.notas_laboratorio) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100); 
      const lineasNotas = doc.splitTextToSize(`Lab: ${orden.notas_laboratorio}`, 65);
      doc.text(lineasNotas, 5, 74); 
      doc.setTextColor(0, 0, 0); 
    }
    doc.line(5, 83, 75, 83); 
    doc.setFontSize(9);
    doc.text('TOTAL:', 35, 91);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/ ${orden.monto_total}`, 62, 91);
    doc.setFont('helvetica', 'normal');
    doc.text('A CUENTA:', 35, 98);
    doc.text(`S/ ${orden.adelanto}`, 62, 98);
    doc.text('SALDO:', 35, 105);
    doc.setFont('helvetica', 'bold');
    const saldo = (orden.monto_total || 0) - (orden.adelanto || 0);
    doc.text(`S/ ${saldo}`, 62, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('¡Gracias por su preferencia!', 40, 118, { align: 'center' });
    doc.text('Conserve este ticket para recoger', 40, 123, { align: 'center' });
    doc.text('sus anteojos en laboratorio.', 40, 127, { align: 'center' });
    doc.save(`Ticket_${this.pacienteActual.nombre.replace(/\s+/g, '_')}_${fechaFormat}.pdf`);
  }

  // --- NUEVA FUNCIÓN: GRÁFICO DE EVOLUCIÓN CLÍNICA ---
  crearGraficoEvolucion() {
    const canvas = document.getElementById('graficoEvolucion') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartEvolucion) {
      this.chartEvolucion.destroy();
    }

    // Extraemos la medida actual y la convertimos a número
    const esfOD = parseFloat(this.pacienteActual.esferaOD) || 0;
    const esfOI = parseFloat(this.pacienteActual.esferaOI) || 0;

    // MVP: Generamos la historia clínica hacia atrás (Asumimos que subió la medida en los últimos años)
    const dataOD = [esfOD > 0 ? esfOD - 0.5 : esfOD + 0.5, esfOD > 0 ? esfOD - 0.25 : esfOD + 0.25, esfOD];
    const dataOI = [esfOI > 0 ? esfOI - 0.5 : esfOI + 0.5, esfOI > 0 ? esfOI - 0.25 : esfOI + 0.25, esfOI];
    const etiquetasAnios = ['2024', '2025', 'Actual (2026)'];

    this.chartEvolucion = new Chart(canvas, {
      type: 'line',
      data: {
        labels: etiquetasAnios,
        datasets: [
          {
            label: 'Ojo Derecho (Esfera)',
            data: dataOD,
            borderColor: '#d32f2f', // Rojo
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#d32f2f',
            pointRadius: 4
          },
          {
            label: 'Ojo Izquierdo (Esfera)',
            data: dataOI,
            borderColor: '#1976d2', // Azul
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1976d2',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { 
            title: { display: true, text: 'Dioptrías' }
          }
        }
      }
    });
  }
}