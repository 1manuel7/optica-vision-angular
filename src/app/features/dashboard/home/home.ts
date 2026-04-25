import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Para iconos bonitos

// Importamos todos nuestros servicios
import { OrdenService } from '../../../core/services/orden';
import { PacienteService } from '../../../core/services/paciente';
import { MonturaService } from '../../../core/services/montura';
import { Montura } from '../../../core/services/models/montura.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  private ordenService = inject(OrdenService);
  private pacienteService = inject(PacienteService);
  private monturaService = inject(MonturaService);

  // Nuestras métricas para la gerencia
  totalVentas = 0;
  totalPacientes = 0;
  monturasAgotadas: Montura[] = [];

  ngOnInit() {
    // Escuchamos cuántas órdenes hay en total
    this.ordenService.ordenes$.subscribe(ordenes => {
      this.totalVentas = ordenes.length;
    });

    // Escuchamos cuántos pacientes hay registrados
    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.totalPacientes = pacientes.length;
    });

    // Filtramos el inventario para encontrar lo que está en cero
    const todoElInventario = this.monturaService.getTodasLasMonturas();
    this.monturasAgotadas = todoElInventario.filter(m => m.stock === 0);
  }
}