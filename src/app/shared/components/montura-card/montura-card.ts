import { Component, Input, Output, EventEmitter } from '@angular/core';
// Importamos las nuevas herramientas corporativas
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Montura } from '../../../core/services/models/montura.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-montura-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule,MatIconModule], // <-- Debes agregarlos aquí
  templateUrl: './montura-card.html'
})
export class MonturaCardComponent {
  @Input({ required: true }) montura!: Montura;
  @Output() seleccionar = new EventEmitter<string>();

  onVerDetalle() {
    this.seleccionar.emit(this.montura.id);
  }
}