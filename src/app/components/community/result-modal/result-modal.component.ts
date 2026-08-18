
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
  selector: 'app-result-modal',
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
  templateUrl: './result-modal.component.html',
  styleUrl: './result-modal.component.scss',
})
export class ResultModalComponent {

  saving = false;
  wasSaved = false; // Controle para liberar a exportação
  celebrationDate: Date | null = null; // A data que o usuário vai escolher

  // Recebe os dados injetados via MAT_DIALOG_DATA
  constructor(
    public dialogRef: MatDialogRef<ResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private booksService: BooksService
  ) {
    // Se for um tema salvo, já bloqueiaa edição e preenchee a data
    if (this.data.isSavedTheme) {
      // Converte a string do backend (YYYY-MM-DD) para um objeto Date pro Angular entender
      if (this.data.celebrationDate) {
        // Evitar problemas de fuso horário ao instanciar datas do tipo string
        const [year, month, day] = this.data.celebrationDate.split('-');
        this.celebrationDate = new Date(+year, +month - 1, +day);
      }
    }
  }

  // Lógica inicial para exportar (Copia o resultado para a área de transferência do usuário)
  exportText() {
    let textExportation = `Tema: ${this.data.themeName}\n`;
    
    // Adiciona a Data
    if (this.celebrationDate) {
      const day = String(this.celebrationDate.getDate()).padStart(2, '0');
      const month = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
      const year = this.celebrationDate.getFullYear();
      textExportation += `Data da Celebração: ${day}/${month}/${year}\n`;
    }
    textExportation += `\n`; 

    // Gera a "Lista completa" juntando todas as categorias
    const todasLeituras = [
      ...(this.data.primeiraLeitura || []),
      ...(this.data.segundaLeitura || []),
      ...(this.data.terceiraLeitura || []),
      ...(this.data.evangelhos || []),
      ...(this.data.descartados || [])
    ];

    if (todasLeituras.length > 0) {
      textExportation += `Lista completa (sem repetidos):\n${todasLeituras.join('\n')}\n\n`;
    }

    textExportation += `Classificações por leitura:\n\n`;
    
    // 2. Adiciona as categorias sem o " - " na frente, igual ao terminal
    if (this.data.primeiraLeitura && this.data.primeiraLeitura.length > 0) {
      textExportation += `1 Leitura:\n${this.data.primeiraLeitura.join('\n')}\n\n`;
    }
    
    if (this.data.segundaLeitura && this.data.segundaLeitura.length > 0) {
      textExportation += `2 Leitura:\n${this.data.segundaLeitura.join('\n')}\n\n`;
    }
    
    if (this.data.terceiraLeitura && this.data.terceiraLeitura.length > 0) {
      textExportation += `3 Leitura:\n${this.data.terceiraLeitura.join('\n')}\n\n`;
    }
    
    if (this.data.evangelhos && this.data.evangelhos.length > 0) {
      textExportation += `Evangelhos:\n${this.data.evangelhos.join('\n')}\n\n`;
    }
    
    // 3. Adiciona a lista de Descartados!
    if (this.data.descartados && this.data.descartados.length > 0) {
      textExportation += `Descartados:\n${this.data.descartados.join('\n')}\n\n`;
    }
    
    navigator.clipboard.writeText(textExportation).then(() => {
      alert('Resultado copiado para a área de transferência!');
    });
  }

  exportPdf() {
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

  databaseSave() {
    if (!this.celebrationDate) {
      alert('Por favor, informe a data da celebração.');
      return;
    }

    this.saving = true;
    
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
        this.wasSaved = true;
        this.saving = false;

        if (this.data.onThemeSaved) {
          this.data.onThemeSaved();
        }

        alert('Tema salvo com sucesso!');
        // Não chame o this.dialogRef.close() direto aqui se quiser que ele possa clicar no botão de PDF após salvar!
      },
      error: (err) => {
        console.error('Erro ao salvar tema:', err);
        alert('Ocorreu um erro ao salvar o tema.');
        this.saving = false;
      }
    });
  }
}
