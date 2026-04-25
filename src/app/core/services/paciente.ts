import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Definimos la estructura exacta de nuestro paciente
export interface Paciente {
  id: string; // Le daremos un ID único a cada uno
  nombre: string;
  dni: string;
  telefono: string;
  esferaOD: string; cilindroOD: string; ejeOD: string;
  esferaOI: string; cilindroOI: string; ejeOI: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  // Clave secreta para guardar en el navegador
  private readonly STORAGE_KEY = 'optica_pacientes';
  
  // Lista reactiva de pacientes
  private pacientesSubject = new BehaviorSubject<Paciente[]>(this.cargarPacientes());
  pacientes$ = this.pacientesSubject.asObservable();

  constructor() {}

  // Lee los datos guardados en el disco duro del navegador
  private cargarPacientes(): Paciente[] {
    const datos = localStorage.getItem(this.STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
  }

  // Agrega un nuevo paciente a la lista y lo guarda
  agregarPaciente(pacienteSinId: Omit<Paciente, 'id'>) {
    const nuevoPaciente: Paciente = {
      ...pacienteSinId,
      id: crypto.randomUUID() // Genera un ID único y profesional
    };

    const listaActualizada = [...this.pacientesSubject.value, nuevoPaciente];
    this.pacientesSubject.next(listaActualizada);
    
    // Guardamos permanentemente en el navegador
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(listaActualizada));
  }

  // Permite buscar un paciente por su DNI en el futuro
  obtenerPacientePorDni(dni: string): Paciente | undefined {
    return this.pacientesSubject.value.find(p => p.dni === dni);
  }
  // Busca un paciente específico por su ID único
  getPacientePorId(id: string): Paciente | undefined {
    return this.pacientesSubject.value.find(p => p.id === id);
  }

  // Recibe un paciente con datos nuevos y lo reemplaza en la base de datos
  actualizarPaciente(pacienteActualizado: Paciente) {
    const listaActualizada = this.pacientesSubject.value.map(p => 
      p.id === pacienteActualizado.id ? pacienteActualizado : p
    );
    this.pacientesSubject.next(listaActualizada);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(listaActualizada));
  }
}