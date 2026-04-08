import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';
import { NumeroSorteadoDetalhe, ModalData, DetailedDraw, SaveBetRequest } from '../../../interfaces/lotofacil';
import { MatIconModule } from '@angular/material/icon';
import { LoteriasService } from '../../../services/loterias.service'; // <-- Importe o Service
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

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
    private loteriasService: LoteriasService, // <-- NOVO: Injeta o service
    private dialog: MatDialog, // <-- NOVO: Injeta o serviço de Dialog para o confirm
    private dialogRef: MatDialogRef<DrawModalComponent>
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

  public apostarConcurso(): void {
    const dialogRefConfirm = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Aposta',
        message: `Deseja registrar que você apostou os números gerados para o concurso ${this.concursoInfo.numero}?`,
        confirmText: 'Sim, apostei',
        cancelText: 'Cancelar',
        confirmButtonColor: 'accent' // Mesma cor do botão para manter consistência
      }
    });

    dialogRefConfirm.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.registrarApostaNoBackend();
      }
    });
  }

  // NOVO: Monta o JSON e dispara para o Service
  private registrarApostaNoBackend(): void {
    this.isLoading = true;

    // Pega a data de hoje no formato YYYY-MM-DD
    const dataHoje = new Date().toISOString().split('T')[0];

    const payload: SaveBetRequest = {
      betDate: dataHoje,
      targetDrawId: this.concursoInfo.numero,
      oddCount: this.concursoInfo.impares,
      evenCount: this.concursoInfo.pares,
      repeatedCount: this.concursoInfo.repetidos,
      betNumbers: this.resultadoOrdenado.map(dezena => dezena.number) // Extrai apenas os inteiros
    };

    // Imprime o JSON no console para você validar a simulação
    console.log('JSON disparado para o Backend:', JSON.stringify(payload, null, 2));

    this.loteriasService.saveGeneratedBet(payload).subscribe({
      next: (resposta) => {
        this.isLoading = false;
        // Idealmente, trocar por um MatSnackBar no futuro
        
        this.dialogRef.close({ action: 'BET_SAVED' }); // Fecha o modal do concurso
      },
      error: (erro) => {
        console.error('Erro ao registrar aposta:', erro);
        this.isLoading = false;
        alert('Não foi possível registrar a aposta. Verifique o console.');
      }
    });
  }
}