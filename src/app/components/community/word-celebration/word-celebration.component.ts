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
import { Book, CommunityService } from '../../../services/community.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImageModalComponent } from '../../../shared/image-modal/image-modal.component';
import { ResultModalComponent } from '../result-modal/result-modal.component';

@Component({
  selector: 'app-word-celebration',
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
  templateUrl: './word-celebration.component.html',
  styleUrls: ['./word-celebration.component.scss']
})
export class WordCelebrationComponent implements OnInit {

  // Modelos para os inputs
  themeName: string = '';
  rawText: string = '';
  processedResult: any = null;

  // Armazenamento do resultado do backend
  allBooks: Book[] = []; // Agora tipado com a interface
  categories: string[] = ['PRIMEIRA_LEITURA', 'SEGUNDA_LEITURA', 'TERCEIRA_LEITURA', 'EVANGELHO', 'DESCARTADO'];

  savedThemes: any[] = [];
  
  booksByCategory: { [key: string]: Book[] } = {
    'PRIMEIRA_LEITURA': [],
    'SEGUNDA_LEITURA': [],
    'TERCEIRA_LEITURA': [],
    'EVANGELHO': [],
    'DESCARTADO': []
  };

  constructor(
    private CommunityService: CommunityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadSavedThemes();
  }

  loadBooks() {
    this.CommunityService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.allBooks = data;
        this.distributeBooksToCategories(); // Chama a função para separar
      }
    });
  }

  loadSavedThemes() {
    this.CommunityService.getSavedThemes().subscribe({
      next: (themes) => {
        this.savedThemes = themes;
      },
      error: (err) => {
        console.error('Erro ao buscar temas salvos:', err);
      }
    });
  }

  viewSavedTheme(theme: any) {
    this.dialog.open(ResultModalComponent, {
      data: { 
        ...theme, 
        isSavedTheme: true,
        onThemeSaved: () => this.loadSavedThemes() 
      },
      width: '85vw',
      maxWidth: '1000px',
      maxHeight: '90vh'
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

  processReadings() {
    if (!this.themeName || !this.rawText) return;

    const payload = {
      themeName: this.themeName,
      rawText: this.rawText
    };

    this.CommunityService.processText(payload).subscribe({
      next: (result) => {
        // Guarda a referência do modal aberto
        const dialogRef = this.dialog.open(ResultModalComponent, {
          data: {
            ...result,
            // Passamos a instrução para recarregar a lista lateral
            onThemeSaved: () => this.loadSavedThemes() 
          },
          width: '85vw',
          maxWidth: '1000px',
          maxHeight: '90vh'
        });

        // Fica "escutando" o momento em que o modal é fechado
        dialogRef.afterClosed().subscribe((saved: boolean) => {
          if (saved) {
            this.loadSavedThemes(); // Recarrega a lista lateral de temas
            this.themeName = '';    // Limpa o input do nome
            this.rawText = '';      // Limpa o textarea das leituras
          }
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
      this.CommunityService.updateCategory(movedBook.id, newCategoryName).subscribe({
        next: (updatedBook) => {
          console.log(`Livro ${updatedBook.name} atualizado para ${updatedBook.category}`);
        },
        error: (err) => {
          console.error('Erro ao atualizar categoria', err);
        }
      });
    }
  }

  formatCategoryName(category: string): string {
    if (!category) return '';
    // Substitui o underline por espaço
    return category.replace('_', ' ');
  }

  openTutorial() {
    this.dialog.open(ImageModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      // Passamos o objeto de configuração aqui!
      data: {
        title: 'Como extrair as leituras',
        icon: 'screen_share',
        imageSrc: 'img/search-theme.gif',
        imageAlt: 'Demonstração de como copiar as leituras',
        description: 'Acesse o site abaixo para encontrar o tema e copiar as leituras:',
        actionUrl: 'https://leondufour.com/',
        actionText: 'Acessar leondufour.com'
      }
    });
  }

}