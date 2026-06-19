import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser'; 
import Swal from 'sweetalert2'; // <-- IMPORTAMOS ALERTAS

import { OrdenService } from '../../../core/services/orden';
import { PacienteService } from '../../../core/services/paciente';
import { MonturaService } from '../../../core/services/montura';
import { Montura } from '../../../core/services/models/montura.model';
import { IaService } from '../../../core/services/ia.service'; 

// Chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit, AfterViewInit {
  private ordenService = inject(OrdenService);
  private pacienteService = inject(PacienteService);
  private monturaService = inject(MonturaService);
  private iaService = inject(IaService); 
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('miGrafico') miGrafico!: ElementRef; 
  chart: any;

  // VARIABLES FINANCIERAS
  totalVentas = 0;
  totalPacientes = 0;
  totalIngresos = 0;     // El monto total bruto (Si todos pagaran)
  ingresosReales = 0;    // Dinero en caja real (Suma de adelantos/pagos completos)
  cuentasPorCobrar = 0;  // Lo que te deben los pacientes
  monturasAgotadas: Montura[] = [];

  // <-- NUEVO: Guardamos toda la data pura para exportarla
  todasLasOrdenes: any[] = []; 

  // VARIABLES PARA LA IA
  analisisIA: string = '';
  cargandoIA: boolean = false;
  enviandoCorreo: boolean = false;

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(ordenes => {
      this.todasLasOrdenes = ordenes; // <-- Guardamos la data
      this.totalVentas = ordenes.length;
      
      // Lógica Financiera Real
      this.totalIngresos = ordenes.reduce((suma, orden) => suma + (Number(orden.monto_total) || 0), 0);
      this.ingresosReales = ordenes.reduce((suma, orden) => suma + (Number(orden.adelanto) || 0), 0);
      this.cuentasPorCobrar = this.totalIngresos - this.ingresosReales;
      
      this.actualizarGrafico();
      this.cdr.detectChanges(); 
    });

    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.totalPacientes = pacientes.length;
      this.cdr.detectChanges(); 
    });

    this.monturaService.monturas$.subscribe(monturas => {
      // Detectamos stock crítico (5 o menos)
      this.monturasAgotadas = monturas.filter(m => m.stock <= 5);
      this.cdr.detectChanges(); 
    });
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  // LA FUNCIÓN QUE PIDE CONSEJO A GEMINI
  async pedirConsejoIA() {
    if (this.monturasAgotadas.length === 0) return;
    
    this.cargandoIA = true;
    this.analisisIA = '';
    
    try {
      this.analisisIA = await this.iaService.analizarInventario(this.monturasAgotadas);
    } catch (error) {
      this.analisisIA = 'Hubo un error al conectar con Gemini.';
    }
    
    this.cargandoIA = false;
    this.cdr.detectChanges();
  }

  // ENVIAR REPORTE DE IA POR CORREO
  async enviarAlertaAdmin() {
    if (!this.analisisIA) return;
    
    this.enviandoCorreo = true;
    this.cdr.detectChanges();

    const templateParams = {
      to_email: 'manu.migue001@gmail.com',
      mensaje_alerta: this.analisisIA,
      fecha: new Date().toLocaleDateString()
    };

    try {
      await emailjs.send(
        'service_9lkhpzq',             
        'template_evqk322', 
        templateParams,
        'cY_7usaVDwoY1DtN-'              
      );
      Swal.fire('¡Enviado!', 'Alerta logística enviada con éxito al correo del administrador.', 'success');
    } catch (error) {
      console.error('Error al enviar alerta por correo:', error);
      Swal.fire('Error', 'No se pudo enviar el correo. Revisa la consola.', 'error');
    } finally {
      this.enviandoCorreo = false;
      this.cdr.detectChanges();
    }
  }

  // --- NUEVA FUNCIÓN: EXPORTAR A EXCEL (CSV) ---
  exportarDatosExcel() {
    if (this.todasLasOrdenes.length === 0) {
      Swal.fire('Sin Datos', 'No hay ventas registradas para exportar.', 'info');
      return;
    }

    // 1. Agregar el BOM (Byte Order Mark) para que Excel reconozca las tildes y las "ñ"
    const BOM = '\uFEFF';
    
    // 2. Cabeceras del Excel
    let csv = BOM + 'Fecha de Venta,Paciente,DNI,Montura,Estado,Total (S/),Adelanto (S/),Deuda (S/)\n';

    // 3. Recorremos todas las órdenes y armamos las filas
    this.todasLasOrdenes.forEach(orden => {
      const fecha = new Date(orden.fecha).toLocaleDateString('es-PE');
      
      // Limpiamos comas de los textos para que no rompan las columnas del Excel
      const paciente = `${orden.paciente?.nombre || ''} ${orden.paciente?.apellido || ''}`.replace(/,/g, '');
      const dni = orden.paciente?.dni || 'S/N';
      const montura = `${orden.montura?.marca || ''} - ${orden.montura?.modelo || ''}`.replace(/,/g, '');
      const estado = orden.estado || 'DESCONOCIDO';
      
      const total = Number(orden.monto_total) || 0;
      const adelanto = Number(orden.adelanto) || 0;
      const deuda = total - adelanto;

      // Agregamos la fila al archivo
      csv += `${fecha},${paciente},${dni},${montura},${estado},${total},${adelanto},${deuda}\n`;
    });

    // 4. Crear el archivo físico y forzar la descarga en el navegador
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `Reporte_Gerencial_Optica_${new Date().getTime()}.csv`;
    enlace.click();
    window.URL.revokeObjectURL(url);

    // 5. Alerta de éxito elegante
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      icon: 'success',
      title: '📊 Reporte descargado con éxito'
    });
  }

  crearGrafico() {
    Chart.defaults.color = '#888';

    this.chart = new Chart(this.miGrafico.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Dinero en Caja (S/)', 'Cuentas por Cobrar (S/)'],
        datasets: [{
          label: 'Salud Financiera',
          data: [this.ingresosReales, this.cuentasPorCobrar],
          backgroundColor: [
            'rgba(46, 125, 50, 0.8)', // Verde oscuro para el dinero en caja
            'rgba(239, 108, 0, 0.8)'  // Naranja de alerta para las deudas
          ],
          borderColor: ['#1b5e20', '#e65100'],
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false } 
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  actualizarGrafico() {
    if (this.chart) {
      this.chart.data.datasets[0].data = [this.ingresosReales, this.cuentasPorCobrar];
      this.chart.update(); 
    }
  }
}