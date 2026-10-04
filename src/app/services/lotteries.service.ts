import { CaixaDraw } from '../interfaces/loterias';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DebugService } from '../core/services/debug.service';
import { map, Observable, tap } from 'rxjs';
import { NumberData, ParityData, RepetitionData, DetailedDraw, GenerateDrawRequest as GenerateDrawRequest, SynchronizeResponse, AddDrawRequest, Page, SaveBetRequest, LotofacilBet, BetSummaryResponse, BetGraphicsResponse } from '../interfaces/lotofacil';

@Injectable({
  providedIn: 'root'
})
export class LotteriesService {

  private readonly API_LOTOFACIL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';
  private readonly API_TOTALPARIDADES = 'http://localhost:8080/lotofacilTotalsParities';
  private readonly API_TOTALREPETICOES = 'http://localhost:8080/lotofacilTotalsRepetitions';
  private readonly API_TOTALNUMEROS = 'http://localhost:8080/lotofacilTotalsNumbers';
  private readonly API_TOTALCONCURSOS = 'http://localhost:8080/lotofacilDraw';
  private readonly API_TOTALNUMEROSCONCURSO = 'http://localhost:8080/lotofacilDrawNumber/concurso';
  private readonly API_APOSTALOTOFACIL = 'http://localhost:8080/lotofacilBet';

  constructor(private http: HttpClient, private debugService: DebugService,) { }

  /* Busca na API da caixa, quando não é passado o número na URL, retorna o último */
  getDrawLotofacilCaixa(draw?: number): Observable<CaixaDraw> {
    const url = (draw !== undefined) ? this.API_LOTOFACIL + draw : this.API_LOTOFACIL;
    return this.http.get<CaixaDraw>(url)
      .pipe(
        tap((apiReturn) => this.debugService.log('Fluxo do tap no service', apiReturn)), /* Usado para debug */
        /* map(result => result.localSorteio), *//* Usado para transformação */
        tap(result => this.debugService.log('Fluxo do tap após o map no service', result))
      )
  }

  /* Transforma toda a resposta da API em um array de string com as dezenas */
  getDozensLotofacil(draw: number): Observable<string[]> {
    return this.http.get<CaixaDraw>(this.API_LOTOFACIL + draw)
      .pipe(
        tap((apiReturn) => this.debugService.log('Fluxo do tap no service', apiReturn)), /* Usado para debug */
        map(result => result.listaDezenas), /* Usado para transformação */
        tap(result => this.debugService.log('Fluxo do tap após o map no service', result))
      )
  }

  getAllParities(): Observable<ParityData[]> {
    return this.http.get<ParityData[]>(this.API_TOTALPARIDADES);
  }

  getAllRepetitions(): Observable<RepetitionData[]> {
    return this.http.get<RepetitionData[]>(this.API_TOTALREPETICOES);
  }

  getAllNumbers(): Observable<NumberData[]> {
    return this.http.get<NumberData[]>(this.API_TOTALNUMEROS);
  }

  getLastDrawLotofacilRegistered(): Observable<number> {
    return this.http.get<number>(`${this.API_TOTALCONCURSOS}/lastId`);
  }

  getDrawById(id: number): Observable<DetailedDraw> {
    /* A URL final será: http://localhost:8080/concursoLotofacil/3000 */
    return this.http.get<DetailedDraw>(`${this.API_TOTALCONCURSOS}/${id}`);
  }

  generateDraw(request: GenerateDrawRequest): Observable<DetailedDraw> {
    return this.http.post<DetailedDraw>(`${this.API_TOTALCONCURSOS}/generate`, request);
  }

  synchronizeDatabase(): Observable<SynchronizeResponse> {
    /* Usa o POST para uma ação que modifica o estado do servidor */
    return this.http.post<SynchronizeResponse>(`${this.API_TOTALCONCURSOS}/synchronize`, {});
  }

  addDrawManually(request: AddDrawRequest): Observable<DetailedDraw> {
    return this.http.post<DetailedDraw>(`${this.API_TOTALCONCURSOS}/insert`, request);
  }

  getDrawsPaginated(page: number, size: number): Observable<Page<DetailedDraw>> {
    /* O Spring Pageable usa query params: ?page=0&size=4&sort=id,desc */
    /* Como foi definido o default no backend, basta mandar page e size */
    return this.http.get<Page<DetailedDraw>>(`${this.API_TOTALCONCURSOS}/paginated?page=${page}&size=${size}`);
  }

  saveGeneratedBet(request: SaveBetRequest): Observable<any> {
    /* Usamos POST pois estamos criando um registro de aposta no banco */
    return this.http.post<any>(`${this.API_APOSTALOTOFACIL}/insert`, request);
  }

  getAllBets(): Observable<LotofacilBet[]> {
    return this.http.get<LotofacilBet[]>(this.API_APOSTALOTOFACIL);
  }

  getBetSummary(): Observable<BetSummaryResponse> {
    return this.http.get<BetSummaryResponse>(`${this.API_APOSTALOTOFACIL}/summary`);
  }

  getBetsPaginated(page: number, size: number): Observable<Page<LotofacilBet>> {
    /* O Spring Pageable usa query params: ?page=0&size=4&sort=id,desc */
    /* Como foi definido o default no backend, basta mandar page e size */
    return this.http.get<Page<LotofacilBet>>(`${this.API_APOSTALOTOFACIL}/paginated?page=${page}&size=${size}`);
  }

  getGraphicsData(): Observable<BetGraphicsResponse> {
    return this.http.get<BetGraphicsResponse>(`${this.API_APOSTALOTOFACIL}/graphics`);
  }

  exportBetsToExcel(): Observable<Blob> {
    return this.http.get(`${this.API_APOSTALOTOFACIL}/export`, {
      responseType: 'blob' /* Fundamental para não corromper o arquivo */
    });
  }
  
}
