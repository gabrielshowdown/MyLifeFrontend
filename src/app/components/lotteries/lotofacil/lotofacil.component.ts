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
import { AdicionarConcursoRequest, ConcursoDetalhado, DadosNumero, DadosParidade, DadosRepeticao, GenerateContestRequest, ModalData, SynchronizeResponse } from '../../../interfaces/lotofacil';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs'
import { ConcursoModalComponent } from '../draw-modal/concurso-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConcursoCardComponent } from '../draw-card/concurso-card.component';
import { listAnimation, shownStateTrigger } from '../../../animations/animations';
import { LoteriasService } from '../../../services/loterias.service';
import { DebugService } from '../../../core/services/debug.service';
import { AddConcursoModalComponent } from '../add-draw-modal/add-concurso-modal.component';


// Interface auxiliar para passar contexto para a atualização de status
interface StatusContext {
  syncResponse?: SynchronizeResponse | null;
  manualAddId?: number | null;
}

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
    ConcursoCardComponent,
    MatTabsModule
  ],
  templateUrl: './lotofacil.component.html',
  styleUrls: ['./lotofacil.component.scss'],
  animations: [shownStateTrigger, listAnimation]
})
export class LotofacilComponent implements OnInit {

  // Atributos
  private _liveAnnouncer = inject(LiveAnnouncer);
  subscription!: Subscription;
  isSyncing: boolean = false;

  totalNumberLotofacilContest: number = 0;
  contestIdConsulted: number = 0;
  showConsultAlert: boolean = false;

  recentContests: ConcursoDetalhado[] = [];
  currentPage: number = 0;
  pageSize: number = 4; // Mostra 4 cards, igual ao print Java
  totalPages: number = 0;

  // Alertas de Status
  showSyncAlert: boolean = false;
  syncAlertMessage: string = '';
  syncAlertType: 'success' | 'warning' | 'info' | 'danger' = 'info';
  syncAlertIcon: string = 'info_outline';

  // Dados das tabelas
  paritiesData: DadosParidade[] = [];
  repetitionsData: DadosRepeticao[] = [];
  numbersData: DadosNumero[] = [];

  displayedColumnsParity: string[] = ['paridade', 'qtd', 'porcentagem'];
  displayedColumnsRepetition: string[] = ['repetido', 'qtd', 'porcentagem'];
  displayedColumnsNumber: string[] = ['id', 'qtd', 'porcentagem'];

  dataSourceParity: any;
  dataSourceRepetition: any;
  dataSourceNumber: any;

  lastContestApiCaixa: number = 0;
  dateNextContesCaixa: any;

  // Alertas de Geração
  showGenerateAlert: boolean = false;
  generateAlertMessage: string = '';

  @ViewChild('sortParity') sortParity!: MatSort;
  @ViewChild('sortRepetition') sortRepetition!: MatSort;
  @ViewChild('sortNumber') sortNumber!: MatSort;

  // Filtros
  repeticaoSelecionada: string = 'N/D';
  private repeticaoMap: { [key: string]: string | null } = {
    'N/D': '0', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12'
  };

  paridadeSelecionada: string = 'N/D';
  private paridadeMap: { [key: string]: { impares: string, pares: string } | null } = {
    'N/D': { impares: '0', pares: '0' },
    '4/11': { impares: '4', pares: '11' },
    '5/10': { impares: '5', pares: '10' },
    '6/9': { impares: '6', pares: '9' },
    '7/8': { impares: '7', pares: '8' },
    '8/7': { impares: '8', pares: '7' },
    '9/6': { impares: '9', pares: '6' },
    '10/5': { impares: '10', pares: '5' },
    '11/4': { impares: '11', pares: '4' }
  };

  constructor(
    private service: LoteriasService,
    private debugService: DebugService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.adjustPageSizeToScreen();
    this.loadTablesData();
    this.loadGeneralData();
    this.loadRecentContests();
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
      this.loadRecentContests();
    }
  }
  */

  /**
   * Carrega dados gerais e define a mensagem de status baseada no contexto
   * @param context Objeto opcional contendo dados de sync ou adição manual recente
   */
  loadGeneralData(context: StatusContext = {}) {
    let localErrorType: 'NONE' | 'EMPTY' | 'ERROR' = 'NONE';
    let apiError = false;

    forkJoin({
      lastLocal: this.service.getLastContestLotofacilRegistered().pipe(
        catchError(err => {
          if (err.message === 'Nenhum concurso encontrado' || err.status === 404) {
            localErrorType = 'EMPTY';
          } else {
            localErrorType = 'ERROR';
          }
          return of(null);
        })
      ),
      lastCaixa: this.service.getContestLotofacilCaixa().pipe(
        catchError(err => {
          apiError = true;
          return of(null);
        })
      )
    }).subscribe({
      next: ({ lastLocal, lastCaixa }) => {
        // Atualiza variáveis de estado
        if (lastLocal !== null) this.totalNumberLotofacilContest = lastLocal;
        else if (localErrorType === 'EMPTY') this.totalNumberLotofacilContest = 0;

        if (lastCaixa !== null) {
          this.lastContestApiCaixa = lastCaixa.numero;
          this.dateNextContesCaixa = lastCaixa.dataProximoConcurso;
        }

        // Chama o centralizador de mensagens
        this.updateDashboardStatus(localErrorType, apiError, context);
      }
    });
  }

  loadRecentContests(): void {
    this.service.getContestsPaginated(this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData) => {
          this.recentContests = pageData.content;
          this.totalPages = pageData.totalPages;

          // Ordenar as dezenas dentro de cada concurso para visualização correta
          this.recentContests.forEach(c => {
            c.numerosConcurso.sort((a, b) => a.numero - b.numero);
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
    // A largura da tela disponível
    const screenWidth = window.innerWidth;

    // DEFINIÇÃO DO PONTO DE QUEBRA (BREAKPOINT):
    // Seu container de lista ocupa metade da tela (col-lg-6).
    // Cada card tem min-width de 260px.
    // Para caber 3 cards lado a lado, o container precisa de ~820px.
    // Logo, a tela inteira precisa ter aproximadamente > 1650px.
    
    // Vamos usar 1600px como margem de segurança para monitores Wide
    if (screenWidth >= 1600) {
      this.pageSize = 6;
    } else {
      this.pageSize = 4;
    }
    
    // Opcional: Log para você debugar qual tamanho foi escolhido
    // console.log(`Largura: ${screenWidth}px | PageSize definido para: ${this.pageSize}`);
  }

  changePage(delta: number): void {
    const nextPage = this.currentPage + delta;

    // A validação de limites continua a mesma, 
    // pois o Backend ainda trata 0 como início e totalPages como fim.
    if (nextPage >= 0 && nextPage < this.totalPages) {
      this.currentPage = nextPage;
      this.loadRecentContests();
    }
  }

  /**
   * Lógica centralizada para definir a mensagem, cor e ícone do alerta principal
   */
  private updateDashboardStatus(
    localErrorType: 'NONE' | 'EMPTY' | 'ERROR',
    apiError: boolean,
    context: StatusContext
  ) {
    const diff = this.lastContestApiCaixa - this.totalNumberLotofacilContest;
    const nextDateFormatted = this.dateNextContesCaixa
      ? new Date(this.dateNextContesCaixa).toLocaleDateString('pt-BR') // Ajuste conforme formato da API
      : 'N/D';
    // Obs: Se a API já retorna string formatada ("dd/mm/yyyy"), remova o "new Date()"

    // 1. Erros de Infraestrutura
    if (localErrorType === 'ERROR') {
      this.setAlert('Erro ao buscar dados locais.', 'danger', 'error_outline');
      return;
    }
    if (apiError) {
      this.setAlert('Erro ao buscar dados da API da Caixa.', 'danger', 'error_outline');
      return;
    }

    // 2. Banco Local Vazio
    if (localErrorType === 'EMPTY' || this.totalNumberLotofacilContest === 0) {
      this.setAlert(
        `Nenhum concurso cadastrado no banco local. (Último na Caixa ${this.lastContestApiCaixa})`,
        'info',
        'info_outline'
      );
      return;
    }

    // 3. Adição Manual (Prioridade sobre Sync se acabou de acontecer)
    if (context.manualAddId) {
      if (diff > 0) {
        this.setAlert(
          `Concurso ${context.manualAddId} adicionado manualmente. (Último na caixa ${this.lastContestApiCaixa})`,
          'warning',
          'warning_amber'
        );
      } else {
        // Igualou
        this.setAlert(
          `Concurso ${context.manualAddId} adicionado manualmente, Próximo concurso: ${this.dateNextContesCaixa}`,
          'success',
          'check_circle_outline'
        );
      }
      return;
    }

    // 4. Sincronização (Se veio de uma ação de sync)
    if (context.syncResponse) {
      const syncedCount = context.syncResponse.totContestSyncronized;

      if (syncedCount > 0) {
        // Caso A: Houve processamento de novos dados
        if (diff > 0) {
          this.setAlert(
            `Sincronizados ${syncedCount} concursos! Restam ${diff} concurso(s). (Último na Caixa: ${this.lastContestApiCaixa})`,
            'info',
            'check_circle_outline'
          );
        } else {
          this.setAlert(
            `Sincronizados com sucesso! Próximo concurso: ${this.dateNextContesCaixa}`,
            'success',
            'check_circle_outline'
          );
        }
      } else {
        // Caso B: Não houve novos dados (syncedCount === 0)
        if (diff === 0) {
          // AQUI ESTÁ O AJUSTE: Feedback específico para "já estava atualizado"
          this.setAlert(
            `Concursos Sincronizados. Próximo concurso: ${this.dateNextContesCaixa}`,
            'info',
            'check_circle_outline'
          );
        } else {
          // Raro: sync retornou 0 mas ainda existe diferença (ex: erro silencioso no back ou gap de dados)
          this.setAlert(
            `Sincronização finalizada sem novos registros. Faltam ${diff} concursos.`,
            'warning',
            'warning_amber'
          );
        }
      }
      return;
    }

    // 5. Estados Passivos (Apenas consulta/load da página)
    if (diff > 0) {
      // Existem pendentes
      this.setAlert(
        `Existem ${diff} concurso(s) para sincronizar. (Último na Caixa: ${this.lastContestApiCaixa})`,
        'warning',
        'warning_amber'
      );
    } else {
      // Tudo sincronizado
      this.setAlert(
        `Concursos Sincronizados. Próximo concurso: ${this.dateNextContesCaixa}`,
        'info',
        'check_circle_outline'
      );
    }
  }

  /** Helper para setar as variáveis do alerta */
  private setAlert(message: string, type: 'success' | 'warning' | 'info' | 'danger', icon: string) {
    this.syncAlertMessage = message;
    this.syncAlertType = type;
    this.syncAlertIcon = icon;
    this.showSyncAlert = true;
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

        // Passamos o response como contexto para o loadGeneralData
        this.loadGeneralData({ syncResponse: response });
        this.loadTablesData();
        this.loadRecentContests()
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Erro ao sincronizar:', err);
        this.setAlert('Erro ao sincronizar. Tente novamente mais tarde.', 'danger', 'error_outline');
      }
    });
  }

  adicionarJogo(): void {
    const dialogRef = this.dialog.open(AddConcursoModalComponent, {
      width: '500px',
      panelClass: 'no-padding-dialog',
      data: { proximoConcursoSugerido: this.totalNumberLotofacilContest + 1 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.concursoId && result.dezenas) {
        this.salvarNovoConcursoManual(result);
      }
    });
  }

  private salvarNovoConcursoManual(data: { concursoId: number, dezenas: string[] }): void {
    const request: AdicionarConcursoRequest = {
      concursoId: data.concursoId,
      dezenas: data.dezenas
    };

    this.subscription = this.service.addContestManually(request).subscribe({
      next: (novoConcurso) => {
        this.loadTablesData();
        // Passamos o ID adicionado como contexto para o loadGeneralData
        this.loadGeneralData({ manualAddId: novoConcurso.id });
        this.loadRecentContests();
      },
      error: (err) => {
        // Erro específico de adição manual (não recarrega o geral, só mostra erro)
        this.setAlert(
          `Erro ao salvar concurso ${request.concursoId}. (Erro: ${err.error?.message || err.message})`,
          'danger',
          'error_outline'
        );
      }
    });
  }

  // --- Métodos de Tabelas e Consultas (Mantidos iguais ou levemente ajustados) ---

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  loadDataParities(): void {
    this.subscription = this.service.getAllParities().subscribe({
      next: (dadosDaApi) => {
        this.paritiesData = dadosDaApi.map(item => ({
          id: item.id,
          paridade: item.paridade,
          qtd: item.qtd,
          porcentagem: item.porcentagem,
        }));
        this.dataSourceParity = new MatTableDataSource(this.paritiesData);
        this.dataSourceParity.sort = this.sortParity;
      },
      error: (erro) => console.error('Erro paridade:', erro)
    });
  }

  loadDataRepetitions(): void {
    this.subscription = this.service.getAllRepetitions().subscribe({
      next: (dadosDaApi) => {
        this.repetitionsData = dadosDaApi.map(item => ({
          id: item.id,
          repetido: item.repetido,
          qtd: item.qtd,
          porcentagem: item.porcentagem,
        }));
        this.dataSourceRepetition = new MatTableDataSource(this.repetitionsData);
        this.dataSourceRepetition.sort = this.sortRepetition;
      },
      error: (erro) => console.error('Erro repetição:', erro)
    });
  }

  loadDataNumbers(): void {
    this.subscription = this.service.getAllNumbers().subscribe({
      next: (dadosDaApi) => {
        this.numbersData = dadosDaApi.map(item => ({
          id: item.id,
          qtd: item.qtd,
          porcentagem: item.porcentagem,
        }));
        this.dataSourceNumber = new MatTableDataSource(this.numbersData);
        this.dataSourceNumber.sort = this.sortNumber;
      },
      error: (erro) => console.error('Erro números:', erro)
    });
  }

  consultContest() {
    this.showConsultAlert = false;
    if (!this.contestIdConsulted || this.contestIdConsulted <= 0) return;

    if (this.contestIdConsulted > this.totalNumberLotofacilContest) {
      this.showConsultAlert = true;
    } else {
      this.service.getContestById(this.contestIdConsulted).subscribe({
        next: (resultadoConcurso: ConcursoDetalhado) => {
          if (resultadoConcurso) this.openConsultaDialog(resultadoConcurso, false);
          else this.showConsultAlert = true;
        },
        error: (err) => {
          console.error('Erro consulta:', err);
          this.showConsultAlert = true;
        }
      });
    }
  }

openConsultaDialog(resultado: ConcursoDetalhado, isGerado: boolean = false): void {
  this.dialog.open(ConcursoModalComponent, {
    width: '450px',
    // Adicione esta linha abaixo. Ela permite customizar o container "pai"
    panelClass: 'no-padding-dialog', 
    data: { concurso: resultado, isGerado: isGerado } as ModalData
  });
}

  generateContest(): void {
    this.showGenerateAlert = false;

    if (this.totalNumberLotofacilContest === 0) {
      this.generateAlertMessage = 'Dados não carregados.';
      this.showGenerateAlert = true;
      return;
    }

    const repetidos = this.repeticaoMap[this.repeticaoSelecionada];
    const paridade = this.paridadeMap[this.paridadeSelecionada];

    const requestBody: GenerateContestRequest = {
      concursoAnteriorId: this.totalNumberLotofacilContest.toString(),
      qtdRepetidos: repetidos,
      qtdImpares: paridade ? paridade.impares : null,
      qtdPares: paridade ? paridade.pares : null
    };

    this.subscription = this.service.generateContest(requestBody).subscribe({
      next: (resultadoConcurso: ConcursoDetalhado) => {
        if (resultadoConcurso) this.openConsultaDialog(resultadoConcurso, true);
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
}