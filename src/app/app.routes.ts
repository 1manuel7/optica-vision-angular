import { Routes } from '@angular/router';
import { MonturaListComponent } from './features/montura-list/montura-list';
import { MonturaDetailComponent } from './features/montura-detail/montura-detail';
import { LoginComponent } from './features/auth/login/login';
// IMPORTANTE: Importamos nuestro nuevo candado
import { authGuard } from './core/guards/auth-guard';
import { PacienteRegistroComponent } from './features/pacientes/paciente-registro/paciente-registro';
import { PacienteListComponent } from './features/pacientes/paciente-list/paciente-list';
import { OrdenListComponent } from './features/ordenes/orden-list/orden-list';
import { HomeComponent } from './features/dashboard/home/home';
import { PacienteDetalleComponent } from './features/pacientes/paciente-detalle/paciente-detalle';
import { MonturaRegistroComponent } from './features/catalogo/montura-registro/montura-registro';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
    { 
    path: 'nuevo-paciente', 
    component: PacienteRegistroComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'pedidos', 
    component: OrdenListComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'paciente/:id', 
    component: PacienteDetalleComponent,
    canActivate: [authGuard] 
  },
  
  // El login es público, no lleva candado
  { path: 'login', component: LoginComponent },
  // RUTAS PROTEGIDAS
  { 
    path: 'dashboard', 
    component: HomeComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'directorio', 
    component: PacienteListComponent,
    canActivate: [authGuard] 
  },
  
  // Protegemos el catálogo y el detalle con canActivate
  { 
    path: 'catalogo', 
    component: MonturaListComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'catalogo/:id', 
    component: MonturaDetailComponent,
    canActivate: [authGuard] 
  },
  { path: 'nueva-montura',
   component: MonturaRegistroComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' },


];