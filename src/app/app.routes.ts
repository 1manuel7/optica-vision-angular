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
import { OrdenRegistroComponent } from './features/ordenes/orden-list/orden-registro';
// IMPORTAMOS LA NUEVA AGENDA
import { AgendaComponent } from './features/agenda/agenda';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // El login es público, no lleva candado
  { path: 'login', component: LoginComponent },

  // RUTAS PROTEGIDAS
  { 
    path: 'nueva-venta', 
    component: OrdenRegistroComponent, 
    canActivate: [authGuard] 
  },
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
  { 
    path: 'nueva-montura',
    component: MonturaRegistroComponent, 
    canActivate: [authGuard] 
  },
  // NUESTRA NUEVA RUTA PARA LA AGENDA DE CITAS
  {
    path: 'agenda',
    component: AgendaComponent,
    canActivate: [authGuard]
  },
  
  // Ruta comodín (siempre al final)
  { path: '**', redirectTo: 'login' }
];