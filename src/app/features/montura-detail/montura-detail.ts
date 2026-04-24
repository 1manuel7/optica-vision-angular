import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonturaService } from '../../core/services/montura';
import { StateService } from '../../core/services/state';
import { Montura } from '../../core/services/models/montura.model';


@Component({
  selector: 'app-montura-detail',
  standalone: true,
  templateUrl: './montura-detail.html'
})
export class MonturaDetailComponent implements OnInit {
  montura: Montura | undefined;

  // Inyectamos las herramientas que necesitamos
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private monturaService = inject(MonturaService);
  private stateService = inject(StateService);

  ngOnInit() {
    // 1. Obtenemos el ID de la URL (ej: /catalogo/2 -> extrae el '2')
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    // 2. Buscamos la montura en nuestra "Base de datos" simulada
    this.montura = this.monturaService.getMonturaPorId(id);

    // 3. REQUISITO 7: Guardamos esta montura en el estado global como "última vista"
    if (this.montura) {
      this.stateService.setUltimaMontura(this.montura);
    }
  }

  volver() {
    // Navegamos de regreso a la lista
    this.router.navigate(['/catalogo']);
  }
}