import { Routes } from '@angular/router';
import { TesteComponent } from './components/teste/teste.component';
import { Teste2Component } from './components/teste2/teste2.component';

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
    path: 'celebration', 
    loadComponent: () => import('./components/community/word-celebration/word-celebration.component').then(m => m.WordCelebrationComponent)
  },
  { 
    path: 'lotofacil', 
    loadComponent: () => import('./components/lotteries/lotofacil/lotofacil.component').then(m => m.LotofacilComponent)
  },
  { 
    path: 'betsReport', 
    loadComponent: () => import('./components/lotteries/bet-report/bet-report.component').then(m => m.BetReportComponent)
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
