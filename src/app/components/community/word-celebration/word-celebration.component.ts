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
import { CommunityService } from '../../../services/community.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImageModalComponent } from '../../../shared/image-modal/image-modal.component';
import { ResultModalComponent } from '../result-modal/result-modal.component';
import { BookBible } from '../../../interfaces/book-bible';
import { DebugService } from '../../../core/services/debug.service';

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

  /* Modelos para os inputs */
  themeName: string = '';
  rawText: string = '';
  processedResult: any = null;

  /* Armazenamento do resultado do backend */
  allBooks: BookBible[] = [];
  /* Usado como base na separação das leituras que vem do backend */
  categories: string[] = ['PRIMEIRA_LEITURA', 'SEGUNDA_LEITURA', 'TERCEIRA_LEITURA', 'EVANGELHO', 'DESCARTADO'];

  savedThemes: any[] = [];
  
  /* Guarda em cada chave que vem do tipo Enumerado um array de BookBible */
  booksByCategory: { [key: string]: BookBible[] } = {
    'PRIMEIRA_LEITURA': [],
    'SEGUNDA_LEITURA': [],
    'TERCEIRA_LEITURA': [],
    'EVANGELHO': [],
    'DESCARTADO': []
  };

  constructor(
    private communityService: CommunityService,
    private dialog: MatDialog,
    private debugService: DebugService,
  ) {}

  ngOnInit(): void {
    this.loadBooks();
    this.loadSavedThemes();
  }

  loadBooks() {
    this.communityService.getBooks().subscribe({
      next: (data: BookBible[]) => {
        this.allBooks = data;
        this.distributeBooksToCategories(); /* Chama a função para separar */
      }
    });
  }

  loadSavedThemes() {
    this.communityService.getSavedThemes().subscribe({
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
      },
      width: '85vw',
      maxWidth: '1000px',
      maxHeight: '90vh'
    });
  }

  /* Função para limpar e preencher os arrays de cada categoria */
  distributeBooksToCategories() {
    this.categories.forEach(cat => this.booksByCategory[cat] = []); /* Limpa arrays */
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

    this.communityService.processText(payload).subscribe({
      next: (result) => {
        /* Guarda a referência do modal aberto */
        const dialogRef = this.dialog.open(ResultModalComponent, {
          data: {
            ...result,
            /* Passa a instrução para recarregar a lista lateral, sendo uma função anonima para o modal */
            onThemeSaved: () => this.loadSavedThemes() 
          },
          width: '85vw',
          maxWidth: '1000px',
          maxHeight: '90vh'
        });

        /* Fica "escutando" o momento em que o modal é fechado */
        dialogRef.afterClosed().subscribe((saved: boolean) => {
          if (saved) {
            /* this.loadSavedThemes(); */ /* Recarrega a lista lateral de temas (já é feito ao abrir o modal) */
            this.themeName = ''; /* Limpa o input do nome */
            this.rawText = ''; /* Limpa o textarea das leituras */
          }
        });
      },
      error: (err) => {
        console.error('Erro ao processar o texto:', err);
      }
    });
  }

  /* Função de mover as leituras */
  drop(event: CdkDragDrop<BookBible[]>, newCategoryName: string) {
    if (event.previousContainer === event.container) {
      /* Se apenas mudou a ordem dentro da mesma coluna */
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      /* Se moveu para uma coluna diferente */
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      /* Pega o livro que acabou de ser movido */
      const movedBook = event.container.data[event.currentIndex];
      
      /* Salva no backend chamando o endpoint PUT */
      this.communityService.updateCategory(movedBook.id, newCategoryName).subscribe({
        next: (updatedBook) => {
          this.debugService.log(`Livro ${updatedBook.name} atualizado para ${updatedBook.category}`);
        },
        error: (err) => {
          console.error('Erro ao atualizar categoria', err);
        }
      });
    }
  }

  formatCategoryName(category: string): string {
    if (!category) return '';
    /* Substitui o underline que vem por padrão no ENUM por espaço */
    return category.replace('_', ' ');
  }

  openTutorial() {
    this.dialog.open(ImageModalComponent, {
      width: '600px',
      maxWidth: '90vw',
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