import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe o FormsModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para mostrar erros

@Component({
  selector: 'app-add-concurso-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Adicione aqui
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './add-concurso-modal.component.html',
  // styleUrls: ['./add-concurso-modal.component.scss'] // (Opcional)
})
export class AddConcursoModalComponent implements OnInit {

  public concursoId!: number;
  public dezenasInput: string = ''; // Onde o usuário digita
  public dezenasFormatadas: string = ''; // O que o usuário vê
  public dezenasArray: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddConcursoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proximoConcursoSugerido: number },
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Pré-preenche o ID sugerido
    if (this.data.proximoConcursoSugerido) {
      this.concursoId = this.data.proximoConcursoSugerido;
    }
  }

  /**
   * Esta é a mágica! Chamado a cada tecla digitada no input.
   */
  onDezenasInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valorLimpo = input.value.replace(/[^0-9]/g, ''); // 1. Remove tudo que não for número

    // Limita a 30 caracteres (15 dezenas * 2 dígitos)
    if (valorLimpo.length > 30) {
      valorLimpo = valorLimpo.substring(0, 30);
    }

    // 2. Adiciona o '-' a cada 2 dígitos
    // Usamos regex para encontrar grupos de 2 dígitos e colocar um '-' depois
    // O '.replace(/-$/, '')' remove o '-' extra no final, se houver
    this.dezenasFormatadas = valorLimpo.replace(/(.{2})/g, '$1-').replace(/-$/, '');

    // 3. Atualiza o valor real do input
    // Isso garante que o cursor se mova corretamente
    this.dezenasInput = valorLimpo; 
    
    // Atualiza o valor formatado no input visual (com um truque de timeout)
    // Usamos um timeout minúsculo para permitir que o Angular atualize o 'value'
    // antes de nós o reformatarmos, evitando problemas de cursor.
    setTimeout(() => {
      input.value = this.dezenasFormatadas;
    }, 0);
  }

  salvar(): void {
    // 1. Validar ID
    if (!this.concursoId || this.concursoId <= 0) {
      this.mostrarErro('Número do concurso é inválido.');
      return;
    }

    // 2. Validar Dezenas
    const dezenasLimpa = this.dezenasInput;
    if (dezenasLimpa.length !== 30) {
      this.mostrarErro(`As dezenas estão incompletas. (Esperado: 15, Fornecido: ${dezenasLimpa.length / 2})`);
      return;
    }

    // 3. Transformar '010607...' em ['01', '06', '07', ...]
    this.dezenasArray = dezenasLimpa.match(/.{1,2}/g) || [];

    // 4. Fechar o modal e retornar os dados
    this.dialogRef.close({
      concursoId: this.concursoId,
      dezenas: this.dezenasArray
    });
  }

  private mostrarErro(mensagem: string): void {
    this._snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: ['mat-toolbar', 'mat-warn'] // Deixa o snackbar vermelho
    });
  }
}