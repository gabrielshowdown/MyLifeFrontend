import { AbstractControl } from "@angular/forms";

// Função valida se os campos são minusculos (minusculoValidator)
export function lowercaseValidator(formField: AbstractControl) {
    const text = formField.value as string;
    if(text !== text?.toLowerCase()) { // Verifica se a string do campo autoria NÃO é toda minuscula
        return { lowercase: true };
    }
    else {
      return null;
    }
}

// Função valida se os campos são maiusculo (maiusculoValidator)
export function uppercaseValidator(formField: AbstractControl) {
  const text = formField.value as string;
  if(text !== text?.toUpperCase()) { // Verifica se a string do campo autoria NÃO é toda maiuscula
      return { uppercase: true };
  }
  else {
    return null;
  }
}
