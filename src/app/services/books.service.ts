import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos uma interface baseada no retorno do seu JSON
export interface Book {
  id: number;
  abbreviation: string;
  name: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  // URL base do seu backend Spring Boot
  private apiUrl = 'http://localhost:8080/books';

  constructor(private http: HttpClient) {}

  // Faz o GET em http://localhost:8080/books
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  // Já aproveitamos para fazer o POST do processamento
  processText(payload: { themeName: string, rawText: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/process-text`, payload);
  }
}