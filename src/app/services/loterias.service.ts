import { Concurso } from '../interfaces/loterias';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DebugService } from '../config/debug.service';
import { map, Observable, tap } from 'rxjs';
import { DadosNumero, DadosParidade, DadosRepeticao } from '../interfaces/lotofacil';

@Injectable({
  providedIn: 'root'
})
export class LoteriasService {

  private readonly API_LOTOFACIL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';
  private readonly API_TOTALPARIDADES = 'http://localhost:8080/totaisParidadesLotofacil';
  private readonly API_TOTALREPETICOES = 'http://localhost:8080/totaisRepeticoesLotofacil';
  private readonly API_TOTALNUMEROS = 'http://localhost:8080/totaisNumerosLotofacil';

    constructor(private http: HttpClient, private debugService: DebugService,) { }

    // Obtem todo o retorno da API
    getConcursoLotofacil(conc : number): Observable<Concurso> {
      //const paramertros = new HttpParams().append('','300')
      //return this.http.get<any[]>(this.API_LOTOFACIL , {params : paramertros});
      // geraria uma URL https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/?=300
      return this.http.get<Concurso>(this.API_LOTOFACIL + conc )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          //map(resultado => resultado.localSorteio), // Usado para transformação
          tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

    // Transforma toda a resposta da API em um array de string com as dezenas
    getDezenasLotofacil(conc : number): Observable<string[]> {
      return this.http.get<Concurso>(this.API_LOTOFACIL + conc )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          map(resultado => resultado.listaDezenas), // Usado para transformação
          tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

    getTotalParidades(): Observable<DadosParidade[]> {
      console.log('getTotalParidade');
      
      return this.http.get<DadosParidade[]>(this.API_TOTALPARIDADES )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          // map(resultado => resultado.listaDezenas), // Usado para transformação
           tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

    getTotalRepeticoes(): Observable<DadosRepeticao[]> { 
      return this.http.get<DadosRepeticao[]>(this.API_TOTALREPETICOES )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          // map(resultado => resultado.listaDezenas), // Usado para transformação
           tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }

    getTotalNumeros(): Observable<DadosNumero[]> {  
      return this.http.get<DadosNumero[]>(this.API_TOTALNUMEROS )
        .pipe(
          tap((retornoAPI) => console.log('Fluxo do tap no service' , retornoAPI)), // Usado para debug
          // map(resultado => resultado.listaDezenas), // Usado para transformação
           tap(resultado => console.log('Fluxo do tap após o map no service' , resultado))
        )
    }
}
