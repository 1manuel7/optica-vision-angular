import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  // Aquí guardaremos en vivo quién está conectado
  private currentUser = new BehaviorSubject<User | null>(null);
  user$ = this.currentUser.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.cargarUsuario();
    
    // Este "vigilante" avisa automáticamente si alguien inicia o cierra sesión
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user || null);
    });
  }

  // Verifica si ya hay una sesión guardada al abrir la página
  async cargarUsuario() {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) {
      this.currentUser.next(data.user);
    }
  }

  // Función para entrar
  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
  }

  // Función para salir
  async logout() {
    await this.supabase.auth.signOut();
  }
}