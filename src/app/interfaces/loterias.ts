// Interface para receber dados da API Loterias Caixa
export interface Concurso {
  acumulado:                      boolean;
  dataApuracao:                   string;
  dataProximoConcurso:            string;
  dezenasSorteadasOrdemSorteio:   string[];
  exibirDetalhamentoPorCidade:    boolean;
  id:                             null;
  indicadorConcursoEspecial:      number;
  listaDezenas:                   string[];
  listaDezenasSegundoSorteio:     null;
  listaMunicipioUFGanhadores:     ListaMunicipioUFGanhadore[];
  listaRateioPremio:              ListaRateioPremio[];
  listaResultadoEquipeEsportiva:  null;
  localSorteio:                   string;
  nomeMunicipioUFSorteio:         string;
  nomeTimeCoracaoMesSorte:        string;
  numero:                         number;
  numeroConcursoAnterior:         number;
  numeroConcursoFinal_0_5:        number;
  numeroConcursoProximo:          number;
  numeroJogo:                     number;
  observacao:                     string;
  premiacaoContingencia:          null;
  tipoJogo:                       string;
  tipoPublicacao:                 number;
  ultimoConcurso:                 boolean;
  valorArrecadado:                number;
  valorAcumuladoConcurso_0_5:     number;
  valorAcumuladoConcursoEspecial: number;
  valorAcumuladoProximoConcurso:  number;
  valorEstimadoProximoConcurso:   number;
  valorSaldoReservaGarantidora:   number;
  valorTotalPremioFaixaUm:        number;
}

export interface ListaMunicipioUFGanhadore {
  ganhadores:     number;
  municipio:      string;
  nomeFatansiaUL: string;
  posicao:        number;
  serie:          string;
  uf:             string;
}

export interface ListaRateioPremio {
  descricaoFaixa:     string;
  faixa:              number;
  numeroDeGanhadores: number;
  valorPremio:        number;
}

// Interface que representa o modelo que nós queremos tratar
export interface LotteryDrawSummary {
  numero?:                         number;
  numeroConcursoAnterior?:         number;
  numeroConcursoProximo?:          number;
  dataApuracao?:                   string;
  dataProximoConcurso?:            string;
  tipoJogo?:                       string;
  listaDezenas?:                   string[];
  localSorteio?:                   string;
}
