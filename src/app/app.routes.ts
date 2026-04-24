import { Routes } from '@angular/router';
import { MonturaListComponent } from './features/montura-list/montura-list';
import { MonturaDetailComponent } from './features/montura-detail/montura-detail';

export const routes: Routes = [
  // 1. Ruta por defecto: si entran a la raíz, los enviamos al catálogo
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  
  // 2. Ruta de la lista: mostrará todas las monturas (y leerá Query Params)
  { path: 'catalogo', component: MonturaListComponent },
  
  // 3. Ruta de detalle: el ":id" es un parámetro dinámico
  { path: 'catalogo/:id', component: MonturaDetailComponent },
  
  // 4. Ruta comodín (opcional, buena práctica): si escriben mal la URL, los manda al catálogo
  { path: '**', redirectTo: 'catalogo' }
];