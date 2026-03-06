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

// [Arquivo: lotofacil.ts]
// ... (Interfaces existentes: DadosParidade, DadosRepeticao, etc.)

// Interface para o item 'numeroSorteado' da nova API
export interface NumeroSorteadoDetalhe {
  id: number;
  numero: number;
  repetido: boolean;
}

// Interface para a nova resposta completa da API, o que como vem do backend
export interface DetailedDraw {
  id: number;
  qtdPares: number;
  qtdImpares: number;
  qtdRepetidos: number;
  numerosConcurso: NumeroSorteadoDetalhe[];
}

// Interface de de como será no Json mandado na requisição de geração, Igual a classe DTO no backend
export interface GenerateDrawRequest {
  concursoAnteriorId: string;
  qtdPares: string | null;
  qtdImpares: string | null;
  qtdRepetidos: string | null;
}

export interface SynchronizeResponse {
  lastConcCadastrado: number;
  totContestSyncronized: number;
  dateNextContest: Date;
  textReturnedSyoncronized: string;
  nextContest: number;
}

export interface ModalData {
  concurso: DetailedDraw;
  isGerado: boolean;
}

// DTO para salvar manualmente um consurso.
export interface AddDrawRequest {
  drawId: number;
  dozens: string[]; // Ex: ["01", "06", "07", ...]
  dataApuracao: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}