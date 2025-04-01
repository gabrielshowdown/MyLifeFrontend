import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DebugService } from './debug.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Lotofacil } from '../interfaces/lotofacil';

@Injectable({
  providedIn: 'root'
})
export class LoteriasService {

  private readonly API_LOTOFACIL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';

    constructor(private http: HttpClient, private debugService: DebugService,) { }

    // Retorna todos os usuários cadastrados
    getConcurso(conc : number): Observable<Lotofacil> {
      //const paramertros = new HttpParams().append('','300')
      //return this.http.get<any[]>(this.API_LOTOFACIL , {params : paramertros});
      // geraria uma URL https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/?=300
      return this.http.get<Lotofacil>(this.API_LOTOFACIL + conc );
    }

    validateLogin(credentials: { username: string; senha: string }): Observable<boolean> {
      this.debugService.log('credentials:' , credentials);

      return this.http.post<boolean>(`${this.API_LOTOFACIL}/validate`, credentials);
    }

    registerUser(user: User): Observable<User>{
      this.debugService.log('user: ', user);
      return this.http.post<User>(`${this.API_LOTOFACIL}`, user);
    }

}
