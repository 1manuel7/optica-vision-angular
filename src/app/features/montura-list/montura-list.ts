import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MonturaService } from '../../core/services/montura';
import { Montura } from '../../core/services/models/montura.model';
import { MonturaCardComponent } from '../../shared/components/montura-card/montura-card';

// Importaciones de Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-montura-list',
  standalone: true,
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

  // Inyecciones
  private monturaService = inject(MonturaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filtroMaterial = params['material'] || '';
      this.cargarMonturas();
    });
  }

  cargarMonturas() {
    this.monturas = this.monturaService.filtrarPorMaterial(this.filtroMaterial);
  }

  buscar() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { material: this.filtroMaterial || null },
      queryParamsHandling: 'merge'
    });
  }

  irAlDetalle(id: string) {
    this.router.navigate(['/catalogo', id]);
  }

  // --- ¡NUEVA FUNCIÓN DE NAVEGACIÓN PROGRAMÁTICA! ---
  irANuevaMontura() {
    this.router.navigate(['/nueva-montura']);
  }
}