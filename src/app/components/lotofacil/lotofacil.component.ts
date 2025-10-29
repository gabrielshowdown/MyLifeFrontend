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
import { ConcursoDetalhado, DadosNumero, DadosParidade, DadosRepeticao, GenerateContestRequest } from '../../interfaces/lotofacil';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { shownStateTrigger } from '../../animations/animations';
import { ConcursoModalComponent } from '../views/concurso-modal/concurso-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-lotofacil',
  imports:[
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
  showAlert: boolean = false;

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
  consultContest() {
    this.showAlert = false;

    if (!this.contestIdConsulted || this.contestIdConsulted <= 0) {
      return;
    }

    if (this.contestIdConsulted > this.totalNumberLotofacilContest) {
      this.showAlert = true;
    } else {
      // Lógica para buscar os dados e abrir o modal
      this.service.getContestById(this.contestIdConsulted).subscribe({
        // MODIFICADO: Esperar ConcursoDetalhado
        next: (resultadoConcurso: ConcursoDetalhado) => {
          // MODIFICADO: Checar se o objeto existe (não mais o length)
          if (resultadoConcurso) {
            this.openConsultaDialog(resultadoConcurso); // MODIFICADO: Passar o objeto inteiro
          } else {
            // Caso a API retorne um objeto nulo
            this.showAlert = true; 
          }
        },
        error: (err) => {
          console.error('Erro ao consultar concurso:', err);
          this.showAlert = true; 
        }
      });
    }
  }

  openConsultaDialog(resultado: ConcursoDetalhado): void {

    this.dialog.open(ConcursoModalComponent, {
      width: '450px',
      data: resultado // MODIFICADO: Enviar os dados mapeados
    });
    
  }

  adicionarJogo(): void {
    console.log('Botão Adicionar clicado');
  }

  generateContest(): void {
    console.log('Gerando jogo com as opções:', this.repeticaoSelecionada, this.paridadeSelecionada);

    if(this.totalNumberLotofacilContest === 0){
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
            this.openConsultaDialog(resultadoConcurso); // MODIFICADO: Passar o objeto inteiro
        }
      },
      error: (err) => {
        console.error('Erro ao gerar jogo:', err);
        // Aqui você pode adicionar um feedback visual para o usuário (ex: um toast ou snackbar)
      }
    });
  }

  synchronizeContests(): void {
    if (this.isSyncing) return; // Previne cliques duplos

    this.isSyncing = true;
    this.debugService.log('Iniciando sincronização...');
    // (Opcional: desabilitar o botão no HTML usando [disabled]="isSyncing")

    this.subscription = this.service.synchronizeDatabase().subscribe({
      next: (responseMessage) => {
        this.isSyncing = false;
        this.debugService.log('Sincronização concluída:', responseMessage);
        // alert(responseMessage); // Feedback simples
        // this.snackBar.open(responseMessage, 'Fechar', { duration: 5000 }); // Feedback melhor

        // CRUCIAL: Recarregar os dados da tela após a sincronização
        this.loadGeneralData();
        this.loadTablesData();
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Erro ao sincronizar:', err);
        // alert('Erro ao sincronizar. Veja o console.');
        // this.snackBar.open('Erro ao sincronizar. Tente novamente.', 'Fechar', { duration: 5000 });
      }
    });
  }
}