import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonturaService } from '../../core/services/montura';
import { StateService } from '../../core/services/state';
import { Montura } from '../../core/services/models/montura.model';
import { MatDialog } from '@angular/material/dialog';
import { AsignarDialogComponent } from '../../shared/components/asignar-dialog/asignar-dialog';


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
  private dialog = inject(MatDialog);

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

  // Añade esta función al final de la clase:
  abrirModalAsignacion() {
    if (!this.montura) return;

    const modalRef = this.dialog.open(AsignarDialogComponent, {
      width: '400px',
      data: this.montura // Le pasamos la montura al modal
    });
    modalRef.afterClosed().subscribe(pacienteElegido => {
      if (pacienteElegido) {
        
        // 1. Ejecutamos la lógica de negocio: ¡Descontar del inventario!
        this.monturaService.descontarStock(this.montura!.id);
        
        // 2. Alerta de confirmación
        alert(`¡Éxito! La montura ${this.montura?.marca} ha sido asignada a ${pacienteElegido.nombre}.`);
        
        // 3. Volvemos al catálogo para ver que el número bajó
        this.volver();
      }
    });

    // Escuchamos la respuesta cuando el modal se cierra
    modalRef.afterClosed().subscribe(pacienteElegido => {
      if (pacienteElegido) {
        alert(`¡Éxito! La montura ${this.montura?.marca} ha sido asignada a la historia clínica de ${pacienteElegido.nombre}.`);
        // En un sistema real, aquí llamaríamos a un servicio para descontar el stock
      }
    });
  }
}