import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookBible, ThemeHistory, ThemeSummary } from '../interfaces/community';

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
    /* O Spring Boot com @RequestBody Enum espera que a string venha entre aspas duplas no JSON */
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.put<BookBible>(`${this.API_BOOKS}/${id}/category`, `"${newCategory}"`, { headers });
  }

  saveTheme(themeData: any): Observable<any> {
    return this.http.post<any>(this.API_THEMES, themeData);
  }

  getSavedThemes(): Observable<ThemeHistory[]> {
    return this.http.get<ThemeHistory[]>(this.API_THEMES);
  }

  getSavedThemesSummary(): Observable<ThemeSummary[]> {
    return this.http.get<ThemeSummary[]>(`${this.API_THEMES}/summary`);
  }

  getThemeById(id: number): Observable<ThemeHistory> {
    return this.http.get<ThemeHistory>(`${this.API_THEMES}/${id}`);
  }

  /* Exportação de PDFs, talvez juntar no futuro, usam responseType: 'blob' para arquivos */
  exportPdf(themeId: number): Observable<Blob> {
    return this.http.get(`${this.API_THEMES}/${themeId}/export-pdf`, { responseType: 'blob' });
  }

  exportPdfPreview(themeData: any): Observable<Blob> {
    /* Como não há registro no banco, usa o POST e envia os dados no corpo da requisição */
    return this.http.post(`${this.API_THEMES}/export-pdf-preview`, themeData, { responseType: 'blob' });
  }
  
}