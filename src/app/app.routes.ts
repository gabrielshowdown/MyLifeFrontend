import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TesteComponent } from './componentes/teste/teste.component';
import { Teste2Component } from './componentes/teste2/teste2.component';

export const routes: Routes = [
  {
    path: '',
    component: TesteComponent
  },
  {
    path: 'teste2',
    component: Teste2Component
  },
];
