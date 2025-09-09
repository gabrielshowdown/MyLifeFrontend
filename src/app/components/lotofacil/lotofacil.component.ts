import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoteriasService } from '../../services/loterias.service';
import { DebugService } from '../../config/debug.service';
import { DadosParidade } from '../../interfaces/lotofacil';

// Interfaces para tipar nossos dados (boa prática)
export interface Concurso {
  numero: number;
  dezenas: string[];
  paridade: string;
  repetidas: number;
}

export interface Estatistica {
  item: string | number;
  qtd: number;
  percentual: string;
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
    MatButtonToggleModule 
  ],
  templateUrl: './lotofacil.component.html',
  styleUrls: ['./lotofacil.component.scss']
})
export class LotofacilComponent implements OnInit {

  // Atributos
  totaisParidades: DadosParidade[] = [];

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

  estatisticasRepeticao: Estatistica[] = [
    { item: 5, qtd: 1, percentual: '0.03%' },
    { item: 6, qtd: 47, percentual: '1.42%' },
    { item: 7, qtd: 313, percentual: '9.47%' },
    { item: 8, qtd: 804, percentual: '24.3%' },
    { item: 9, qtd: 1077, percentual: '32.5%' },
    { item: 10, qtd: 724, percentual: '21.9%' },
    { item: 11, qtd: 276, percentual: '8.35%' },
    // ... restante dos dados
  ];

  estatisticasParidade: Estatistica[] = [
    { item: '13I/02P', qtd: 0, percentual: '0.0%' },
    { item: '12I/03P', qtd: 3, percentual: '0.09%' },
    { item: '11I/04P', qtd: 31, percentual: '0.94%' },
    { item: '10I/05P', qtd: 235, percentual: '7.11%' },
    { item: '09I/06P', qtd: 683, percentual: '20.66%' },
    // ... restante dos dados
  ];

  estatisticasNumero: Estatistica[] = [
    { item: 1, qtd: 1990, percentual: '60.19%' },
    { item: 2, qtd: 1977, percentual: '59.8%' },
    { item: 3, qtd: 1998, percentual: '60.44%' },
    { item: 4, qtd: 1997, percentual: '60.41%' },
    { item: 5, qtd: 1993, percentual: '60.28%' },
    // ... restante dos dados
  ];

  // Colunas para as tabelas do Angular Material
  colunasRepeticao: string[] = ['item', 'qtd', 'percentual'];
  colunasParidade: string[] = ['item', 'qtd', 'percentual'];
  colunasNumero: string[] = ['item', 'qtd', 'percentual'];

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
    this.service.getTotalParidade().subscribe({
      next: (aa) => {
        console.log(aa);
        this.totaisParidades = aa;
        console.log('Totais pariades: ' , this.totaisParidades);
      }
    })

    console.log('Totais pariades: ' + this.totaisParidades);
    
  }

  // MODIFICAÇÃO 2: Mover a lógica para uma função separada (boa prática)
  carregarEstatisticasParidade(): void {
    this.service.getTotalParidade().subscribe({
      next: (dadosDaApi) => {
        this.debugService.log('Dados de paridade recebidos da API:', dadosDaApi);
        this.totaisParidades = dadosDaApi; // Opcional, se precisar dos dados originais

        // MODIFICAÇÃO 3: Mapear os dados da API para o formato da tabela
        this.estatisticasParidade = dadosDaApi.map(item => {
          return {
            item: item.paridade, // de 'paridade' para 'item'
            qtd: item.qtd,
            percentual: `${item.porcentagem.toFixed(2)}%` // de 'porcentagem' para 'percentual' (string)
          };
        });

        this.debugService.log('Dados de paridade mapeados para a tabela:', this.estatisticasParidade);
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