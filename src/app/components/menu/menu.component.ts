import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRippleModule } from '@angular/material/core';
import { ThemeService } from '../../config/theme.service';
import { listAnimation } from '../../animations/animations';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  category: string;
  gradientClass: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatSlideToggle,
    MatSlideToggleModule,
    MatRippleModule // Adiciona aquele efeito visual de "onda" ao clicar no Material
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [listAnimation]
})
export class MenuComponent implements OnInit {

  theme: string = 'day';
  @ViewChild('darkModeSwitch', { read: ElementRef }) element: ElementRef | undefined;

  // Lista dinâmica de funcionalidades separadas por tema visual
  menuItems: MenuItem[] = [
    {
      title: 'Lotofácil',
      description: 'Gerador de palpites, estatísticas e sincronização com a Caixa.',
      icon: 'casino',
      route: '/lotofacil',
      category: 'Sorte',
      gradientClass: 'gradient-purple'
    },
    {
      title: 'Suprimentos Praia',
      description: 'Controle de estoque e itens necessários para a casa da praia.',
      icon: 'beach_access',
      route: '/suprimentos-praia',
      category: 'Organização',
      gradientClass: 'gradient-blue'
    },
    {
      title: 'Vencimentos Casa',
      description: 'Monitoramento de validade das comidas e mantimentos.',
      icon: 'kitchen',
      route: '/vencimento-comidas',
      category: 'Organização',
      gradientClass: 'gradient-green'
    },
    {
      title: 'Jogos de Futebol',
      description: 'Acompanhamento de partidas, resultados e estatísticas.',
      icon: 'sports_soccer',
      route: '/futebol',
      category: 'Lazer',
      gradientClass: 'gradient-orange'
    },
    {
      title: 'Celebração da Palavra',
      description: 'Preparações e leituras (Caminho Neocatecumenal).',
      icon: 'menu_book',
      route: '/celebracao',
      category: 'Fé',
      gradientClass: 'gradient-gold'
    }
  ];

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Mantém a mesma lógica de recuperação do tema do Login/Register
    this.theme = this.themeService.getTheme() == undefined ? this.themeService.getTimeOfDay() : this.themeService.getTheme();
  }

  ngAfterViewInit() {
    if (this.element) {
      this.themeService.configureDarkModeSwitch(this.element);
    }
  }

  onToggleChange(event: any): void {
    this.theme = this.themeService.changeTheme(event.checked);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}