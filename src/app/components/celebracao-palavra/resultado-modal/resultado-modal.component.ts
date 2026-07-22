/*
import { Component } from '@angular/core';

@Component({
  selector: 'app-resultado-modal',
  imports: [],
  templateUrl: './resultado-modal.component.html',
  styleUrl: './resultado-modal.component.scss',
})
export class ResultadoModalComponent {

}
*/
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resultado-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './resultado-modal.component.html',
  styleUrl: './resultado-modal.component.scss',
})
export class ResultadoModalComponent {
  // Recebe os dados injetados via MAT_DIALOG_DATA
  constructor(
    public dialogRef: MatDialogRef<ResultadoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Lógica inicial para exportar (Copia o resultado para a área de transferência do usuário)
  exportarTexto() {
    let textoExportacao = `Tema: ${this.data.themeName}\n\n`;
    
    if (this.data.primeiraLeitura.length > 0) textoExportacao += `Primeira Leitura:\n- ${this.data.primeiraLeitura.join('\n- ')}\n\n`;
    if (this.data.segundaLeitura.length > 0) textoExportacao += `Segunda Leitura:\n- ${this.data.segundaLeitura.join('\n- ')}\n\n`;
    if (this.data.terceiraLeitura.length > 0) textoExportacao += `Terceira Leitura:\n- ${this.data.terceiraLeitura.join('\n- ')}\n\n`;
    if (this.data.evangelhos.length > 0) textoExportacao += `Evangelho:\n- ${this.data.evangelhos.join('\n- ')}\n\n`;
    
    // Função nativa do navegador para copiar texto
    navigator.clipboard.writeText(textoExportacao).then(() => {
      alert('Resultado copiado para a área de transferência!');
    });
  }
}
