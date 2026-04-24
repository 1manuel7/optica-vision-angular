import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MonturaService } from '../../core/services/montura';
import { Montura } from '../../core/services/models/montura.model';
import { MonturaCardComponent } from '../../shared/components/montura-card/montura-card';
// Nuevas importaciones de Material para el buscador
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-montura-list',
  standalone: true,
  // Importante: Importamos FormsModule para el input y la tarjeta hija
imports: [
    FormsModule, 
    MonturaCardComponent, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule
  ],
    templateUrl: './montura-list.html'
})
export class MonturaListComponent implements OnInit {
  monturas: Montura[] = [];
  filtroMaterial: string = '';

  // Inyección de dependencias moderna en Angular
  private monturaService = inject(MonturaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Escuchamos los Query Params de la URL (ej: /catalogo?material=Metal)
    this.route.queryParams.subscribe(params => {
      this.filtroMaterial = params['material'] || '';
      this.cargarMonturas();
    });
  }

  cargarMonturas() {
    // Obtenemos los datos ya filtrados desde nuestro servicio
    this.monturas = this.monturaService.filtrarPorMaterial(this.filtroMaterial);
  }

  buscar() {
    // Al dar clic en buscar, actualizamos la URL con el Query Param. 
    // Esto disparará automáticamente el 'subscribe' de arriba.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { material: this.filtroMaterial || null },
      queryParamsHandling: 'merge'
    });
  }

  irAlDetalle(id: number) {
    // Método que se ejecuta cuando el @Output() de la tarjeta emite el evento
    this.router.navigate(['/catalogo', id]);
  }
}