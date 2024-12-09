import { Routes } from '@angular/router';
import { TesteComponent } from './components/teste/teste.component';
import { Teste2Component } from './components/teste2/teste2.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full' // Necessário quando o path é vazio, indica que é para ler toda a URL
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
