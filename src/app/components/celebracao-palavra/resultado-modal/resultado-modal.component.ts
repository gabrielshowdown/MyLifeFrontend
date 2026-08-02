
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
    // 1. Adiciona o Tema
    let textoExportacao = `Tema: ${this.data.themeName}\n`;
    
    // 2. Verifica se existe uma data e formata para DD/MM/AAAA
    if (this.celebrationDate) {
      const dia = String(this.celebrationDate.getDate()).padStart(2, '0');
      const mes = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
      const ano = this.celebrationDate.getFullYear();
      textoExportacao += `Data da Celebração: ${dia}/${mes}/${ano}\n`;
    }

    // Pula uma linha extra antes de começar as leituras
    textoExportacao += `\n`; 
    
    // 3. Adiciona as categorias dinamicamente
    if (this.data.primeiraLeitura && this.data.primeiraLeitura.length > 0) {
      textoExportacao += `Primeira Leitura:\n- ${this.data.primeiraLeitura.join('\n- ')}\n\n`;
    }
    
    if (this.data.segundaLeitura && this.data.segundaLeitura.length > 0) {
      textoExportacao += `Segunda Leitura:\n- ${this.data.segundaLeitura.join('\n- ')}\n\n`;
    }
    
    if (this.data.terceiraLeitura && this.data.terceiraLeitura.length > 0) {
      textoExportacao += `Terceira Leitura:\n- ${this.data.terceiraLeitura.join('\n- ')}\n\n`;
    }
    
    if (this.data.evangelhos && this.data.evangelhos.length > 0) {
      textoExportacao += `Evangelho:\n- ${this.data.evangelhos.join('\n- ')}\n\n`;
    }
    
    // Função nativa do navegador para copiar texto
    navigator.clipboard.writeText(textoExportacao).then(() => {
      alert('Resultado copiado para a área de transferência!');
    });
  }

  exportarPdf() {
    // 1. Verifica se a data foi informada (pois queremos ela no PDF)
    if (!this.celebrationDate && !this.data.isSavedTheme) {
      alert('Por favor, informe a data da celebração para gerar o PDF.');
      return;
    }

    // 2. Prepara a data (DD/MM/YYYY) para enviar ao backend
    let payload = { ...this.data };
    
    if (this.celebrationDate) {
      const year = this.celebrationDate.getFullYear();
      const month = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.celebrationDate.getDate()).padStart(2, '0');
      payload.celebrationDate = `${year}-${month}-${day}`;
    }

    // 3. Define qual requisição fazer com base na existência do ID
    let requestObservable;
    
    if (this.data.id) {
      // Já está salvo no banco, usamos o GET pelo ID
      requestObservable = this.booksService.exportPdf(this.data.id);
    } else {
      // NÃO está salvo, usamos o POST enviando o payload inteiro
      requestObservable = this.booksService.exportPdfPreview(payload);
    }

    // 4. Executa a requisição e faz o download
    requestObservable.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Leituras_${this.data.themeName}.pdf`; 
        link.click(); 
        window.URL.revokeObjectURL(url); 
      },
      error: (err) => {
        console.error('Erro ao gerar o PDF:', err);
        alert('Não foi possível gerar o PDF.');
      }
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
        // GUARDE O ID RETORNADO PARA O PDF FUNCIONAR!
        this.data.id = resultadoSalvo.id; 
        this.foiSalvo = true;
        this.salvando = false;
        alert('Tema salvo com sucesso! Agora você pode gerar o PDF.');
        // Não chame o this.dialogRef.close() direto aqui se quiser que ele possa clicar no botão de PDF após salvar!
      },
      error: (err) => {
        console.error('Erro ao salvar tema:', err);
        alert('Ocorreu um erro ao salvar o tema.');
        this.salvando = false;
      }
    });
  }
}
