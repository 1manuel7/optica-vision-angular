import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 

import { OrdenService } from '../../../core/services/orden';
import { PacienteService } from '../../../core/services/paciente';
import { MonturaService } from '../../../core/services/montura';
import { Montura } from '../../../core/services/models/montura.model';

// 1. Importamos Chart.js primero, y LUEGO lo registramos
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit, AfterViewInit {
  private ordenService = inject(OrdenService);
  private pacienteService = inject(PacienteService);
  private monturaService = inject(MonturaService);
  private cdr = inject(ChangeDetectorRef);

  // 2. Enlazamos el lienzo del HTML
  @ViewChild('miGrafico') miGrafico!: ElementRef; 
  chart: any;

  totalVentas = 0;
  totalPacientes = 0;
  monturasAgotadas: Montura[] = [];

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(ordenes => {
      this.totalVentas = ordenes.length;
      this.actualizarGrafico(); // Pellizco al gráfico
      this.cdr.detectChanges(); // Pellizco a la pantalla
    });

    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.totalPacientes = pacientes.length;
      this.actualizarGrafico(); // Pellizco al gráfico
      this.cdr.detectChanges(); // Pellizco a la pantalla
    });

    this.monturaService.monturas$.subscribe(monturas => {
      this.monturasAgotadas = monturas.filter(m => m.stock === 0);
      this.cdr.detectChanges(); 
    });
  }

  // 3. Esto se asegura de que el HTML ya exista antes de intentar dibujar
  ngAfterViewInit() {
    this.crearGrafico();
  }

  crearGrafico() {
    this.chart = new Chart(this.miGrafico.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Pacientes Registrados', 'Órdenes de Trabajo'],
        datasets: [{
          label: 'Métricas Actuales',
          data: [this.totalPacientes, this.totalVentas],
          backgroundColor: [
            'rgba(76, 175, 80, 0.6)', 
            'rgba(25, 118, 210, 0.6)' 
          ],
          borderColor: ['#4caf50', '#1976d2'],
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  actualizarGrafico() {
    if (this.chart) {
      this.chart.data.datasets[0].data = [this.totalPacientes, this.totalVentas];
      this.chart.update(); // Hace la animación de subida
    }
  }
}