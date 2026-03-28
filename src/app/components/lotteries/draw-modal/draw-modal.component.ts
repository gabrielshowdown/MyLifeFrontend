import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';
import { NumeroSorteadoDetalhe, ModalData, DetailedDraw } from '../../../interfaces/lotofacil';
import { MatIconModule } from '@angular/material/icon';
import { LoteriasService } from '../../../services/loterias.service'; // <-- Importe o Service

interface ConcursoInfoVM {
  numero: number;
  impares: number;
  pares: number;
  repetidos: number
}

@Component({
  selector: 'app-draw-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './draw-modal.component.html',
  styleUrls: ['./draw-modal.component.scss']
})
export class DrawModalComponent implements OnInit {

  public concursoInfo!: ConcursoInfoVM;
  public resultadoOrdenado!: NumeroSorteadoDetalhe[];
  public isGerado: boolean = false;
  public isLoading: boolean = false; // <-- NOVO: Controla estado de loading do botão

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalData,
    private loteriasService: LoteriasService // <-- NOVO: Injeta o service
  ) { }

  ngOnInit(): void {
    this.isGerado = this.data.isGerado;
    this.atualizarDadosTela(this.data.concurso);
  }

  // Extraímos a lógica para reaproveitar ao gerar um novo
  private atualizarDadosTela(concurso: DetailedDraw): void {
    this.concursoInfo = {
      numero: concurso.id,
      impares: concurso.oddCount,
      pares: concurso.evenCount,
      repetidos: concurso.repeatedCount,
    };
    this.resultadoOrdenado = concurso.drawNumbers.sort((a, b) => a.number - b.number);
  }

  // NOVO: Função para recriar o concurso diretamente do modal
  public recriarConcurso(): void {
    if (!this.data.requestParams || this.isLoading) return;

    this.isLoading = true;
    
    this.loteriasService.generateDraw(this.data.requestParams).subscribe({
      next: (novoConcurso) => {
        // Atualiza a tela instantaneamente sem fechar o modal
        this.atualizarDadosTela(novoConcurso);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao recriar palpite:', err);
        this.isLoading = false;
      }
    });
  }
}