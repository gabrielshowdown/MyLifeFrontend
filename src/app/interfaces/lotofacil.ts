// Interface para a tabela de paridade
export interface DadosParidade {
  id: number;
  paridade: string;
  qtd: number;
  porcentagem: number;
}

// Interface para a tabela de repetição
export interface DadosRepeticao {
  id: number;
  repetido: number;
  qtd: number;
  porcentagem: number;
}

// Interface para a tabela de Números
export interface DadosNumero {
  id: number;
  qtd: number;
  porcentagem: number;
}

// Interface para ver informações do último concurso cadastrado
export interface DadosConcurso {
  id: number;
  qtdPares: number;
  qtdImpares: number;
  qtdRepetidos: number;
}

export interface NumerosSorteado {
  id: number;
  numero: number;
  repetido: boolean;
  sorteio: DadosConcurso;
}

// [Arquivo: lotofacil.ts]
// ... (Interfaces existentes: DadosParidade, DadosRepeticao, etc.)

// Interface para o item 'numeroSorteado' da nova API
export interface NumeroSorteadoDetalhe {
  id: number;
  numero: number;
  repetido: boolean;
}

// Interface para a nova resposta completa da API
export interface ConcursoDetalhado {
  id: number;
  qtdPares: number;
  qtdImpares: number;
  qtdRepetidos: number;
  numerosConcurso: NumeroSorteadoDetalhe[];
}