import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DetailedDraw } from '../../../interfaces/lotofacil';

@Component({
  selector: 'app-draw-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './draw-card.component.html',
  styleUrls: ['./draw-card.component.scss']
})
export class DrawCardComponent {
  @Input() draw!: DetailedDraw;

  // Helper para formatar números menores que 10 com zero à esquerda
  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}