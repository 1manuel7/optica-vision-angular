import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Agregamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 

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
  
  // 2. Inyectamos la herramienta
  private cdr = inject(ChangeDetectorRef);

  totalVentas = 0;
  totalPacientes = 0;
  monturasAgotadas: Montura[] = [];

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(ordenes => {
      this.totalVentas = ordenes.length;
      this.cdr.detectChanges(); // 3. ¡Pellizco para las órdenes!
    });

    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.totalPacientes = pacientes.length;
      this.cdr.detectChanges(); // 3. ¡Pellizco para los pacientes!
    });

    this.monturaService.monturas$.subscribe(monturas => {
      this.monturasAgotadas = monturas.filter(m => m.stock === 0);
      this.cdr.detectChanges(); // 3. ¡Pellizco para las monturas!
    });
  }
}