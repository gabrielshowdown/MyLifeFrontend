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
    MatIconModule
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

  // Mock dos livros baseados no GET /books/

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  // Simula o GET http://localhost:8080/books/
  loadBooks() {
    // Mock simplificado do retorno
    this.booksService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.allBooks = data;
        console.log('Livros carregados:', this.allBooks);
      },
      error: (err) => {
        console.error('Erro ao buscar os livros:', err);
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

    // Chamada real via POST para separar as leituras
    this.booksService.processText(payload).subscribe({
      next: (result) => {
        this.processedResult = result;
      },
      error: (err) => {
        console.error('Erro ao processar o texto:', err);
      }
    });
  }

  getBooksByCategory(category: string) {
    return this.allBooks.filter(book => book.category === category);
  }
}