import { Component, inject, OnInit } from '@angular/core'; // <-- 1. Agregamos OnInit
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente';
import { MatIconModule } from '@angular/material/icon';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule,MatIconModule],
  templateUrl: './paciente-list.html'
})
export class PacienteListComponent implements OnInit { // <-- 2. Implementamos OnInit
  private pacienteService = inject(PacienteService);
  private router = inject(Router); 
  
  // 3. Creamos nuestras listas para el buscador (en lugar de usar pacientes$)
  pacientes: any[] = []; 
  pacientesFiltrados: any[] = [];
  
  columnasMostrar: string[] = ['dni', 'nombre', 'telefono', 'receta', 'acciones'];

  ngOnInit() {
    // 4. Nos suscribimos para escuchar los cambios en vivo desde Supabase
    this.pacienteService.pacientes$.subscribe(data => {
      this.pacientes = data;
      this.pacientesFiltrados = data; // Al iniciar, mostramos todos
    });
  }

  // 5. La lógica de búsqueda en tiempo real
  buscarPaciente(event: any) {
    const texto = event.target.value.toLowerCase();
    
    this.pacientesFiltrados = this.pacientes.filter(paciente => 
      paciente.nombre.toLowerCase().includes(texto) || 
      paciente.dni.includes(texto)
    );
  }
  exportarAExcel() {
    // 1. Preparamos los datos limpios que queremos en el Excel
    const datosParaExcel = this.pacientesFiltrados.map(paciente => ({
      'DNI': paciente.dni,
      'Nombre Completo': paciente.nombre,
      'Teléfono': paciente.telefono,
      'Medida Ojo Derecho (ESF)': paciente.esferaOD,
      'Medida Ojo Izquierdo (ESF)': paciente.esferaOI
    }));

    // 2. Creamos una hoja de cálculo con esos datos
    const hojaDeCalculo = XLSX.utils.json_to_sheet(datosParaExcel);

    // 3. Creamos el "Libro" de Excel y le metemos la hoja
    const libroDeExcel = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeExcel, hojaDeCalculo, 'Pacientes');

    // 4. ¡Magia! Descargamos el archivo
    const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
    XLSX.writeFile(libroDeExcel, `Reporte_Pacientes_${fecha}.xlsx`);
  }

  verPerfil(id: string) {
    this.router.navigate(['/paciente', id]);
  }
}