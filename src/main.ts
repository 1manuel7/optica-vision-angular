import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- Corregido a AppComponent

bootstrapApplication(AppComponent, appConfig) // <-- Corregido a AppComponent
  .catch((err) => console.error(err));