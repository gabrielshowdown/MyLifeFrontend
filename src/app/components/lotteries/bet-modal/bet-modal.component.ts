import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LotofacilBet, LotofacilBetNumber, DetailedDraw } from '../../../interfaces/lotofacil'; // Importe suas interfaces

@Component({
  selector: 'app-bet-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './bet-modal.component.html',
  styleUrls: ['./bet-modal.component.scss']
})
export class BetModalComponent {

  public apostadosOrdenados!: LotofacilBetNumber[];
  public paridadeVM: string = '';
  public repetidosVM: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public bet: LotofacilBet
  ) { }

  ngOnInit(): void {
    // Ordena as dezenas apostadas para exibição
    this.apostadosOrdenados = [...this.bet.betNumbers].sort((a, b) => a.number - b.number);
    
    // Formata informações auxiliares
    this.paridadeVM = `${this.bet.oddCount}Í / ${this.bet.evenCount}P`;
    this.repetidosVM = `${this.bet.repeatedCount} Rep`;
  }

  // Helper para formatar números com zero à esquerda
  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}