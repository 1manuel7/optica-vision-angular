import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  private currentUser = new BehaviorSubject<User | null>(null);
  user$ = this.currentUser.asObservable();

  // <-- 1. NUEVA VARIABLE PARA EL ROL -->
  private currentRole = new BehaviorSubject<string | null>(null);
  rol$ = this.currentRole.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarUsuario();
    
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user || null);
      // Extraemos el rol. Si no tiene, asumimos que es VENDEDOR por seguridad
      this.currentRole.next(session?.user?.user_metadata?.['rol'] || 'VENDEDOR');
    });
  }

  async cargarUsuario() {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) {
      this.currentUser.next(data.user);
      this.currentRole.next(data.user.user_metadata?.['rol'] || 'VENDEDOR');
    }
  }

  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentRole.next(null); // Limpiamos el rol al salir
  }

  // <-- 2. NUEVA FUNCIÓN RÁPIDA DE VALIDACIÓN -->
  esAdmin(): boolean {
    return this.currentRole.value === 'ADMIN';
  }
}