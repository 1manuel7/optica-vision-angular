import { Routes } from '@angular/router';
import { MonturaListComponent } from './features/montura-list/montura-list';
import { MonturaDetailComponent } from './features/montura-detail/montura-detail';
import { LoginComponent } from './features/auth/login/login';
// IMPORTANTE: Importamos nuestro nuevo candado
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // El login es público, no lleva candado
  { path: 'login', component: LoginComponent },
  
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
  
  { path: '**', redirectTo: 'login' }
];