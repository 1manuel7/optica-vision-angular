import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Montura } from './models/montura.model';

@Injectable({
  providedIn: 'root'
})
export class MonturaService {
  private supabase: SupabaseClient;
  
  private monturasSubject = new BehaviorSubject<Montura[]>([]);
  monturas$ = this.monturasSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarMonturas();
  }

  // LEER: Trae el inventario real desde la nube
  async cargarMonturas() {
    const { data, error } = await this.supabase
      .from('monturas')
      .select('*')
      .order('marca', { ascending: true });

    if (!error) {
      this.monturasSubject.next(data || []);
    }
  }

  // BUSCAR: Obtiene una montura por ID
  async getMonturaPorId(id: string): Promise<Montura | null> {
    const { data } = await this.supabase
      .from('monturas')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  // LÓGICA DE NEGOCIO: Descontar stock tras una venta
  async descontarStock(id: string) {
    // 1. Buscamos el stock actual
    const montura = await this.getMonturaPorId(id);
    
    if (montura && montura.stock > 0) {
      // 2. Restamos uno y actualizamos en la nube
      const nuevoStock = montura.stock - 1;
      const { error } = await this.supabase
        .from('monturas')
        .update({ stock: nuevoStock })
        .eq('id', id);

      if (!error) await this.cargarMonturas(); // Refrescamos la vista
    }
  }
  // Devuelve la lista actual para el Dashboard
  getTodasLasMonturas(): Montura[] {
    return this.monturasSubject.value;
  }

  // Filtra la lista actual para el Catálogo
  filtrarPorMaterial(material: string): Montura[] {
    if (!material || material === 'Todos') {
      return this.monturasSubject.value;
    }
    return this.monturasSubject.value.filter(m => m.material === material);
  }
} // <- Esta es la última llave de tu clase
