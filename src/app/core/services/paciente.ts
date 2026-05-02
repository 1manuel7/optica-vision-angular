import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface Paciente {
  id?: string; // El ID lo generará la base de datos automáticamente
  nombre: string;
  dni: string;
  telefono: string;
  esferaOD: string;
  cilindroOD: string;
  ejeOD: string;
  esferaOI: string;
  cilindroOI: string;
  ejeOI: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private supabase: SupabaseClient;
  
  // Seguimos usando el BehaviorSubject para que nuestras tablas se actualicen solas
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  pacientes$ = this.pacientesSubject.asObservable();

  constructor() {
    // Inicializamos la conexión con la nube
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarPacientes();
  }

  // LEER: Trae todos los pacientes de la nube ordenados por fecha
  async cargarPacientes() {
    const { data, error } = await this.supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar pacientes:', error);
    } else {
      this.pacientesSubject.next(data || []);
    }
  }

  // ESCRIBIR: Guarda un nuevo paciente en la base de datos real
  async agregarPaciente(paciente: Paciente) {
    const { data, error } = await this.supabase
      .from('pacientes')
      .insert([paciente])
      .select();

    if (error) {
      console.error('Error al guardar:', error);
      throw error;
    } else {
      // Refrescamos la lista automáticamente
      await this.cargarPacientes();
      return data;
    }
  }

  // ACTUALIZAR: Modifica los datos de un paciente existente
  async actualizarPaciente(id: string, cambios: Partial<Paciente>) {
    const { error } = await this.supabase
      .from('pacientes')
      .update(cambios)
      .eq('id', id);

    if (!error) await this.cargarPacientes();
  }

  // BUSCAR: Obtiene un paciente por su ID
  async getPacientePorId(id: string) {
    const { data } = await this.supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
}