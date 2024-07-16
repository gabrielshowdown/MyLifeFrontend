import { Routes } from '@angular/router';
import { TesteComponent } from './componentes/teste/teste.component';
import { Teste2Component } from './componentes/teste2/teste2.component';
import { LoginComponent } from './componentes/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'teste',
    component: TesteComponent
  },
  {
    path: 'teste2',
    component: Teste2Component
  },
];
