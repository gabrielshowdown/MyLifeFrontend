export interface BookBible {
  id: number;
  abbreviation: string;
  name: string;
  category: string;
}

/* Inteface de resumo dos temas */
export interface ThemeSummary {
  id: number;
  themeName: string;
  celebrationDate: string; /* yyyy-MM-dd */
}

/* O que vem ao buscar por ID (completa)*/
export interface ThemeHistory extends ThemeSummary {
  creationDate?: string;
  firstReading: string[];
  secondReading: string[];
  thirdReading: string[];
  gospel: string[];
  discarded: string[];
}