import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface Cita {
  id?: string;
  paciente_nombre: string;
  telefono: string;
  fecha: string;
  motivo: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private supabase: SupabaseClient;
  
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  citas$ = this.citasSubject.asObservable();

  constructor() {
    // Usamos EXACTAMENTE la misma conexión que tus otros servicios
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarCitas();
  }

  async cargarCitas() {
    const { data, error } = await this.supabase
      .from('citas')
      .select('*')
      .order('fecha', { ascending: true });

    if (!error && data) {
      this.citasSubject.next(data);
    }
  }

  async crearCita(cita: Cita) {
    const { error } = await this.supabase.from('citas').insert(cita);
    if (!error) {
      this.cargarCitas();
    }
    return { error };
  }

  async actualizarEstado(id: string, nuevoEstado: string) {
    const { error } = await this.supabase
      .from('citas')
      .update({ estado: nuevoEstado })
      .eq('id', id);
      
    if (!error) {
      this.cargarCitas();
    }
  }
}