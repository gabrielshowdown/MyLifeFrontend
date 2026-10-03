import { Injectable, Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class PtBrDateAdapter extends NativeDateAdapter {

  /* Lê o texto digitado no formato dd/MM/yyyy */
  override parse(value: any): Date | null {
    if (typeof value !== 'string') {
      return super.parse(value);
    }

    const text = value.trim();
    if (!text) return null;

    const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return this.invalid(); /* Texto incompleto/inválido */

    const day = +match[1];
    const month = +match[2] - 1;
    const year = +match[3];
    const date = new Date(year, month, day);

    /* Evita que 31/02/2026 "vire" outra data */
    const isReal =
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;

    return isReal ? date : this.invalid();
  }

  /* Escreve a data no input como dd/MM/yyyy */
  override format(date: Date, displayFormat: any): string {
    if (displayFormat === 'input') {
      if (!this.isValid(date)) {
        throw Error('PtBrDateAdapter: data inválida.');
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${date.getFullYear()}`;
    }
    /* Cabeçalho do calendário, labels de acessibilidade etc. continuam padrão */
    return super.format(date, displayFormat);
  }
}

export const PT_BR_DATE_FORMATS = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

/* Um único provider para registrar tudo no app.config */
export function providePtBrDate(): Provider[] {
  return [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: PtBrDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS },
  ];
}