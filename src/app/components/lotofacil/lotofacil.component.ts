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
import { ConcursoDetalhado, DadosNumero, DadosParidade, DadosRepeticao, GenerateContestRequest, ModalData, SynchronizeResponse } from '../../interfaces/lotofacil';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { shownStateTrigger } from '../../animations/animations';
import { ConcursoModalComponent } from '../views/concurso-modal/concurso-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-lotofacil',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,
    MatTableModule,
    MatButtonToggleModule,
    MatSortModule,
    MatDialogModule,
    ConcursoModalComponent
  ],
  templateUrl: './lotofacil.component.html',
  styleUrls: ['./lotofacil.component.scss'],
  animations: [shownStateTrigger]
})
export class LotofacilComponent implements OnInit {

  // Atributos
  private _liveAnnouncer = inject(LiveAnnouncer);
  subscription!: Subscription;
  isSyncing: boolean = false; // Nova flag para feedback visual (spinner)

  totalNumberLotofacilContest: number = 0;
  contestIdConsulted: number = 0;
  showConsultAlert: boolean = false;

  showSyncAlert: boolean = false;
  syncAlertMessage: string = '';
  syncAlertType: 'success' | 'warning' | 'info' | 'danger' = 'info'; // Cores do Bootstrap
  syncAlertIcon: string = 'info_outline';

  paritiesData: DadosParidade[] = [];
  repetitionsData: DadosRepeticao[] = [];
  numbersData: DadosNumero[] = [];

  displayedColumnsParity: string[] = ['paridade', 'qtd', 'porcentagem'];
  displayedColumnsRepetition: string[] = ['repetido', 'qtd', 'porcentagem'];
  displayedColumnsNumber: string[] = ['id', 'qtd', 'porcentagem'];

  dataSourceParity: any;
  dataSourceRepetition: any;
  dataSourceNumber: any;

  informationsLastConc: String = "Última sincronização as 089h"
  lastContestApiCaixa: number = 0;
  dateNextContesCaixa: any;

  showGenerateAlert: boolean = false;
  generateAlertMessage: string = '';

  @ViewChild('sortParity') sortParity!: MatSort;
  @ViewChild('sortRepetition') sortRepetition!: MatSort;
  @ViewChild('sortNumber') sortNumber!: MatSort;

  // Opções para os filtros de geração
  repeticaoSelecionada: string = 'N/D';
  private repeticaoMap: { [key: string]: string | null } = {
    'N/D': '0',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    '11': '11',
    '12': '12'
  };
  paridadeSelecionada: string = 'N/D';
  private paridadeMap: { [key: string]: { impares: string, pares: string } | null } = {
    'N/D': { impares: '0', pares: '0' },
    '4/11': { impares: '4', pares: '11' }, // 4/11
    '5/10': { impares: '5', pares: '10' }, // 5/10
    '6/9': { impares: '6', pares: '9' },  // 6/9
    '7/8': { impares: '7', pares: '8' },  // 7/8
    '8/7': { impares: '8', pares: '7' },  // 8/7
    '9/6': { impares: '9', pares: '6' },  // 9/6
    '10/5': { impares: '10', pares: '6' }, // 10/6 (conforme seu HTML)
    '11/64': { impares: '11', pares: '5' }  // 11/5 (conforme seu HTML)
  };

  selectedOption = 'angular'; // valor inicial

  constructor(
    private service: LoteriasService,
    private debugService: DebugService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadGeneralData();
    this.loadTablesData();
    console.log('this.lastContestApiCaixa dentro do onInit', this.lastContestApiCaixa); // retorna 0 
    console.log('this.totalNumberLotofacilContest dentro do onInit', this.totalNumberLotofacilContest); // retorna 0 
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

  loadGeneralData(syncResponse: SynchronizeResponse | null = null) {
    forkJoin({
      lastLocal: this.service.getLastContestLotofacilRegistered(),
      lastCaixa: this.service.getContestLotofacilCaixa()
    }).subscribe({
      next: ({ lastLocal, lastCaixa }) => {
        this.totalNumberLotofacilContest = lastLocal;
        this.lastContestApiCaixa = lastCaixa.numero;
        this.dateNextContesCaixa = lastCaixa.dataProximoConcurso;

        console.log('Valores carregados:');
        console.log('totalNumberLotofacilContest', this.totalNumberLotofacilContest);
        console.log('lastContestApiCaixa', this.lastContestApiCaixa);

        if (this.lastContestApiCaixa > this.totalNumberLotofacilContest) {
          /** Há concursos para sincronizar */
          const diff = this.lastContestApiCaixa - this.totalNumberLotofacilContest;

          if (syncResponse && syncResponse.totContestSyncronized > 0) {
            // *** Cenário 3 (INFO) ***
            this.syncAlertMessage = `Sincronizados ${syncResponse.totContestSyncronized} concursos! Restam ${diff} concurso(s) para sincronizar. (Último na Caixa: ${this.lastContestApiCaixa})`;
            this.syncAlertType = 'info';
            this.syncAlertIcon = 'check_circle_outline'; // Ícone de Check (conforme solicitado)
          } else {
            // *** Cenário 2 (WARNING) ***
            this.syncAlertMessage = `Existem ${diff} concurso(s) para sincronizar. (Último na Caixa: ${this.lastContestApiCaixa})`;
            this.syncAlertType = 'warning';
            this.syncAlertIcon = 'warning_amber'; // Ícone de Aviso
          }
          this.showSyncAlert = true;

        } else {
          // Base está 100% atualizada

          if (syncResponse && syncResponse.totContestSyncronized > 0) {
            // *** Cenário 4 (SUCCESS) ***
            const dataFormatada = syncResponse.dateNextContest
              ? new Date(syncResponse.dateNextContest).toLocaleDateString('pt-BR')
              : 'N/D';
            this.syncAlertMessage = `Sincronizados com sucesso! Próximo concurso: ${this.dateNextContesCaixa}`;
            this.syncAlertType = 'success';
            this.syncAlertIcon = 'check_circle_outline'; // Ícone de Check
          } else {
            // *** Cenário 5 (INFO) ***
            this.syncAlertMessage = `Concursos Sincronizados. Próximo concurso: ${this.dateNextContesCaixa}`;
            this.syncAlertType = 'info';
            this.syncAlertIcon = 'check_circle_outline'; // Ícone de Check (conforme solicitado)
          }
          this.showSyncAlert = true;
        }
      },
      error: (err) => {
        // *** Cenário 1 (DANGER) ***
        console.error('Erro ao buscar dados gerais (Caixa ou Local):', err);
        this.syncAlertMessage = 'Erro ao se comunicar com a API da Caixa.';
        this.syncAlertType = 'danger';
        this.syncAlertIcon = 'error_outline'; // Ícone de Erro
        this.showSyncAlert = true;
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
  consultContest() {
    // ATUALIZADO: Usa showConsultAlert
    this.showConsultAlert = false;

    if (!this.contestIdConsulted || this.contestIdConsulted <= 0) {
      return;
    }

    if (this.contestIdConsulted > this.totalNumberLotofacilContest) {
      // ATUALIZADO: Usa showConsultAlert
      this.showConsultAlert = true;
    } else {
      // Lógica para buscar os dados e abrir o modal
      this.service.getContestById(this.contestIdConsulted).subscribe({
        next: (resultadoConcurso: ConcursoDetalhado) => {
          if (resultadoConcurso) {
            this.openConsultaDialog(resultadoConcurso, false);
          } else {
            // ATUALIZADO: Usa showConsultAlert
            this.showConsultAlert = true;
          }
        },
        error: (err) => {
          console.error('Erro ao consultar concurso:', err);
          // ATUALIZADO: Usa showConsultAlert
          this.showConsultAlert = true;
        }
      });
    }
  }

  openConsultaDialog(resultado: ConcursoDetalhado, isGerado: boolean = false): void {

    this.dialog.open(ConcursoModalComponent, {
      width: '450px',
      data: {
        concurso: resultado,
        isGerado: isGerado 
      } as ModalData
    });

  }

  adicionarJogo(): void {
    console.log('Botão Adicionar clicado');
  }

  generateContest(): void {

    this.showGenerateAlert = false;
    
    console.log('Gerando jogo com as opções:', this.repeticaoSelecionada, this.paridadeSelecionada);

    if (this.totalNumberLotofacilContest === 0) {
      console.error('Número do último concurso ainda não carregado. Tente novamente em alguns segundos.');
      // O ideal seria desabilitar o botão 'Gerar Jogo' até totalNumberLotofacilContest > 0
      return;
    }

    // 1. Obter os valores dos filtros usando os mapas
    const repetidos = this.repeticaoMap[this.repeticaoSelecionada];
    const paridade = this.paridadeMap[this.paridadeSelecionada];

    console.log('repetidos ', repetidos);
    console.log('paridade ', paridade);

    // 2. Montar o body da requisição
    const requestBody: GenerateContestRequest = {
      concursoAnteriorId: this.totalNumberLotofacilContest.toString(),
      qtdRepetidos: repetidos,
      qtdImpares: paridade ? paridade.impares : null,
      qtdPares: paridade ? paridade.pares : null
    };

    this.subscription = this.service.generateContest(requestBody).subscribe({
      next: (resultadoConcurso: ConcursoDetalhado) => {
        this.debugService.log('Jogo gerado com sucesso:', resultadoConcurso);

        if (resultadoConcurso) {
          this.openConsultaDialog(resultadoConcurso, true); // MODIFICADO: Passar o objeto inteiro
        }
      },
      error: (err) => {
        console.error('Erro ao gerar jogo:', err);
        // ESTA É A LÓGICA PRINCIPAL DE TRATAMENTO DO ERRO
        if (err.status === 422 && err.error && err.error.message) {
          // Captura a mensagem específica do backend
          this.generateAlertMessage = err.error.message.replace('Parâmetros inválidos ', '');
        } else {
          // Fallback para outros tipos de erro (ex: 500, rede)
          this.generateAlertMessage = 'Erro inesperado ao gerar o jogo. Tente novamente.';
        }
        // Ativa a exibição do alerta
        this.showGenerateAlert = true;
      }
    });
  }

  synchronizeContests(): void {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.showSyncAlert = false;
    this.debugService.log('Iniciando sincronização...');

    this.subscription = this.service.synchronizeDatabase().subscribe({
      next: (response) => {
        this.showGenerateAlert = false;
        this.isSyncing = false;
        this.debugService.log('Sincronização concluída:', response);

        // CRUCIAL: Apenas recarregamos os dados, passando o 'response'
        // O loadGeneralData agora tem a inteligência para definir o alerta correto.
        this.loadGeneralData(response); // <-- A MUDANÇA-CHAVE
        this.loadTablesData();
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Erro ao sincronizar:', err);

        // O feedback de erro permanece o mesmo
        this.syncAlertMessage = 'Erro ao sincronizar. Tente novamente mais tarde.';
        this.syncAlertType = 'danger';
        this.showSyncAlert = true;
      }
    });
  }
}