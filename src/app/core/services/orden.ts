import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Paciente } from './paciente';
import { Montura } from './models/montura.model';
import { MonturaService } from './montura'; // <-- Asegúrate de que la ruta a tu MonturaService sea correcta

export type EstadoOrden = 'PENDIENTE' | 'EN PROCESO' | 'ENTREGADO';

export interface OrdenTrabajo {
  id?: string;
  paciente_id?: string;
  montura_id?: string;
  estado: string;
  fecha?: string;
  notas_laboratorio?: string;
  
  // ¡NUEVAS COLUMNAS! Acopladas para el control financiero de la venta
  monto_total?: number;
  adelanto?: number;
  
  // Estas propiedades virtuales las llena Supabase con el SELECT expandido
  paciente?: Paciente;
  montura?: Montura;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private supabase: SupabaseClient;
  
  // Inyectamos el servicio de monturas para reducir el stock automáticamente
  private monturaService = inject(MonturaService);
  
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
      /* Mantenemos tu consulta relacional original intacta */
      .select('*, paciente:pacientes(*), montura:monturas(*)')
      .order('fecha', { ascending: false });

    if (!error) {
      this.ordenesSubject.next(data || []);
    }
  }

  // ESCRIBIR: Genera la orden al vender, descuenta stock, anota lunas y retorna éxito/error
  // ¡AQUÍ ESTÁ EL CAMBIO! Agregamos notasLab como el 5to parámetro
  async crearOrden(pacienteId: string, monturaId: string, montoTotal: number, adelanto: number, notasLab: string): Promise<boolean> {
    try {
      // 1. Estructuramos el registro con los nuevos campos de dinero Y notas de laboratorio
      const nuevaOrden = {
        paciente_id: pacienteId,
        montura_id: monturaId,
        estado: 'PENDIENTE',
        monto_total: montoTotal,
        adelanto: adelanto,
        notas_laboratorio: notasLab // <-- ¡ACABAMOS DE CONECTAR EL CAMPO CON SUPABASE AQUÍ!
      };

      // 2. Insertamos la orden en la tabla
      const { error } = await this.supabase
        .from('ordenes')
        .insert([nuevaOrden]);

      if (error) {
        console.error('Error al crear la orden en Supabase:', error);
        return false;
      }

      // 3. Si la orden se creó bien, descontamos una unidad del inventario de monturas
      await this.monturaService.descontarStock(monturaId);

      // 4. Refrescamos la lista de órdenes en tiempo real para el Dashboard/Lista
      await this.cargarOrdenes(); 
      
      return true;

    } catch (err) {
      console.error('Error inesperado en el servicio de órdenes:', err);
      return false;
    }
  }

  // ACTUALIZAR: Cambia el estado (PENDIENTE -> EN PROCESO -> ENTREGADO)
  async actualizarEstado(id: string, nuevoEstado: string) {
    const { error } = await this.supabase
      .from('ordenes')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (!error) {
      await this.cargarOrdenes();
    } else {
      console.error('Error al actualizar el estado de la orden:', error);
    }
  }

  // --- NUEVA FUNCIÓN: LIQUIDAR SALDO ---
  async registrarPagoSaldo(id: string, montoTotal: number) {
    const { error } = await this.supabase
      .from('ordenes')
      .update({ 
        adelanto: montoTotal,   // El dinero adelantado ahora iguala al total
        estado: 'ENTREGADO'     // Asumimos que si paga el resto, es porque se lo lleva
      })
      .eq('id', id);

    if (!error) {
      await this.cargarOrdenes(); // Refrescamos la lista de órdenes
    } else {
      console.error('Error al registrar el pago en Supabase:', error);
    }
  }
}