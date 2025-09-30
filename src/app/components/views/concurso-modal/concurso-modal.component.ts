import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NumerosSorteado } from '../../../interfaces/lotofacil';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  concursoId: number;
  resultado: NumerosSorteado[];
}

@Component({
  selector: 'app-concurso-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './concurso-modal.component.html',
  styleUrl: './concurso-modal.component.scss'
})
export class ConcursoModalComponent {

    // Esta será a nossa fonte de dados para o template, já ordenada.
  resultadoOrdenado: NumerosSorteado[];

  concursoInfo: {
    numero: number,
    pares: number,
    impares: number
  };

  constructor(
    public dialogRef: MatDialogRef<ConcursoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    // Pega as informações do concurso (são iguais para todos os itens)
    const info = this.data.resultado[0].sorteio;
    this.concursoInfo = {
      numero: this.data.concursoId,
      pares: info.qtdPares,
      impares: info.qtdImpares
    };

    // **NOVO:** Ordena os resultados pelo número para garantir a exibição correta
    this.resultadoOrdenado = this.data.resultado.sort((a, b) => a.numero - b.numero);
  }
}
