import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoteriasService } from '../../services/loterias.service';
import { DebugService } from '../../config/debug.service';
import { DadosNumero, DadosParidade, DadosRepeticao } from '../../interfaces/lotofacil';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lotofacil',
  imports:[
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatTableModule,
    MatButtonToggleModule,
    MatSortModule
  ],
  templateUrl: './lotofacil.component.html',
  styleUrls: ['./lotofacil.component.scss']
})
export class LotofacilComponent implements OnInit {

  // Atributos
  private _liveAnnouncer = inject(LiveAnnouncer);
  subscription!: Subscription;
  
  totalNumberLotofacilContest: number | undefined;

  paritiesData: DadosParidade[] = [];
  repetitionsData: DadosRepeticao[] = [];
  numbersData: DadosNumero[] = [];

  displayedColumnsParity: string[] = ['paridade', 'qtd', 'porcentagem'];
  displayedColumnsRepetition: string[] = ['repetido', 'qtd', 'porcentagem'];
  displayedColumnsNumber: string[] = ['id', 'qtd', 'porcentagem'];

  dataSourceParity: any;
  dataSourceRepetition: any;
  dataSourceNumber: any;
  
  @ViewChild('sortParity') sortParity!: MatSort;
  @ViewChild('sortRepetition') sortRepetition!: MatSort;
  @ViewChild('sortNumber') sortNumber!: MatSort;

  // --- Propriedades do Componente ---
  jogoConsultado: string = '';
  
  // Opções para os filtros de geração
  repeticaoSelecionada: string = 'N/D';
  paridadeSelecionada: string = 'N/D';

  selectedOption = 'angular'; // valor inicial

  constructor(
    private service: LoteriasService,
    private debugService: DebugService,
  ) { }

  ngOnInit(): void{
    this.loadGeneralData();
    this.loadTablesData();
  }

  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadTablesData() {
    this.loadDataRepetitions();
    this.loadDataParities();
    this.loadDataNumbers();
  }

  loadGeneralData() {
    this.subscription = this.service.getLastContestLotofacilRegistered().subscribe({ // 'O this.subscription =' é boas práticas, não obrigatório
      next: (lastContest) => {
        this.debugService.log('Valor do ultimo concursoo', lastContest);
        this.totalNumberLotofacilContest = lastContest;
      }
    });
  }
  
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  // MODIFICAÇÃO 2: Mover a lógica para uma função separada (boa prática)
  loadDataParities(): void {
    this.subscription = this.service.getAllParities().subscribe({ // 'O this.subscription =' é boas práticas, não obrigatório
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.paritiesData = dadosDaApi.map(item => {
          return {
            id: item.id,
            paridade: item.paridade, // de 'paridade' para 'item'
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSourceParity = new MatTableDataSource(this.paritiesData);
        this.dataSourceParity.sort = this.sortParity;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.paritiesData);

      },
      error: (erro) => {
        console.error('Erro ao buscar totais de paridade:', erro);
        // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
      }
    });
  }

  loadDataRepetitions(): void {
    this.subscription = this.service.getAllRepetitions().subscribe({ // 'O this.subscription =' é boas práticas, não obrigatório
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.repetitionsData = dadosDaApi.map(item => {
          return {
            id: item.id,
            repetido: item.repetido, // de 'paridade' para 'item'
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSourceRepetition = new MatTableDataSource(this.repetitionsData);
        this.dataSourceRepetition.sort = this.sortRepetition;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.repetitionsData);

      },
      error: (erro) => {
        console.error('Erro ao buscar totais de paridade:', erro);
        // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
      }
    });
  }

  loadDataNumbers(): void {
    this.subscription = this.service.getAllNumbers().subscribe({ // 'O this.subscription =' é boas práticas, não obrigatório
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.numbersData = dadosDaApi.map(item => {
          return {
            id: item.id,
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSourceNumber = new MatTableDataSource(this.numbersData);
        this.dataSourceNumber.sort = this.sortNumber;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.numbersData);

      },
      error: (erro) => {
        console.error('Erro ao buscar totais de paridade:', erro);
        // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
      }
    });
  }

  // --- Métodos (placeholders) ---
  consultarJogo(): void {
    console.log('Consultando jogo:', this.jogoConsultado);
  }

  adicionarJogo(): void {
    console.log('Botão Adicionar clicado');
  }

  sincronizarJogos(): void {
    console.log('Botão Sincronizar clicado');
  }

  gerarJogo(): void {
    console.log('Gerando jogo com as opções:', this.repeticaoSelecionada, this.paridadeSelecionada);
  }
}