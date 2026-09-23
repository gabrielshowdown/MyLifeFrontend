
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommunityService } from '../../../services/community.service';
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
  wasSaved = false;
  celebrationDate: Date | null = null; /* A data que o usuário vai escolher, não a de salvamento do tema */

  /* Recebe os dados injetados via MAT_DIALOG_DATA */
  constructor(
    public dialogRef: MatDialogRef<ResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private CommunityService: CommunityService
  ) {
    /* Se for um tema salvo, já bloqueiaa edição e preenchee a data */
    if (this.data.isSavedTheme) {
      /* Converte a string do backend (YYYY-MM-DD) para um objeto Date pro Angular entender */
      if (this.data.celebrationDate) {
        /* Evitar problemas de fuso horário ao instanciar datas do tipo string */
        const [year, month, day] = this.data.celebrationDate.split('-');
        this.celebrationDate = new Date(+year, +month - 1, +day);
      }
    }
  }

  /* Lógica inicial para exportar (Copia o resultado para a área de transferência do usuário) */
  exportText() {
    let textExportation = `Tema: ${this.data.themeName}\n`;
    
    if (this.celebrationDate) {
      const day = String(this.celebrationDate.getDate()).padStart(2, '0');
      const month = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
      const year = this.celebrationDate.getFullYear();
      textExportation += `Data da Celebração: ${day}/${month}/${year}\n`;
    }
    textExportation += `\n`; 

    /* Gera a "Lista completa" juntando todas as categorias */
    const allReadings = [
      ...(this.data.firstReading || []),
      ...(this.data.secondReading || []),
      ...(this.data.thirdReading || []),
      ...(this.data.gospel || []),
      ...(this.data.discarded || [])
    ];

    if (allReadings.length > 0) {
      textExportation += `Lista completa (sem repetidos):\n${allReadings.join('\n')}\n\n`;
    }

    textExportation += `Classificações por leitura:\n\n`;
    
    /* Adiciona as categorias sem o " - " */
    if (this.data.firstReading && this.data.firstReading.length > 0) {
      textExportation += `1 Leitura:\n${this.data.firstReading.join('\n')}\n\n`;
    }
    
    if (this.data.secondReading && this.data.secondReading.length > 0) {
      textExportation += `2 Leitura:\n${this.data.secondReading.join('\n')}\n\n`;
    }
    
    if (this.data.thirdReading && this.data.thirdReading.length > 0) {
      textExportation += `3 Leitura:\n${this.data.thirdReading.join('\n')}\n\n`;
    }
    
    if (this.data.gospel && this.data.gospel.length > 0) {
      textExportation += `gospel:\n${this.data.gospel.join('\n')}\n\n`;
    }
    
    /* Adiciona a lista de discarded */
    if (this.data.discarded && this.data.discarded.length > 0) {
      textExportation += `discarded:\n${this.data.discarded.join('\n')}\n\n`;
    }
    
    navigator.clipboard.writeText(textExportation).then(() => {
      alert('Resultado copiado para a área de transferência!');
    });
  }

  exportPdf() {
    /* Verifica se a data foi informada (deve estar no PDF) */
    if (!this.celebrationDate && !this.data.isSavedTheme) {
      alert('Por favor, informe a data da celebração para gerar o PDF.');
      return;
    }

    /* Prepara a data (DD/MM/YYYY) para enviar ao backend */
    let payload = { ...this.data };
    
    if (this.celebrationDate) {
      const year = this.celebrationDate.getFullYear();
      const month = String(this.celebrationDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.celebrationDate.getDate()).padStart(2, '0');
      payload.celebrationDate = `${year}-${month}-${day}`;
    }

    /* Define qual requisição fazer com base na existência do ID */
    let requestObservable;
    
    if (this.data.id) {
      /* Já está salvo no banco, usamos o GET pelo ID */
      requestObservable = this.CommunityService.exportPdf(this.data.id);
    } else {
      /* NÃO está salvo, usamos o POST enviando o payload inteiro */
      requestObservable = this.CommunityService.exportPdfPreview(payload);
    }

    /* Executa a requisição e faz o download */
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
    
    this.CommunityService.saveTheme(payload).subscribe({
      next: (resultadoSalvo) => {
        /* Guardar o ID retornado para o PDF funcionar!*/ 
        this.data.id = resultadoSalvo.id; 
        this.wasSaved = true;
        this.saving = false;

        /* Se na abertura do modal for passado o 'onThemeSaved, executa a função anomina mencionada nele, que é a 'this.loadSavedThemes' */
        if (this.data.onThemeSaved) {
          this.data.onThemeSaved();
        }

        alert('Tema salvo com sucesso!');
        /* Se quiser fechar, chamar o  this.dialogRef.close(*/
     },
      error: (err) => {
        console.error('Erro ao salvar tema:', err);
        alert('Ocorreu um erro ao salvar o tema.');
        this.saving = false;
      }
    });
  }
}
