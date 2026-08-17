import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Interface que define o que o modal pode receber
export interface ImageModalData {
  title: string;
  icon?: string;          // Opcional: ex 'screen_share', 'help'
  imageSrc: string;       // O caminho do GIF/Imagem
  imageAlt: string;       // Texto alternativo
  description?: string;   // Texto descritivo acima do botão/imagem
  actionUrl?: string;     // Se informado, exibe o botão
  actionText?: string;    // Texto do botão
}

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent {
  
  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageModalData
  ) {}
}