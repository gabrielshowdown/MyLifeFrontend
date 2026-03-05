import { Routes } from '@angular/router';
import { TesteComponent } from './components/teste/teste.component';
import { Teste2Component } from './components/teste2/teste2.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LotofacilComponent } from './components/lotteries/lotofacil/lotofacil.component';
import { MenuComponent } from './components/menu/menu.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full' // Necessário quando o path é vazio, indica que é para ler toda a URL
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'menu', 
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent)
  },
  { 
    path: 'lotofacil', 
    loadComponent: () => import('./components/lotteries/lotofacil/lotofacil.component').then(m => m.LotofacilComponent)
  },
  {
    path: 'teste2',
    component: Teste2Component
  },
  {
    path: 'teste',
    component: TesteComponent
  },
];
