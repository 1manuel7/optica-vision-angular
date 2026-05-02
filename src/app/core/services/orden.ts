import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Paciente } from './paciente';
import { Montura } from './models/montura.model';

export type EstadoOrden = 'PENDIENTE' | 'EN PROCESO' | 'ENTREGADO';

export interface OrdenTrabajo {
  id?: string;
  paciente_id?: string;
  montura_id?: string;
  estado: string;
  fecha?: string;
  
  // Estas propiedades virtuales las llenará Supabase mágicamente con el JOIN
  paciente?: Paciente;
  montura?: Montura;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private supabase: SupabaseClient;
  
  private ordenesSubject = new BehaviorSubject<OrdenTrabajo[]>([]);
  ordenes$ = this.ordenesSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarOrdenes();
  }

  // LEER: Traemos la orden con los datos del paciente y la montura incluidos
  async cargarOrdenes() {
    const { data, error } = await this.supabase
      .from('ordenes')
      /* ¡LA MAGIA DE SQL! Le pedimos que nos traiga la orden, 
         y que expanda los objetos paciente y montura */
      .select('*, paciente:pacientes(*), montura:monturas(*)')
      .order('fecha', { ascending: false });

    if (!error) {
      this.ordenesSubject.next(data || []);
    }
  }

  // ESCRIBIR: Genera la orden al vender
  async crearOrden(paciente: Paciente, montura: Montura) {
    // Solo necesitamos enviar los IDs a la base de datos
    const nuevaOrden = {
      paciente_id: paciente.id,
      montura_id: montura.id,
      estado: 'PENDIENTE'
    };

    const { error } = await this.supabase
      .from('ordenes')
      .insert([nuevaOrden]);

    if (!error) {
      await this.cargarOrdenes(); // Refrescamos la lista
    } else {
      console.error('Error al crear orden:', error);
    }
  }

  // ACTUALIZAR: Cambia el estado (PENDIENTE -> EN PROCESO -> ENTREGADO)
  async actualizarEstado(id: string, nuevoEstado: string) {
    const { error } = await this.supabase
      .from('ordenes')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) await this.cargarOrdenes();
  }
}