import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DebugService } from '../../core/services/debug.service';
import { LoteriasService } from '../../services/loterias.service';
import { Subscription } from 'rxjs';
import { Concurso, LotteryDrawSummary } from '../../interfaces/loterias';
import { Router } from '@angular/router';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DadosParidade } from '../../interfaces/lotofacil';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface DadosParidade1 {
  id: number;
  paridade1: string;
  qtd: number;
  porcentagem: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

const ELEMENT_DATA2: DadosParidade1[] = [
  {id: 1, paridade1: '13I/02P', porcentagem: 0.0, qtd: 0},
  {id: 2, paridade1: '12I/03P', porcentagem: 0.09, qtd: 3},
  {id: 3, paridade1: '11I/04P', porcentagem: 7.1, qtd: 5},
  {id: 4, paridade1: '10I/05P', porcentagem: 20.65, qtd: 80},
  {id: 5, paridade1: '09I/06P', porcentagem: 11.09, qtd: 20},
];

@Component({
    selector: 'app-teste',
    imports: [MatIconModule,
        MatSlideToggle,
        MatSlideToggleModule,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatSortModule
    ],
    templateUrl: './teste.component.html',
    styleUrl: './teste.component.scss'
})

export class TesteComponent implements OnDestroy, AfterViewInit {

  private _liveAnnouncer = inject(LiveAnnouncer);
  totaisParidades: DadosParidade[] = [];

  estatisticasParidade: DadosParidade[] = [
      {id: 1, paridade: 'aa', porcentagem: 0.2, qtd: 2},
      {id: 2, paridade: 'ac', porcentagem: 0.1, qtd: 2},
      {id: 3, paridade: 'ab', porcentagem: 0.6, qtd: 2},
  ];

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  displayedColumns2: string[] = ['paridade1', 'porcentagem', 'qtd'];
  displayedColumns3: string[] = ['paridade', 'porcentagem', 'qtd'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  dataSource2 = new MatTableDataSource(ELEMENT_DATA2);
  dataSource3: any;

  //@ViewChild(MatSort) sort1!: MatSort;
  //@ViewChild(MatSort) sort1!: MatSort;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;
  @ViewChild('sort3') sort3!: MatSort;
  
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  constructor(
    private debugService: DebugService,
    private service: LoteriasService,
    private router: Router,
  ) {
    console.log('construtor iniciado');
    
  }

  subscription!: Subscription;
  color = 'red'

  //https://stackoverflow.com/questions/62549139/it-is-possible-change-angular-material-mat-slide-toggle-icon
  @ViewChild('darkModeSwitch', { read: ElementRef }) element: ElementRef | undefined;

  sun = 'M12 15.5q1.45 0 2.475-1.025Q15.5 13.45 15.5 12q0-1.45-1.025-2.475Q13.45 8.5 12 8.5q-1.45 0-2.475 1.025Q8.5 10.55 8.5 12q0 1.45 1.025 2.475Q10.55 15.5 12 15.5Zm0 1.5q-2.075 0-3.537-1.463T7 12q0-2.075 1.463-3.537T12 7q2.075 0 3.537 1.463T17 12q0 2.075-1.463 3.537T12 17ZM1.75 12.75q-.325 0-.538-.213Q1 12.325 1 12q0-.325.212-.537Q1.425 11.25 1.75 11.25h2.5q.325 0 .537.213Q5 11.675 5 12q0 .325-.213.537-.213.213-.537.213Zm18 0q-.325 0-.538-.213Q19 12.325 19 12q0-.325.212-.537.212-.213.538-.213h2.5q.325 0 .538.213Q23 11.675 23 12q0 .325-.212.537-.212.213-.538.213ZM12 5q-.325 0-.537-.213Q11.25 4.575 11.25 4.25v-2.5q0-.325.213-.538Q11.675 1 12 1q.325 0 .537.212 .213.212 .213.538v2.5q0 .325-.213.537Q12.325 5 12 5Zm0 18q-.325 0-.537-.212-.213-.212-.213-.538v-2.5q0-.325.213-.538Q11.675 19 12 19q.325 0 .537.212 .213.212 .213.538v2.5q0 .325-.213.538Q12.325 23 12 23ZM6 7.05l-1.425-1.4q-.225-.225-.213-.537.013-.312.213-.537.225-.225.537-.225t.537.225L7.05 6q.2.225 .2.525 0 .3-.2.5-.2.225-.513.225-.312 0-.537-.2Zm12.35 12.375L16.95 18q-.2-.225-.2-.538t.225-.512q.2-.225.5-.225t.525.225l1.425 1.4q.225.225 .212.538-.012.313-.212.538-.225.225-.538.225t-.538-.225ZM16.95 7.05q-.225-.225-.225-.525 0-.3.225-.525l1.4-1.425q.225-.225.538-.213.313 .013.538 .213.225 .225.225 .537t-.225.537L18 7.05q-.2.2-.512.2-.312 0-.538-.2ZM4.575 19.425q-.225-.225-.225-.538t.225-.538L6 16.95q.225-.225.525-.225.3 0 .525.225 .225.225 .225.525 0 .3-.225.525l-1.4 1.425q-.225.225-.537.212-.312-.012-.537-.212ZM12 12Z'
  moon ='M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.2 0 .425.013 .225.013 .575.038-.9.8-1.4 1.975-.5 1.175-.5 2.475 0 2.25 1.575 3.825Q14.25 12.9 16.5 12.9q1.3 0 2.475-.463T20.95 11.15q.025.3 .038.488Q21 11.825 21 12q0 3.75-2.625 6.375T12 21Zm0-1.5q2.725 0 4.75-1.687t2.525-3.963q-.625.275-1.337.412Q17.225 14.4 16.5 14.4q-2.875 0-4.887-2.013T9.6 7.5q0-.6.125-1.287.125-.687.45-1.562-2.45.675-4.062 2.738Q4.5 9.45 4.5 12q0 3.125 2.188 5.313T12 19.5Zm-.1-7.425Z'

  ngAfterViewInit() {
    if (this.element){
      this.element.nativeElement.querySelector('.mdc-switch__icon--on').firstChild.setAttribute('d', this.moon);
      this.element.nativeElement.querySelector('.mdc-switch__icon--off').firstChild.setAttribute('d', this.sun);
      this.dataSource.sort = this.sort1;
      this.dataSource2.sort = this.sort2;
      
    }
  }

  textoTeste: string = 'teste';

  ngOnInit(): void {
    this.debugService.log('LoginComponent inicializado');
    this.numConcurso = 3000;
    this.carregarEstatisticasParidade();
  }

  numConcurso: any;

  concursoLotofacil!: LotteryDrawSummary;

  carregarEstatisticasParidade(): void {
    this.service.getAllParities().subscribe({
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.estatisticasParidade = dadosDaApi.map(item => {
          return {
            id: item.id,
            paridade: item.paridade, // de 'paridade' para 'item'
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSource3 = new MatTableDataSource(this.estatisticasParidade);
        this.dataSource3.sort = this.sort3;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.estatisticasParidade);

      },
      error: (erro) => {
        console.error('Erro ao buscar totais de paridade:', erro);
        // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
      }
    });
  }

  concursoParaConcursoResumo(concurso: Concurso){
    this.concursoLotofacil = {
      numero:  concurso.numero,
      numeroConcursoAnterior: concurso.numeroConcursoAnterior,
      numeroConcursoProximo: concurso.numeroConcursoProximo,
      dataApuracao: concurso.dataApuracao,
      dataProximoConcurso: concurso.dataProximoConcurso,
      tipoJogo: concurso.tipoJogo,
      listaDezenas: concurso.listaDezenas,
      localSorteio: concurso.localSorteio,
    }
  }

  buscar(): void {
    this.subscription = this.service.getContestLotofacilCaixa(this.numConcurso)
    .subscribe({
      next: concurso => {
        //this.debugService.log(users); // Manipulação de sucesso
        console.log('Resultado no componente ' , concurso);
        this.concursoParaConcursoResumo(concurso);
        console.log('concursoLotofacil:' , this.concursoLotofacil);

      },
      error: (error) => {
        console.error('Erro ao buscar lotofácil:', error); // Manipulação de erro
      },
      complete: () => {
        this.debugService.log('Busca de lotofácil concluída.'); // (Opcional) Finalização do Observable
      }
    });
  }

  buscarDezenas(): void {
    this.subscription = this.service.getDezenasLotofacil(this.numConcurso)
    .subscribe({
      next: concurso => {
        //this.debugService.log(users); // Manipulação de sucesso
        console.log('Resultado no componente ' , concurso);

      },
      error: (error) => {
        console.error('Erro ao buscar lotofácil:', error); // Manipulação de erro
      },
      complete: () => {
        this.debugService.log('Busca de lotofácil concluída.'); // (Opcional) Finalização do Observable
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  goScreenLotofacil(): void{
    this.router.navigate(['/lotofacil']);
  }

}
