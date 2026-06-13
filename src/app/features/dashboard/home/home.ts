import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser'; // <-- 1. IMPORTAMOS EMAILJS

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

  // VARIABLES PARA LA IA
  analisisIA: string = '';
  cargandoIA: boolean = false;
  
  // <-- 2. VARIABLE PARA CONTROLAR EL ESTADO DEL ENVÍO DE CORREO
  enviandoCorreo: boolean = false;

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(ordenes => {
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

  // <-- 3. NUEVA FUNCIÓN: ENVIAR REPORTE DE IA POR CORREO ---
  async enviarAlertaAdmin() {
    if (!this.analisisIA) return;
    
    this.enviandoCorreo = true;
    this.cdr.detectChanges();

    const templateParams = {
      to_email: 'manu.migue001@gmail.com', // ⚠️ REEMPLAZA CON EL CORREO DONDE QUIERES RECIBIR LA ALERTA
      mensaje_alerta: this.analisisIA,
      fecha: new Date().toLocaleDateString()
    };

    try {
      await emailjs.send(
        'service_9lkhpzq',             // ⚠️ REEMPLAZA CON TU SERVICE ID
        'template_evqk322', // ⚠️ REEMPLAZA CON EL ID DE TU NUEVA PLANTILLA
        templateParams,
        'cY_7usaVDwoY1DtN-'              // ⚠️ REEMPLAZA CON TU PUBLIC KEY
      );
      alert('📧 ¡Alerta logística enviada con éxito al correo del administrador!');
    } catch (error) {
      console.error('Error al enviar alerta por correo:', error);
      alert('❌ No se pudo enviar el correo. Revisa la consola.');
    } finally {
      this.enviandoCorreo = false;
      this.cdr.detectChanges();
    }
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