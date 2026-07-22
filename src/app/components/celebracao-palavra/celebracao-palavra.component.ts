import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Book, BooksService } from '../../services/books.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResultadoModalComponent } from './resultado-modal/resultado-modal.component';

@Component({
  selector: 'app-celebracao-palavra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    DragDropModule,
    MatDialogModule
  ],
  templateUrl: './celebracao-palavra.component.html',
  styleUrls: ['./celebracao-palavra.component.scss']
})
export class CelebracaoPalavraComponent implements OnInit {
  // Modelos para os inputs
  themeName: string = '';
  rawText: string = '';
  processedResult: any = null;
  // Armazenamento do resultado do backend
  allBooks: Book[] = []; // Agora tipado com a interface
  categories: string[] = ['PRIMEIRA_LEITURA', 'SEGUNDA_LEITURA', 'TERCEIRA_LEITURA', 'EVANGELHO', 'DESCARTADO'];

  // Mock futuro para os temas salvos
  savedThemes: any[] = [
    { id: 1, name: 'Advento - Ano A', date: '2026-11-29' },
    { id: 2, name: 'Quaresma - Ano B', date: '2026-02-22' }
  ];

  booksByCategory: { [key: string]: Book[] } = {
    'PRIMEIRA_LEITURA': [],
    'SEGUNDA_LEITURA': [],
    'TERCEIRA_LEITURA': [],
    'EVANGELHO': [],
    'DESCARTADO': []
  };

  constructor(
    private booksService: BooksService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks() {
    this.booksService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.allBooks = data;
        this.distributeBooksToCategories(); // Chama a função para separar
      }
    });
  }

  // Função para limpar e preencher os arrays de cada categoria
  distributeBooksToCategories() {
    this.categories.forEach(cat => this.booksByCategory[cat] = []); // Limpa arrays
    this.allBooks.forEach(book => {
      if (this.booksByCategory[book.category]) {
        this.booksByCategory[book.category].push(book);
      }
    });
  }

  // Simula o POST http://localhost:8080/books/process-text
  processReadings() {
    if (!this.themeName || !this.rawText) return;

    const payload = {
      themeName: this.themeName,
      rawText: this.rawText
    };

    this.booksService.processText(payload).subscribe({
      next: (result) => {
        // EM VEZ de salvar na variável processedResult da tela, abrimos o Modal!
        this.dialog.open(ResultadoModalComponent, {
          data: result, // Passa o JSON retornado pelo backend para o Modal
          width: '85vw', // Largura do modal na tela
          maxWidth: '1000px', // Limite máximo para monitores grandes
          maxHeight: '90vh' // Altura máxima para gerar barra de rolagem se for muito grande
        });
      },
      error: (err) => {
        console.error('Erro ao processar o texto:', err);
      }
    });
  }

  drop(event: CdkDragDrop<Book[]>, newCategoryName: string) {
    if (event.previousContainer === event.container) {
      // Se apenas mudou a ordem dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Se moveu para uma coluna diferente
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Pega o livro que acabou de ser movido
      const movedBook = event.container.data[event.currentIndex];
      
      // Salva no backend chamando o endpoint PUT
      this.booksService.updateCategory(movedBook.id, newCategoryName).subscribe({
        next: (updatedBook) => {
          console.log(`Livro ${updatedBook.name} atualizado para ${updatedBook.category}`);
        },
        error: (err) => {
          console.error('Erro ao atualizar categoria', err);
          // Opcional: Se der erro, você pode recarregar a lista chamando this.loadBooks() 
          // para reverter a alteração visual.
        }
      });
    }
  }

}