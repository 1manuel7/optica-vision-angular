import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips'; 
import { MatIconModule } from '@angular/material/icon';

import { OrdenService, EstadoOrden } from '../../../core/services/orden';
import Swal from 'sweetalert2'; // <-- IMPORTAMOS LAS ALERTAS

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatTableModule, 
    MatCardModule, 
    MatSelectModule, 
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './orden-list.html'
})
export class OrdenListComponent implements OnInit {
  private ordenService = inject(OrdenService);
  private router = inject(Router); 
  private cdr = inject(ChangeDetectorRef);
  
  columnas: string[] = ['fecha', 'paciente', 'montura', 'estado', 'acciones'];
  estados: EstadoOrden[] = ['PENDIENTE', 'EN PROCESO', 'ENTREGADO'];

  // <-- Dividimos las órdenes en dos arreglos -->
  ordenesActivas: any[] = [];
  ordenesHistorial: any[] = [];

  ngOnInit() {
    this.ordenService.ordenes$.subscribe(data => {
      // Activas: Pendientes (para enviar al laboratorio) o En Proceso (haciéndose)
      this.ordenesActivas = data.filter(o => o.estado === 'PENDIENTE' || o.estado === 'EN PROCESO');
      // Historial: Ya entregadas al paciente
      this.ordenesHistorial = data.filter(o => o.estado === 'ENTREGADO');
      
      this.cdr.detectChanges(); 
    });
  }

  cambiarEstado(id: string, nuevoEstado: any) {
    this.ordenService.actualizarEstado(id, nuevoEstado);
    
    // Alerta rápida y elegante que no interrumpe el flujo
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      icon: 'success',
      title: `Orden actualizada a: ${nuevoEstado}`
    });
  }

  irANuevaVenta() {
    this.router.navigate(['/nueva-venta']);
  }
}