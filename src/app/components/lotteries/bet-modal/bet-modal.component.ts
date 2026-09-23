import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LotofacilBet, LotofacilBetNumber } from '../../../interfaces/lotofacil';

@Component({
  selector: 'app-bet-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './bet-modal.component.html',
  styleUrls: ['./bet-modal.component.scss']
})
export class BetModalComponent implements OnInit {

  public betNumbersSorted!: LotofacilBetNumber[]; /* Array para as dezenas apostadas ordenadas */
  public drawNumbersSorted: any[] = []; /* Array para as dezenas reais */
  
  /* View Models (dado pronto para exibição na tela*/
  /* Aposta */
  public parityBetVM: string = '';
  public repetitionBetVM: string = '';
  /* Sorteio Oficial */
  public realParityVM: string = '';
  public realRepetitionVM: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public bet: LotofacilBet
  ) { }

  ngOnInit(): void {
    /* Ordena e formata as dezenas e estatísticas da aposta */
    this.betNumbersSorted = [...this.bet.betNumbers].sort((a, b) => a.number - b.number);
    this.parityBetVM = `${this.bet.oddCount}Í / ${this.bet.evenCount}P`;
    this.repetitionBetVM = `${this.bet.repeatedCount} Rep`;

    /* Ordena e formata as dezenas e estatísticas do sorteio oficial (se já foi conferido) */
    if (this.bet.checked && this.bet.realDraw) {
      this.drawNumbersSorted = [...this.bet.realDraw.drawNumbers].sort((a: any, b: any) => a.number - b.number);
      this.realParityVM = `${this.bet.realDraw.oddCount}Í / ${this.bet.realDraw.evenCount}P`;
      this.realRepetitionVM = `${this.bet.realDraw.repeatedCount} Rep`;
    }
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}