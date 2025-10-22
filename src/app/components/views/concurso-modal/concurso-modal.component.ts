import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Necessário para *ngFor, pipe 'number'
import { MatButtonModule } from '@angular/material/button';
import { ConcursoDetalhado, NumeroSorteadoDetalhe } from '../../../interfaces/lotofacil';

// 1. Importar as interfaces da API

// (Ajuste o caminho '.../../interfaces/lotofacil' se necessário)

// 2. Definir a interface que o HTML espera (para tipagem interna)
interface ConcursoInfoVM {
  numero: number;
  impares: number;
  pares: number;
}

@Component({
  selector: 'app-concurso-modal', // Certifique-se que o seletor está correto
  standalone: true, // Assumindo standalone, como o lotofacil.component
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './concurso-modal.component.html',
  styleUrls: ['./concurso-modal.component.scss']
})
export class ConcursoModalComponent implements OnInit {

  // 3. Declarar as propriedades que o HTML (template) vai usar
  public concursoInfo!: ConcursoInfoVM;
  public resultadoOrdenado!: NumeroSorteadoDetalhe[];

  // 4. Injetar os dados da API usando MAT_DIALOG_DATA
  // O 'data' aqui será o objeto 'ConcursoDetalhado' completo
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConcursoDetalhado
  ) { }

  ngOnInit(): void {
    // 5. Fazer a "tradução" dos dados da API para as propriedades do template
    
    // Mapeia os dados gerais do concurso
    this.concursoInfo = {
      numero: this.data.id,
      impares: this.data.qtdImpares,
      pares: this.data.qtdPares
    };

    // Ordena os números (o HTML espera que eles já venham ordenados)
    this.resultadoOrdenado = this.data.numerosConcurso.sort((a, b) => a.numero - b.numero);
  }

}