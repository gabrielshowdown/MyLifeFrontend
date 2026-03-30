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
    MatNativeDateModule,
    MatButtonToggleModule
  ],
  templateUrl: './add-draw-modal.component.html',
  styleUrls: ['./add-draw-modal.component.scss']
})
export class AddDrawModalComponent implements OnInit {

  public mode: 'DRAW' | 'BET' = 'DRAW';

  public drawId!: number; // Id do concurso a ser cadastrado
  public drawDate: Date | null = null;
  public dozensInput: string = ''; // Onde o usuário digita
  public formattedDozens: string = ''; // O que o usuário vê
  public arrayDozens: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddDrawModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nextSuggestedDraw: number },
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Pré-preenche o ID sugerido
    if (this.data.nextSuggestedDraw) {
      this.drawId = this.data.nextSuggestedDraw;
    }
  }

  /**
   * Esta é a mágica! Chamado a cada tecla digitada no input.
   */
  onDozensInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleanValue = input.value.replace(/[^0-9]/g, ''); // 1. Remove tudo que não for número

    // Limita a 30 caracteres (15 dezenas * 2 dígitos)
    if (cleanValue.length > 30) {
      cleanValue = cleanValue.substring(0, 30);
    }

    // 2. Adiciona o '-' a cada 2 dígitos
    // Usamos regex para encontrar grupos de 2 dígitos e colocar um '-' depois
    // O '.replace(/-$/, '')' remove o '-' extra no final, se houver
    this.formattedDozens = cleanValue.replace(/(.{2})/g, '$1-').replace(/-$/, '');

    // 3. Atualiza o valor real do input
    // Isso garante que o cursor se mova corretamente
    this.dozensInput = cleanValue; 
    
    // Atualiza o valor formatado no input visual (com um truque de timeout)
    // Usamos um timeout minúsculo para permitir que o Angular atualize o 'value'
    // antes de nós o reformatarmos, evitando problemas de cursor.
    setTimeout(() => {
      input.value = this.formattedDozens;
    }, 0);
  }

  /**
   * Máscara manual para o campo de Data (DD/MM/AAAA)
   */
  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // 1. Remove tudo que não for número (letras, símbolos, etc)
    let cleanValue = input.value.replace(/\D/g, ''); 

    // 2. Limita a 8 dígitos reais (DDMMAAAA)
    if (cleanValue.length > 8) {
      cleanValue = cleanValue.substring(0, 8);
    }

    // 3. Aplica a máscara DD/MM/AAAA
    let formattedValue = cleanValue;
    if (cleanValue.length > 4) {
      // Se tem mais de 4 dígitos, coloca as duas barras
      formattedValue = cleanValue.replace(/^(\d{2})(\d{2})(\d{1,4}).*/, '$1/$2/$3');
    } else if (cleanValue.length > 2) {
      // Se tem mais de 2 dígitos, coloca a primeira barra
      formattedValue = cleanValue.replace(/^(\d{2})(\d{1,2}).*/, '$1/$2');
    }

    // 4. Atualiza o input usando o truque do setTimeout
    // Igual fizemos nas dezenas, para não atrapalhar o cursor do Angular
    setTimeout(() => {
      input.value = formattedValue;
    }, 0);

    if (cleanValue.length === 8) {
      const day = +cleanValue.substring(0, 2);
      const month = +cleanValue.substring(2, 4);
      const year = +cleanValue.substring(4, 8);

      const date = new Date(year, month - 1, day);

      // Validação real (evita 31/02/2026 virar data inválida)
      if ( date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day) {
        this.drawDate = date; // ✅ agora nunca mais será null
      } else {
        this.drawDate = null;
      }
    } 
    else {
      this.drawDate = null;
    }
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

    this.arrayDozens = cleanDozens.match(/.{1,2}/g) || [];

    const tituloDialog = this.mode === 'DRAW' ? 'Confirmar inclusão?' : 'Confirmar Aposta?';
    const msgDialog = this.mode === 'DRAW' 
      ? `Deseja realmente salvar o resultado do concurso ${this.drawId}?` 
      : `Deseja registrar sua aposta para o concurso ${this.drawId}?`;

    const dialogRefConfirm = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: tituloDialog,
        message: msgDialog,
        confirmText: 'Sim, Salvar',
        confirmButtonColor: this.mode === 'DRAW' ? 'primary' : 'accent'
      }
    });

    dialogRefConfirm.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Se for aposta, calculamos pares e ímpares aqui no front
        if (this.mode === 'BET') {
          const numerosInteiros = this.arrayDozens.map(n => parseInt(n, 10));
          const pares = numerosInteiros.filter(n => n % 2 === 0).length;
          const impares = numerosInteiros.filter(n => n % 2 !== 0).length;

          const betPayload: SaveBetRequest = {
            betDate: backendFormattedDate,
            targetDrawId: this.drawId,
            oddCount: impares,
            evenCount: pares,
            repeatedCount: 0, // Backend irá recalcular isso
            betNumbers: numerosInteiros
          };

          this.dialogRef.close({ action: 'BET', payload: betPayload });
        } 
        // Se for concurso oficial
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
      panelClass: ['mat-toolbar', 'mat-warn'] // Deixa o snackbar vermelho
    });
  }
}