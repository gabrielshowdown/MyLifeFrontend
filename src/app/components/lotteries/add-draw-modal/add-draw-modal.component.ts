import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe o FormsModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para mostrar erros
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SaveBetRequest } from '../../../interfaces/lotofacil';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateMaskDirective } from '../../../shared/date/date-mask.directive';

@Component({
  selector: 'app-add-draw-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Adicione aqui
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDatepickerModule,
    DateMaskDirective,
    MatButtonToggleModule,
    MatCheckboxModule
  ],
  templateUrl: './add-draw-modal.component.html',
  styleUrls: ['./add-draw-modal.component.scss']
})
export class AddDrawModalComponent implements OnInit {

  public mode: 'DRAW' | 'BET' = 'DRAW'; /* Controle de o modal que está sendo aberto é de aposta ou concurso */
  public isGeneratedBet: boolean = false;

  public drawId!: number; /* Id do concurso a ser cadastrado */
  public drawDate: Date | null = null;
  public dozensInput: string = ''; /* Onde o usuário digita */
  public formattedDozens: string = ''; /* O que o usuário vê */
  public arrayDozens: string[] = [];
  public hasDuplicates: boolean = false;
  public hasInvalidRange: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddDrawModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nextSuggestedDraw: number },
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    /* Pré-preenche o ID sugerido */
    if (this.data.nextSuggestedDraw) {
      this.drawId = this.data.nextSuggestedDraw;
    }
  }

  onModeChange(newMode: 'DRAW' | 'BET'): void {
    this.mode = newMode;
    
    /* Se o usuário voltou para a aba de Resultado Oficial, reseta o ID */
    if (this.mode === 'DRAW' && this.data.nextSuggestedDraw) {
      this.drawId = this.data.nextSuggestedDraw;
    }

    if (this.mode === 'DRAW') {
      this.isGeneratedBet = false; 
    }
  }

  /* Chamado a cada tecla digitada no input */
  onDozensInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleanValue = input.value.replace(/[^0-9]/g, '');  /* Remove tudo que não for número */

    /* Limita a 30 caracteres (15 dezenas * 2 dígitos) */
    if (cleanValue.length > 30) {
      cleanValue = cleanValue.substring(0, 30);
    }

    /* Usa regex para encontrar grupos de 2 dígitos e colocar um '-' depois */
    /*  O '.replace(/-$/, '')' remove o '-' extra no final, se houver */
    this.formattedDozens = cleanValue.replace(/(.{2})/g, '$1-').replace(/-$/, '');
    this.dozensInput = cleanValue;

    /* Separa o que foi digitado em blocos de 2 dígitos (ignorando ímpares no meio da digitação) */
    const enteredDozens = cleanValue.match(/.{1,2}/g) || [];
    const completDozens = enteredDozens.filter(d => d.length === 2);
  
    /* O Set naturalmente remove elementos duplicados. Se o tamanho for diferente, há repetição. */
    const unique = new Set(completDozens);
    this.hasDuplicates = unique.size !== completDozens.length;

    /* O .some() retorna true se pelo menos UM elemento atender à condição */
    this.hasInvalidRange = completDozens.some(d => {
      const num = parseInt(d, 10);
      return num < 1 || num > 25; /* Impede 00 e números acima de 25 */
    });

    /* Atualiza o valor formatado no input visual (com um truque de timeout) */
    setTimeout(() => {
      input.value = this.formattedDozens;
    }, 0);
  }

  save(): void {
    if (!this.drawId || this.drawId <= 0) {
      this.showErros('Número do concurso/alvo é inválido.');
      return;
    }

    if (!this.drawDate) {
      this.showErros(this.mode === 'DRAW' ? 'A data de apuração é obrigatória.' : 'A data da aposta é obrigatória.');
      return;
    }

    const year = this.drawDate.getFullYear();
    const month = String(this.drawDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.drawDate.getDate()).padStart(2, '0');
    const backendFormattedDate = `${year}-${month}-${day}`;

    const cleanDozens = this.dozensInput;
    if (cleanDozens.length !== 30) {
      this.showErros(`As dezenas estão incompletas. (Esperado: 15, Fornecido: ${cleanDozens.length / 2})`);
      return;
    }

    if (this.hasDuplicates) {
      this.showErros('Existem dezenas repetidas. Corrija antes de salvar.');
      return;
    }

    if (this.hasInvalidRange) {
      this.showErros('Apenas números de 01 a 25 são permitidos. Corrija antes de salvar.');
      return;
    }

    this.arrayDozens = cleanDozens.match(/.{1,2}/g) || [];

    /* Trava de range *01 a 25) */
    const dozendsOutsideRange = this.arrayDozens.filter(d => {
      const num = parseInt(d, 10);
      return num < 1 || num > 25;
    });

    if (dozendsOutsideRange.length > 0) {
      this.showErros(`Apenas números de 01 a 25 são permitidos. Inválidos: ${dozendsOutsideRange.join(', ')}`);
      return;
    }

    const dialogTitle = this.mode === 'DRAW' ? 'Confirmar inclusão?' : 'Confirmar Aposta?';
    const dialogMessage = this.mode === 'DRAW' 
      ? `Deseja realmente salvar o resultado do concurso ${this.drawId}?` 
      : `Deseja registrar sua aposta para o concurso ${this.drawId}?`;

    const dialogRefConfirm = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: dialogTitle,
        message: dialogMessage,
        confirmText: 'Sim, Salvar',
        confirmButtonColor: this.mode === 'DRAW' ? 'primary' : 'accent'
      }
    });

    dialogRefConfirm.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        /* Se for aposta, calculamos pares e ímpares aqui no front */
        if (this.mode === 'BET') {
          const integers = this.arrayDozens.map(n => parseInt(n, 10));
          const evenNubers = integers.filter(n => n % 2 === 0).length;
          const oddNubers = integers.filter(n => n % 2 !== 0).length;

          const betPayload: SaveBetRequest = {
            betDate: backendFormattedDate,
            targetDrawId: this.drawId,
            oddCount: oddNubers,
            evenCount: evenNubers,
            repeatedCount: 0, /* Backend irá recalcular isso */
            betNumbers: integers,
            autoGenerated: this.isGeneratedBet
          };

          this.dialogRef.close({ action: 'BET', payload: betPayload });
        } 
        /* Se for concurso oficial */
        else {
          this.dialogRef.close({
            action: 'DRAW',
            payload: {
              drawId: this.drawId,
              dozens: this.arrayDozens,
              drawDate: backendFormattedDate
            }
          });
        }
      }
    });
  }

  private showErros(mensagem: string): void {
    this._snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: ['mat-toolbar', 'mat-warn'] /* Deixa o snackbar vermelho */
    });
  }
}