import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ModalMessageData {
  title: string;
  content: string;
  theme: string;
}

@Component({
    selector: 'app-template-modal',
    standalone: true,
    imports: [
      CommonModule, 
      MatDialogModule, 
      MatButtonModule, 
      MatIconModule
    ],
    templateUrl: './template-modal.component.html',
    styleUrl: './template-modal.component.scss'
})
export class TemplateModalComponent {

  // Injeta os dados recebidos pelo MatDialog
  constructor(@Inject(MAT_DIALOG_DATA) public data: ModalMessageData) {}

}