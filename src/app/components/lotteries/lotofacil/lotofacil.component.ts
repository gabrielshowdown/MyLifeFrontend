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
import { AddDrawRequest, DetailedDraw, NumberData, ParityData, RepetitionData, GenerateDrawRequest, ModalData, SaveBetRequest, LotofacilBet, StatusContext } from '../../../interfaces/lotofacil';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs'
import { DrawModalComponent } from '../draw-modal/draw-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DrawCardComponent } from '../draw-card/draw-card.component';
import { listAnimation, shownStateTrigger } from '../../../animations/animations';
import { LotteriesService } from '../../../services/lotteries.service';
import { DebugService } from '../../../core/services/debug.service';
import { AddDrawModalComponent } from '../add-draw-modal/add-draw-modal.component';
import { BetModalComponent } from '../bet-modal/bet-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lotofacil',
  imports: [
    CommonModule,
    RouterModule,
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
    DrawCardComponent,
    MatTabsModule
  ],
  templateUrl: './lotofacil.component.html',
  styleUrls: ['./lotofacil.component.scss'],
  animations: [shownStateTrigger, listAnimation]
})
export class LotofacilComponent implements OnInit {

  /* Atributos */
  subscription!: Subscription;
  isSyncing: boolean = false;

  totalNumberLotofacilDraw: number = 0;
  drawIdConsulted: number = 0;
  showConsultAlert: boolean = false;

  /* Controle dos cuncursos mais recentes que serão exibidos */
  recentDraws: DetailedDraw[] = [];
  currentPage: number = 0;
  pageSize: number = 4;
  totalPages: number = 0;

  /* Alertas de Status */
  showSyncAlert: boolean = false;
  syncAlertMessage: string = '';
  syncAlertType: 'success' | 'warning' | 'info' | 'danger' = 'info';
  syncAlertIcon: string = 'info_outline';

  /* Dados das tabelas */
  paritiesData: ParityData[] = [];
  repetitionsData: RepetitionData[] = [];
  numbersData: NumberData[] = [];

  displayedColumnsParity: string[] = ['parity', 'quantity', 'percentage'];
  displayedColumnsRepetition: string[] = ['repeated', 'quantity', 'percentage'];
  displayedColumnsNumber: string[] = ['id', 'quantity', 'percentage'];

  /* Fonte de dados para as tabelas */
  dataSourceParity: any;
  dataSourceRepetition: any;
  dataSourceNumber: any;

  lastDrawApiCaixa: number = 0;
  dateNextDrawCaixa: any;

  /* Alertas de Geração */
  showGenerateAlert: boolean = false;
  generateAlertMessage: string = '';

  totalInvested: number = 0;
  totalReturned: number = 0;
  financialBalance: number = 0;
  totalBetsPlaced: number = 0;
  recentBets: LotofacilBet[] = [];

  /* Referencia para o HTML, para fazer a ordenação das tabelas de totais */
  @ViewChild('sortParity') sortParity!: MatSort;
  @ViewChild('sortRepetition') sortRepetition!: MatSort;
  @ViewChild('sortNumber') sortNumber!: MatSort;

  /* Filtros */
  selectedRepetition: string = 'N/D';
  private repetitionMap: { [key: string]: string | null } = {
    'N/D': '0', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12'
  };

  selectedParity: string = 'N/D';
  private parityMap: { [key: string]: { odd: string, even: string } | null } = {
    'N/D': { odd: '0', even: '0' },
    '4/11': { odd: '4', even: '11' },
    '5/10': { odd: '5', even: '10' },
    '6/9': { odd: '6', even: '9' },
    '7/8': { odd: '7', even: '8' },
    '8/7': { odd: '8', even: '7' },
    '9/6': { odd: '9', even: '6' },
    '10/5': { odd: '10', even: '5' },
    '11/4': { odd: '11', even: '4' }
  };

  constructor(
    private service: LotteriesService,
    private debugService: DebugService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.adjustPageSizeToScreen();
    this.loadTablesData();
    this.loadGeneralData();
    this.loadRecentDraws();
    this.loadBetsReport();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadBetsReport(): void {
      /* Busca os totais gerais */
      this.service.getBetSummary().subscribe({
        next: (summary) => {
          this.totalBetsPlaced = summary.totalBets;
          this.totalInvested = summary.totalInvested;
          this.totalReturned = summary.totalReturn;
          this.financialBalance = summary.balance;
        },
        error: (err) => console.error('Erro ao carregar resumo', err)
      })
    ;

    /* Busca apenas as 3 últimas apostas paginadas para a tabelinha inicial de Desempenho de Apostas */
      this.service.getBetsPaginated(0, 3).subscribe({
        next: (page) => {
          this.recentBets = page.content;
        },
        error: (err) => console.error('Erro ao carregar apostas recentes', err)      
      })
    ;
    this.debugService.log('this.recentBets: ' + this.recentBets);
}

  loadTablesData() {
    this.loadDataRepetitions();
    this.loadDataParities();
    this.loadDataNumbers();
  }

  /* Método que atualiza a quantidade de cards de concurso ao mudar de monitor/dimunir/aumentar a tela */
  /*
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const oldSize = this.pageSize;
    
    // Recalcula o tamanho ideal
    this.adjustPageSizeToScreen();

    // Só recarrega se o tamanho da página TIVER MUDADO (de 4 para 6 ou vice-versa)
    // para evitar chamadas desnecessárias na API a cada pixel movido.
    if (this.pageSize !== oldSize) {
      this.currentPage = 0; // Volta para a primeira página para não quebrar a paginação
      this.loadRecentDraws();
    }
  }
  */

  /* Carrega dados gerais e define a mensagem de status baseada no contexto */
  loadGeneralData(context: StatusContext = {}) {
    let localErrorType: 'NONE' | 'EMPTY' | 'ERROR' = 'NONE';
    let apiError = false;

    forkJoin({
      lastDrawLocal: this.service.getLastDrawLotofacilRegistered().pipe(
        catchError(err => {
          if (err.message === 'Nenhum concurso encontrado' || err.status === 404) {
            localErrorType = 'EMPTY';
          } else {
            localErrorType = 'ERROR';
          }
          return of(null);
        })
      ),
      lastCaixaDraw: this.service.getDrawLotofacilCaixa().pipe(
        catchError(err => {
          apiError = true;
          return of(null);
        })
      )
    }).subscribe({
      next: ({ lastDrawLocal, lastCaixaDraw }) => {
        // Atualiza variáveis de estado
        if (lastDrawLocal !== null) this.totalNumberLotofacilDraw = lastDrawLocal;
        else if (localErrorType === 'EMPTY') this.totalNumberLotofacilDraw = 0;

        if (lastCaixaDraw !== null) {
          this.lastDrawApiCaixa = lastCaixaDraw.numero;
          this.dateNextDrawCaixa = lastCaixaDraw.dataProximoConcurso;
        }

        /* Chama o centralizador de mensagens */
        this.updateDashboardStatus(localErrorType, apiError, context);
      }
    });
  }

  loadRecentDraws(): void {
    this.service.getDrawsPaginated(this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData) => {
          this.recentDraws = pageData.content;
          this.totalPages = pageData.totalPages;

          /* Ordenar as dezenas dentro de cada concurso para visualização correta */
          this.recentDraws.forEach(c => {
            c.drawNumbers.sort((a, b) => a.number - b.number);
          });
        },
        error: (err) => console.error('Erro ao carregar concursos recentes', err)
      });
  }

  /**
   * Verifica a largura da janela.
   * Se for um monitor largo (ex: Full HD esticado ou maior que 1600px),
   * define o tamanho da página para 6 para preencher o grid 3x2.
   */
  adjustPageSizeToScreen(): void {
    /* A largura da tela disponível */
    const screenWidth = window.innerWidth;
    
    /* Vamos usar 1600px como margem de segurança para monitores Wide */
    if (screenWidth >= 1600) {
      this.pageSize = 6;
    } else {
      this.pageSize = 4;
    }
  }

  /* Troca de página de concursos */
  changePage(delta: number): void {
    const nextPage = this.currentPage + delta;

    /* A validação de limites continua a mesma, pois o Backend ainda trata 0 como início e totalPages como fim. */
    if (nextPage >= 0 && nextPage < this.totalPages) {
      this.currentPage = nextPage;
      this.loadRecentDraws();
    }
  }

  /* Lógica centralizada para definir a mensagem, cor e ícone do alerta principal */
  private updateDashboardStatus(
    localErrorType: 'NONE' | 'EMPTY' | 'ERROR',
    apiError: boolean,
    context: StatusContext
  ) {
    const diff = this.lastDrawApiCaixa - this.totalNumberLotofacilDraw;

    /* Erros de Infraestrutura */
    if (localErrorType === 'ERROR') {
      this.setAlert('Erro ao buscar dados locais.', 'danger', 'error_outline');
      return;
    }
    if (apiError) {
      this.setAlert('Erro ao buscar dados da API da Caixa.', 'danger', 'error_outline');
      return;
    }

    /* Banco Local Vazio */
    if (localErrorType === 'EMPTY' || this.totalNumberLotofacilDraw === 0) {
      this.setAlert(
        `Nenhum concurso cadastrado no banco local. (Último na Caixa ${this.lastDrawApiCaixa})`,
        'info',
        'info_outline'
      );
      return;
    }

    /* Se veio de uma adição manual (Prioridade sobre Sync se acabou de acontecer) */
    if (context.manualAddId) {
      if (diff > 0) {
        this.setAlert(
          `Concurso ${context.manualAddId} adicionado manualmente. (Último na caixa ${this.lastDrawApiCaixa})`,
          'warning',
          'warning_amber'
        );
      } else {
        /* Igualou */
        this.setAlert(
          `Concurso ${context.manualAddId} adicionado manualmente, Próximo concurso: ${this.dateNextDrawCaixa}`,
          'success',
          'check_circle_outline'
        );
      }
      return;
    }

    /* Sincronização (Se veio de uma ação de sync) */
    if (context.syncResponse) {
      const syncedCount = context.syncResponse.synchronizedDrawsCount;

      if (syncedCount > 0) {
        /* Caso A: Houve processamento de novos dados */
        if (diff > 0) {
          this.setAlert(
            `Sincronizados ${syncedCount} concursos! Restam ${diff} concurso(s). (Último na Caixa: ${this.lastDrawApiCaixa})`,
            'info',
            'check_circle_outline'
          );
        } else {
          this.setAlert(
            `Sincronizados com sucesso! Próximo concurso: ${this.dateNextDrawCaixa}`,
            'success',
            'check_circle_outline'
          );
        }
      } else {
        /* Caso B: Não houve novos dados (syncedCount === 0) */
        if (diff === 0) {
          this.setAlert(
            `Concursos Sincronizados. Próximo concurso: ${this.dateNextDrawCaixa}`,
            'info',
            'check_circle_outline'
          );
        } else {
          /* Raro: sync retornou 0 mas ainda existe diferença (ex: erro silencioso no back ou gap de dados) */
          this.setAlert(
            `Sincronização finalizada sem novos registros. Faltam ${diff} concursos.`,
            'warning',
            'warning_amber'
          );
        }
      }
      return;
    }

    /* Estados Passivos (Apenas consulta/load da página) */
    if (diff > 0) {
      /* Existem pendentes */
      this.setAlert(
        `Existem ${diff} concurso(s) para sincronizar. (Último na Caixa: ${this.lastDrawApiCaixa})`,
        'warning',
        'warning_amber'
      );
    } else {
      /* Tudo sincronizado */
      this.setAlert(
        `Concursos Sincronizados. Próximo concurso: ${this.dateNextDrawCaixa}`,
        'info',
        'check_circle_outline'
      );
    }
  }

  /* Método para setar as variáveis do alerta */
  private setAlert(message: string, type: 'success' | 'warning' | 'info' | 'danger', icon: string) {
    this.syncAlertMessage = message;
    this.syncAlertType = type;
    this.syncAlertIcon = icon;
    this.showSyncAlert = true;
  }

  synchronizeDraws(): void {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.showSyncAlert = false;
    this.debugService.log('Iniciando sincronização...');

    this.subscription = this.service.synchronizeDatabase().subscribe({
      next: (response) => {
        this.showGenerateAlert = false;
        this.isSyncing = false;
        this.debugService.log('Sincronização concluída:', response);

        /* Passamos o response como contexto para o loadGeneralData */
        this.loadGeneralData({ syncResponse: response });
        this.loadTablesData();
        this.loadRecentDraws()
        this.loadBetsReport();
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Erro ao sincronizar:', err);
        this.setAlert('Erro ao sincronizar. Tente novamente mais tarde.', 'danger', 'error_outline');
      }
    });
  }

  addDrawManually(): void {
    const dialogRef = this.dialog.open(AddDrawModalComponent, {
      width: '500px',
      panelClass: 'no-padding-dialog',
      data: { nextSuggestedDraw: this.totalNumberLotofacilDraw + 1 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        /* Direciona para o método correto dependendo do que o usuário escolheu */
        if (result.action === 'DRAW') {
          this.saveNewManualDraw(result.payload);
        } else if (result.action === 'BET') {
          this.saveNewManualBet(result.payload);
        }
      }
    });
  }

  private saveNewManualBet(payload: SaveBetRequest): void {
    this.subscription = this.service.saveGeneratedBet(payload).subscribe({
      next: (response) => {
        this.setAlert(`Aposta para o concurso ${payload.targetDrawId} cadastrada com sucesso!`, 'success', 'check_circle_outline');
        this.loadBetsReport();
      },
      error: (err) => {
        this.setAlert(`Erro ao cadastrar aposta. (Erro: ${err.error?.message || err.message})`, 'danger', 'error_outline');
      }
    });
  }

  private saveNewManualDraw(data: { drawId: number, dozens: string[], drawDate: string }): void { 
    this.debugService.log('this.drawDate: ' , data.drawDate);
       
    const request: AddDrawRequest = {
      drawId: data.drawId,
      dozens: data.dozens,
      drawDate: data.drawDate.toString()
    };

    this.subscription = this.service.addDrawManually(request).subscribe({
      next: (newDraw) => {
        this.loadTablesData();
        /* Passamos o ID adicionado como contexto para o loadGeneralData */
        this.loadGeneralData({ manualAddId: newDraw.id });
        this.loadRecentDraws();
      },
      error: (err) => {
        /* Erro específico de adição manual (não recarrega o geral, só mostra erro) */
        this.setAlert(
          `Erro ao salvar concurso ${request.drawId}. (Erro: ${err.error?.message || err.message})`,
          'danger',
          'error_outline'
        );
      }
    });
  }

  loadDataParities(): void {
    this.subscription = this.service.getAllParities().subscribe({
      next: (response) => {
        this.paritiesData = response.map(item => ({
          id: item.id,
          parity: item.parity,
          quantity: item.quantity,
          percentage: item.percentage,
        }));
        this.dataSourceParity = new MatTableDataSource(this.paritiesData);
        this.dataSourceParity.sort = this.sortParity;
      },
      error: (error) => console.error('Erro paridade:', error)
    });
  }

  loadDataRepetitions(): void {
    this.subscription = this.service.getAllRepetitions().subscribe({
      next: (response) => {
        this.repetitionsData = response.map(item => ({
          id: item.id,
          repeated: item.repeated,
          quantity: item.quantity,
          percentage: item.percentage,
        }));
        this.dataSourceRepetition = new MatTableDataSource(this.repetitionsData);
        this.dataSourceRepetition.sort = this.sortRepetition;
      },
      error: (error) => console.error('Erro repetição:', error)
    });
  }

  loadDataNumbers(): void {
    this.subscription = this.service.getAllNumbers().subscribe({
      next: (response) => {
        this.numbersData = response.map(item => ({
          id: item.id,
          quantity: item.quantity,
          percentage: item.percentage,
        }));
        this.dataSourceNumber = new MatTableDataSource(this.numbersData);
        this.dataSourceNumber.sort = this.sortNumber;
      },
      error: (error) => console.error('Erro números:', error)
    });
  }

  consultDraw() {
    this.showConsultAlert = false;
    if (!this.drawIdConsulted || this.drawIdConsulted <= 0) return;

    if (this.drawIdConsulted > this.totalNumberLotofacilDraw) {
      this.showConsultAlert = true;
    } else {
      this.service.getDrawById(this.drawIdConsulted).subscribe({
        next: (resultDraw: DetailedDraw) => {
          if (resultDraw) this.openConsultDialog(resultDraw, false);
          else this.showConsultAlert = true;
        },
        error: (err) => {
          console.error('Erro consulta:', err);
          this.showConsultAlert = true;
        }
      });
    }
  }

openConsultDialog(response: DetailedDraw, isGenerate: boolean = false, requestParams?: GenerateDrawRequest): void {
    const dialogRef = this.dialog.open(DrawModalComponent, {
      width: '450px',
      panelClass: 'no-padding-dialog', 
      data: { draw: response, isGenerated: isGenerate, requestParams: requestParams } as ModalData
    });

    /* Voltamos com o afterClosed para capturar o evento emitido quando a aposta é salva! */
    dialogRef.afterClosed().subscribe(result => {
      /* Verifica se o modal retornou a nossa ação de sucesso */
      if (result && result.action === 'BET_SAVED') {
        
        /* Aciona o Alerta Visual (Dashboard) no topo da tela */
        this.setAlert('Aposta gerada registrada com sucesso!', 'success', 'check_circle_outline');
        
        /* Atualiza a tabela 'Desempenho das Apostas' no background */
        this.loadBetsReport();
      }
    });
  }

  generateDraw(): void {
    this.showGenerateAlert = false;

    if (this.totalNumberLotofacilDraw === 0) {
      this.generateAlertMessage = 'Dados não carregados.';
      this.showGenerateAlert = true;
      return;
    }

    const repeatedCount = this.repetitionMap[this.selectedRepetition];
    const parityCount = this.parityMap[this.selectedParity];

    const requestBody: GenerateDrawRequest = {
      lastDrawId: this.totalNumberLotofacilDraw.toString(),
      repeatedCount: repeatedCount,
      oddCount: parityCount ? parityCount.odd : null,
      evenCount: parityCount ? parityCount.even : null
    };

    this.subscription = this.service.generateDraw(requestBody).subscribe({
      next: (responseDraw: DetailedDraw) => {
        if (responseDraw) this.openConsultDialog(responseDraw, true, requestBody);
      },
      error: (err) => {
        if (err.status === 422 && err.error && err.error.message) {
          this.generateAlertMessage = err.error.message.replace('Parâmetros inválidos ', '');
        } else {
          this.generateAlertMessage = 'Erro inesperado ao gerar o jogo.';
        }
        this.showGenerateAlert = true;
      }
    });
  }

  openBetDetailModal(bet: LotofacilBet): void {
    this.dialog.open(BetModalComponent, {
      width: '500px', /* Ajuste a largura conforme necessário */
      data: bet, /* Passa os dados da aposta selecionada para o modal */
      panelClass: 'no-padding-dialog' /* Classe CSS opcional para remover padding do material se preferir */
    });
  }
}