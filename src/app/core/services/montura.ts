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
  // ¡NUEVA FUNCIÓN! Sube la foto y devuelve la URL pública
  async subirFotoMontura(file: File): Promise<string | null> {
    try {
      // 1. Creamos un nombre único para la foto (ej: 1689234_lente.jpg)
      const nombreArchivo = `${Date.now()}_${file.name}`;
      
      // 2. Subimos el archivo al bucket 'monturas'
      const { data, error } = await this.supabase
        .storage
        .from('monturas')
        .upload(nombreArchivo, file);

      if (error) {
        console.error('Error al subir la foto:', error);
        return null;
      }

      // 3. Obtenemos la URL pública para poder mostrarla en el HTML
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

    // Si Supabase nos lanza un error, devolvemos false
    if (error) {
      console.error('Error al crear montura:', error);
      return false; 
    }
    
    // Si no hay error, ¡fue un éxito total!
    await this.cargarMonturas(); 
    return true; 
  }
} // <- Esta es la última llave de tu clase
