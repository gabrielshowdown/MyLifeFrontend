import { Concurso } from '../interfaces/loterias';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DebugService } from '../core/services/debug.service';
import { map, Observable, tap } from 'rxjs';
import { DadosNumero, DadosParidade, DadosRepeticao, DetailedDraw, GenerateDrawRequest as GenerateDrawRequest, SynchronizeResponse, AddDrawRequest, Page } from '../interfaces/lotofacil';

@Injectable({
  providedIn: 'root'
})
export class LoteriasService {

  private readonly API_LOTOFACIL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';
  private readonly API_TOTALPARIDADES = 'http://localhost:8080/lotofacilTotalsParity';
  private readonly API_TOTALREPETICOES = 'http://localhost:8080/totaisRepeticoesLotofacil';
  private readonly API_TOTALNUMEROS = 'http://localhost:8080/totaisNumerosLotofacil';
  private readonly API_TOTALCONCURSOS = 'http://localhost:8080/concursoLotofacil';
  private readonly API_TOTALNUMEROSCONCURSO = 'http://localhost:8080/numeroConcursoLotofacil/concurso';

  constructor(private http: HttpClient, private debugService: DebugService,) { }

  // Obtem todo o retorno da API
  getContestLotofacilCaixa(conc?: number): Observable<Concurso> {
    //const paramertros = new HttpParams().append('','300')
    //return this.http.get<any[]>(this.API_LOTOFACIL , {params : paramertros});
    // geraria uma URL https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/?=300
    const url = conc !== undefined ? this.API_LOTOFACIL + conc : this.API_LOTOFACIL;
    return this.http.get<Concurso>(url)
      .pipe(
        tap((retornoAPI) => console.log('Fluxo do tap no service', retornoAPI)), // Usado para debug
        //map(resultado => resultado.localSorteio), // Usado para transformação
        tap(resultado => console.log('Fluxo do tap após o map no service', resultado))
      )
  }

  // Transforma toda a resposta da API em um array de string com as dezenas
  getDezenasLotofacil(conc: number): Observable<string[]> {
    return this.http.get<Concurso>(this.API_LOTOFACIL + conc)
      .pipe(
        tap((retornoAPI) => console.log('Fluxo do tap no service', retornoAPI)), // Usado para debug
        map(resultado => resultado.listaDezenas), // Usado para transformação
        tap(resultado => console.log('Fluxo do tap após o map no service', resultado))
      )
  }

  getAllParities(): Observable<DadosParidade[]> {
    console.log('getTotalParidade');

    return this.http.get<DadosParidade[]>(this.API_TOTALPARIDADES)
      .pipe(
        tap((retornoAPI) => console.log('Fluxo do tap no service', retornoAPI)), // Usado para debug
        // map(resultado => resultado.listaDezenas), // Usado para transformação
        tap(resultado => console.log('Fluxo do tap após o map no service', resultado))
      )
  }

  getAllRepetitions(): Observable<DadosRepeticao[]> {
    return this.http.get<DadosRepeticao[]>(this.API_TOTALREPETICOES)
      .pipe(
        tap((retornoAPI) => console.log('Fluxo do tap no service', retornoAPI)), // Usado para debug
        // map(resultado => resultado.listaDezenas), // Usado para transformação
        tap(resultado => console.log('Fluxo do tap após o map no service', resultado))
      )
  }

  getAllNumbers(): Observable<DadosNumero[]> {
    return this.http.get<DadosNumero[]>(this.API_TOTALNUMEROS)
      .pipe(
        tap((retornoAPI) => console.log('Fluxo do tap no service', retornoAPI)), // Usado para debug
        // map(resultado => resultado.listaDezenas), // Usado para transformação
        tap(resultado => console.log('Fluxo do tap após o map no service', resultado))
      )
  }

  getLastContestLotofacilRegistered(): Observable<number> {
    return this.http.get<DetailedDraw[]>(this.API_TOTALCONCURSOS).pipe(
      map(contests => {
        if (contests.length === 0) {
          throw new Error('Nenhum concurso encontrado');
        }
        const lastContests = contests[contests.length - 1];
        console.log('ultimo iddd: ', lastContests.id);

        return lastContests.id;
      })
    );
  }

  getContestById(id: number): Observable<DetailedDraw> {
    // A URL final será: http://localhost:8080/concursoLotofacil/3000
    return this.http.get<DetailedDraw>(`${this.API_TOTALCONCURSOS}/${id}`);
  }

  generateDraw(request: GenerateDrawRequest): Observable<DetailedDraw> {
    return this.http.post<DetailedDraw>(`${this.API_TOTALCONCURSOS}/generate`, request);
  }

  synchronizeDatabase(): Observable<SynchronizeResponse> {
    // Usamos POST para uma ação que modifica o estado do servidor
    // O { responseType: 'text' } é crucial porque o backend retorna uma string, não um JSON
    return this.http.post<SynchronizeResponse>(`${this.API_TOTALCONCURSOS}/synchronize`, {});
  }

  addDrawManually(request: AddDrawRequest): Observable<DetailedDraw> {
    // Assumindo que o backend tenha um endpoint "manual" para isso
    return this.http.post<DetailedDraw>(`${this.API_TOTALCONCURSOS}/insert`, request);
  }

  getContestsPaginated(page: number, size: number): Observable<Page<DetailedDraw>> {
    // O Spring Pageable usa query params: ?page=0&size=4&sort=id,desc
    // Como definimos o default no backend, basta mandar page e size
    return this.http.get<Page<DetailedDraw>>(`${this.API_TOTALCONCURSOS}/paginated?page=${page}&size=${size}`);
  }
}
