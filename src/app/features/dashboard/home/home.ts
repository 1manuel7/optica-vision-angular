import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

import { OrdenService } from '../../../core/services/orden';
import { PacienteService } from '../../../core/services/paciente';
import { MonturaService } from '../../../core/services/montura';
import { Montura } from '../../../core/services/models/montura.model';

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
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('miGrafico') miGrafico!: ElementRef; 
  chart: any;

  // LAS VARIABLES QUE ANGULAR ESTABA BUSCANDO (¡Aquí están!)
  totalVentas = 0;
  totalPacientes = 0;
  totalIngresos = 0;
  ordenesPendientes = 0;
  monturasAgotadas: Montura[] = [];

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(ordenes => {
      this.totalVentas = ordenes.length;
      this.totalIngresos = ordenes.reduce((suma, orden) => suma + (Number(orden.monto_total) || 0), 0);
      this.ordenesPendientes = ordenes.filter(o => o.estado !== 'ENTREGADO').length;
      
      this.actualizarGrafico();
      this.cdr.detectChanges(); 
    });

    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.totalPacientes = pacientes.length;
      this.actualizarGrafico();
      this.cdr.detectChanges(); 
    });

    this.monturaService.monturas$.subscribe(monturas => {
      this.monturasAgotadas = monturas.filter(m => m.stock === 0);
      this.cdr.detectChanges(); 
    });
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  crearGrafico() {
    Chart.defaults.color = '#888';

    this.chart = new Chart(this.miGrafico.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Pacientes Registrados', 'Órdenes de Trabajo'],
        datasets: [{
          label: 'Volumen Operativo',
          data: [this.totalPacientes, this.totalVentas],
          backgroundColor: [
            'rgba(76, 175, 80, 0.7)', 
            'rgba(25, 118, 210, 0.7)' 
          ],
          borderColor: ['#4caf50', '#1976d2'],
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
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  actualizarGrafico() {
    if (this.chart) {
      this.chart.data.datasets[0].data = [this.totalPacientes, this.totalVentas];
      this.chart.update(); 
    }
  }
}