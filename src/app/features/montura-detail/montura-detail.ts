import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MonturaService } from '../../core/services/montura';
import { StateService } from '../../core/services/state';
import { Montura } from '../../core/services/models/montura.model';
import { MatDialog } from '@angular/material/dialog';
import { AsignarDialogComponent } from '../../shared/components/asignar-dialog/asignar-dialog';
// Importación de nuestro nuevo servicio
import { OrdenService } from '../../core/services/orden'; 

@Component({
  selector: 'app-montura-detail',
  standalone: true,
  templateUrl: './montura-detail.html'
})
export class MonturaDetailComponent implements OnInit {
  montura: Montura | undefined;

  // Inyectamos todas las herramientas necesarias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private monturaService = inject(MonturaService);
  private stateService = inject(StateService);
  private dialog = inject(MatDialog);
  private ordenService = inject(OrdenService); // Inyección de órdenes

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    this.montura = this.monturaService.getMonturaPorId(id);

    if (this.montura) {
      this.stateService.setUltimaMontura(this.montura);
    }
  }

  volver() {
    this.router.navigate(['/catalogo']);
  }

  abrirModalAsignacion() {
    if (!this.montura) return;

    const modalRef = this.dialog.open(AsignarDialogComponent, {
      width: '400px',
      data: this.montura 
    });

    // UN SOLO SUBSCRIBE para ejecutar toda la cadena de acciones de la venta
    modalRef.afterClosed().subscribe(pacienteElegido => {
      if (pacienteElegido) {
        
        // 1. Ejecutamos la lógica de negocio: ¡Descontar del inventario!
        this.monturaService.descontarStock(this.montura!.id);

        // 2. ¡NUEVO! Generamos la orden de trabajo oficial en la base de datos
        this.ordenService.crearOrden(pacienteElegido, this.montura!);
        
        // 3. Alerta de confirmación actualizada
        alert(`¡Venta Registrada! Se generó una orden PENDIENTE para ${pacienteElegido.nombre} con la montura ${this.montura?.marca}.`);
        
        // 4. Volvemos al catálogo para ver que el número bajó
        this.volver();
      }
    });
  }
}