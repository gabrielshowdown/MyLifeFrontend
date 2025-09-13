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

// Interfaces para tipar nossos dados (boa prática)
export interface Concurso {
  numero: number;
  dezenas: string[];
  paridade: string;
  repetidas: number;
}

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

  estatisticasParidade: DadosParidade[] = [
      {id: 1, paridade: 'aa', porcentagem: 0.2, qtd: 2},
      {id: 2, paridade: 'ac', porcentagem: 0.1, qtd: 2},
      {id: 3, paridade: 'ab', porcentagem: 0.6, qtd: 2},
  ];

  estatisticasRepeticao: DadosRepeticao[] = [
      {id: 1, repetido: 6, porcentagem: 0.2, qtd: 2},
      {id: 2, repetido: 7, porcentagem: 0.1, qtd: 2},
      {id: 3, repetido: 8, porcentagem: 0.6, qtd: 2},
  ];

  estatisticasNumeros: DadosNumero[] = [
      {id: 1, porcentagem: 0.2, qtd: 2},
      {id: 2, porcentagem: 0.1, qtd: 2},
      {id: 3, porcentagem: 0.6, qtd: 2},
  ];

  displayedColumns3: string[] = ['paridade', 'qtd', 'porcentagem'];
  displayedColumns4: string[] = ['repetido', 'qtd', 'porcentagem'];
  displayedColumns5: string[] = ['id', 'qtd', 'porcentagem'];
  dataSource3: any;
  dataSource4: any;
  dataSource5: any;
  @ViewChild('sort3') sort3!: MatSort;
  @ViewChild('sort4') sort4!: MatSort;
  @ViewChild('sort5') sort5!: MatSort;

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // --- Propriedades do Componente ---
  totalDeJogos: number = 3306;
  jogoConsultado: string = '';
  
  // Opções para os filtros de geração
  repeticaoSelecionada: string = 'N/D';
  paridadeSelecionada: string = 'N/D';

  // --- Dados Mockados ---
  concursos: Concurso[] = [
    { numero: 3303, dezenas: ['02', '03', '04', '05', '06', '07', '08', '13', '16', '18', '20', '21', '22', '23', '24'], paridade: '6I/9P', repetidas: 7 },
    { numero: 3304, dezenas: ['01', '03', '04', '05', '07', '08', '10', '11', '12', '14', '15', '19', '20', '21', '23'], paridade: '10I/5P', repetidas: 7 },
    { numero: 3305, dezenas: ['03', '04', '05', '07', '08', '09', '12', '13', '17', '19', '20', '21', '23', '24', '25'], paridade: '10I/5P', repetidas: 10 },
    { numero: 3306, dezenas: ['04', '05', '06', '08', '09', '10', '11', '14', '15', '17', '18', '19', '21', '22', '24'], paridade: '7I/8P', repetidas: 8 },
  ];

  options = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' }
];

  selectedOption = 'angular'; // valor inicial

  constructor(
    private service: LoteriasService,
    private debugService: DebugService,
  ) { }

  ngOnInit(): void{
    this.debugService.log('OnInit rodando');
    this.carregarEstatisticasParidade();
    this.carregarEstatisticasRepeticoes();
    this.carregarEstatisticasNumeros();
    
  }

  // MODIFICAÇÃO 2: Mover a lógica para uma função separada (boa prática)
  carregarEstatisticasParidade(): void {
    this.service.getTotalParidades().subscribe({
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

  carregarEstatisticasRepeticoes(): void {
    this.service.getTotalRepeticoes().subscribe({
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.estatisticasRepeticao = dadosDaApi.map(item => {
          return {
            id: item.id,
            repetido: item.repetido, // de 'paridade' para 'item'
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSource4 = new MatTableDataSource(this.estatisticasRepeticao);
        this.dataSource4.sort = this.sort4;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.estatisticasRepeticao);

      },
      error: (erro) => {
        console.error('Erro ao buscar totais de paridade:', erro);
        // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
      }
    });
  }

  carregarEstatisticasNumeros(): void {
    this.service.getTotalNumeros().subscribe({
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        
        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.estatisticasNumeros = dadosDaApi.map(item => {
          return {
            id: item.id,
            qtd: item.qtd,
            porcentagem: item.porcentagem, // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.dataSource5 = new MatTableDataSource(this.estatisticasNumeros);
        this.dataSource5.sort = this.sort5;
        this.debugService.log('Dados de paridade mapeados para a tabela:', this.estatisticasNumeros);

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