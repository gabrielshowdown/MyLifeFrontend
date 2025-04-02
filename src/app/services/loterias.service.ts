import { ConcursoLotofacil, Lotofacil } from './../interfaces/lotofacil';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DebugService } from './debug.service';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoteriasService {

  private readonly API_LOTOFACIL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';

    constructor(private http: HttpClient, private debugService: DebugService,) { }

    // Obtem todo o retorno da API
    getConcursoLotofacil(conc : number): Observable<Lotofacil> {
      //const paramertros = new HttpParams().append('','300')
      //return this.http.get<any[]>(this.API_LOTOFACIL , {params : paramertros});
      // geraria uma URL https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/?=300
      return this.http.get<Lotofacil>(this.API_LOTOFACIL + conc )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          //map(resultado => resultado.localSorteio), // Usado para transformação
          tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

    // Transforma toda a resposta da API em um array de string com as dezenas
    getDezenasLotofacil(conc : number): Observable<string[]> {
      return this.http.get<Lotofacil>(this.API_LOTOFACIL + conc )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          map(resultado => resultado.listaDezenas), // Usado para transformação
          tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

}
