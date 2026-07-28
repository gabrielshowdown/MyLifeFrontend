
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BooksService } from '../../../services/books.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-resultado-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './resultado-modal.component.html',
  styleUrl: './resultado-modal.component.scss',
})
export class ResultadoModalComponent {

  salvando = false;
  foiSalvo = false; // Controle para liberar a exportação
  celebrationDate: Date | null = null; // A data que o usuário vai escolher

  // Recebe os dados injetados via MAT_DIALOG_DATA
  constructor(
    public dialogRef: MatDialogRef<ResultadoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private booksService: BooksService
  ) {
    // Se for um tema salvo, já bloqueamos a edição e preenchemos a data
    if (this.data.isSavedTheme) {
      this.foiSalvo = true; // Se já está no banco, a exportação é livre
      
      // Converte a string do backend (YYYY-MM-DD) para um objeto Date pro Angular entender
      if (this.data.celebrationDate) {
        // Truque para evitar problemas de fuso horário ao instanciar datas do tipo string
        const [year, month, day] = this.data.celebrationDate.split('-');
        this.celebrationDate = new Date(+year, +month - 1, +day);
      }
    }
  }

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

  salvarNoBanco() {
    if (!this.celebrationDate) {
      alert('Por favor, informe a data da celebração.');
      return;
    }

    this.salvando = true;
    
    const year = this.celebrationDate.getFullYear();
    const month = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.celebrationDate.getDate()).padStart(2, '0');
    
    const payload = {
      ...this.data,
      celebrationDate: `${year}-${month}-${day}`
    };
    
    this.booksService.saveTheme(payload).subscribe({
      next: (resultadoSalvo) => {
        this.salvando = false;
        // FECHA O MODAL e envia "true" informando à tela de trás que salvou com sucesso
        this.dialogRef.close(true); 
      },
      error: (err) => {
        console.error('Erro ao salvar tema:', err);
        alert('Ocorreu um erro ao salvar o tema.');
        this.salvando = false;
      }
    });
  }
}
