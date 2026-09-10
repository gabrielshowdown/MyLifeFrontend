import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookBible } from '../interfaces/book-bible';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  private readonly API_BOOKS = 'http://localhost:8080/books';
  private readonly API_THEMES= 'http://localhost:8080/themes';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<BookBible[]> {
    return this.http.get<BookBible[]>(this.API_BOOKS);
  }

  processText(payload: { themeName: string, rawText: string }): Observable<any> {
    return this.http.post<any>(`${this.API_THEMES}/process-text`, payload);
  }
  
  updateCategory(id: number, newCategory: string): Observable<BookBible> {
    // O Spring Boot com @RequestBody Enum espera que a string venha entre aspas duplas no JSON
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<BookBible>(`${this.API_BOOKS}/${id}/category`, `"${newCategory}"`, { headers });
  }

  // Novo método para Salvar o Tema
  saveTheme(themeData: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/themes', themeData);
  }

  // Novo método para buscar o histórico
  getSavedThemes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/themes');
  }

  exportPdf(themeId: number): Observable<Blob> {
    // Usamos responseType: 'blob' para arquivos
    return this.http.get(`http://localhost:8080/themes/${themeId}/export-pdf`, { responseType: 'blob' });
  }

  exportPdfPreview(themeData: any): Observable<Blob> {
    // Usamos POST e enviamos os dados no corpo da requisição
    return this.http.post(`http://localhost:8080/themes/export-pdf-preview`, themeData, { responseType: 'blob' });
  }
  
}