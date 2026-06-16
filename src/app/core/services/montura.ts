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
    const montura = await this.getMonturaPorId(id);
    
    if (montura && montura.stock > 0) {
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

  // Sube la foto y devuelve la URL pública
  async subirFotoMontura(file: File): Promise<string | null> {
    try {
      const nombreArchivo = `${Date.now()}_${file.name}`;
      
      const { data, error } = await this.supabase
        .storage
        .from('monturas')
        .upload(nombreArchivo, file);

      if (error) {
        console.error('Error al subir la foto:', error);
        return null;
      }

      const { data: urlData } = this.supabase
        .storage
        .from('monturas')
        .getPublicUrl(nombreArchivo);

      return urlData.publicUrl;

    } catch (err) {
      console.error('Error inesperado:', err);
      return null;
    }
  }

  // CREAR: Guarda una nueva montura en la base de datos
  async crearMontura(nuevaMontura: Montura): Promise<boolean> {
    const { error } = await this.supabase
      .from('monturas')
      .insert([nuevaMontura]);

    if (error) {
      console.error('Error al crear montura:', error);
      return false; 
    }
    
    await this.cargarMonturas(); 
    return true; 
  }

  // --- NUEVA FUNCIÓN: SUMAR INVENTARIO (REABASTECER) ---
  async agregarStock(id: string, cantidadASumar: number): Promise<boolean> {
    const monturaActual = this.monturasSubject.getValue().find(m => m.id === id);
    if (!monturaActual) return false;

    const nuevoStock = (monturaActual.stock || 0) + cantidadASumar;

    const { error } = await this.supabase
      .from('monturas')
      .update({ stock: nuevoStock })
      .eq('id', id);

    if (error) {
      console.error('Error al reabastecer stock:', error);
      return false;
    }

    await this.cargarMonturas();
    return true;
  }

  // --- NUEVA FUNCIÓN: ELIMINAR MONTURA DEL CATÁLOGO ---
  async eliminarMontura(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('monturas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar montura:', error);
      return false;
    }

    await this.cargarMonturas(); // Refrescamos la lista
    return true;
  }
}