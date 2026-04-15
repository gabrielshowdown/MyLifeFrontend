import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LotofacilBet, LotofacilBetNumber, DetailedDraw } from '../../../interfaces/lotofacil';

@Component({
  selector: 'app-bet-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './bet-modal.component.html',
  styleUrls: ['./bet-modal.component.scss']
})
export class BetModalComponent implements OnInit {

  public apostadosOrdenados!: LotofacilBetNumber[];
  public sorteadosOrdenados: any[] = []; // Array para as dezenas reais
  
  // View Models da Aposta
  public paridadeVM: string = '';
  public repetidosVM: string = '';

  // View Models do Sorteio Oficial
  public paridadeRealVM: string = '';
  public repetidosRealVM: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public bet: LotofacilBet
  ) { }

  ngOnInit(): void {
    // 1. Ordena e formata as dezenas e estatísticas da APOSTA
    this.apostadosOrdenados = [...this.bet.betNumbers].sort((a, b) => a.number - b.number);
    this.paridadeVM = `${this.bet.oddCount}Í / ${this.bet.evenCount}P`;
    this.repetidosVM = `${this.bet.repeatedCount} Rep`;

    // 2. Ordena e formata as dezenas e estatísticas do SORTEIO OFICIAL (se já foi conferido)
    if (this.bet.checked && this.bet.realDraw) {
      this.sorteadosOrdenados = [...this.bet.realDraw.drawNumbers].sort((a: any, b: any) => a.number - b.number);
      this.paridadeRealVM = `${this.bet.realDraw.oddCount}Í / ${this.bet.realDraw.evenCount}P`;
      this.repetidosRealVM = `${this.bet.realDraw.repeatedCount} Rep`;
    }
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}