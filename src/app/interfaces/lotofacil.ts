export interface DadosParidade {
  id: number;
  paridade: string;
  qtd: number;
  porcentagem: number;
}

export interface DadosRepeticao {
  id: number;
  repetido: number;
  qtd: number;
  porcentagem: number;
}

export interface DadosNumero {
  id: number;
  qtd: number;
  porcentagem: number;
}

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