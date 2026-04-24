import { Injectable } from '@angular/core';
import { Montura } from '../services/models/montura.model';


@Injectable({
  providedIn: 'root'
})
export class MonturaService {

  // Nuestra "Base de datos" simulada
  private monturas: Montura[] = [
    { id: 1, marca: 'Ray-Ban', modelo: 'Aviator Clásico', material: 'Metal', precio: 150, imagen: '👓' },
    { id: 2, marca: 'Oakley', modelo: 'Holbrook', material: 'Acetato', precio: 130, imagen: '🕶️' },
    { id: 3, marca: 'Prada', modelo: 'Cat Eye', material: 'Acetato', precio: 250, imagen: '🕶️' },
    { id: 4, marca: 'Armani', modelo: 'Minimalist', material: 'Titanio', precio: 180, imagen: '👓' }
  ];

  constructor() { }

  // 1. Obtener todas las monturas
  getTodasLasMonturas(): Montura[] {
    return this.monturas;
  }

  // 2. Obtener una montura por su ID (Para la vista de detalle)
  getMonturaPorId(id: number): Montura | undefined {
    return this.monturas.find(m => m.id === id);
  }

  // 3. Lógica de negocio: Filtrar por material (Para la búsqueda)
  filtrarPorMaterial(material: string): Montura[] {
    if (!material) return this.monturas;
    return this.monturas.filter(m => 
      m.material.toLowerCase().includes(material.toLowerCase())
    );
  }
}