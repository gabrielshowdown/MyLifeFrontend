import { AbstractControl } from "@angular/forms";

// Função valida se os campos são minusculos (minusculoValidator)
export function lowercaseValidator(campoDoForm: AbstractControl) {
    const autoria = campoDoForm.value as string;
    if(autoria !== autoria?.toLowerCase()) { // Verifica se a string do campo autoria NÃO é toda minuscula
        return { lowercase: true };
    }
    else {
      return null;
    }

}

// Função valida se os campos são maiusculo (maiusculoValidator)
export function uppercaseValidator(campoDoForm: AbstractControl) {
  const autoria = campoDoForm.value as string;
  if(autoria !== autoria?.toUpperCase()) { // Verifica se a string do campo autoria NÃO é toda maiuscula
      return { uppercase: true };
  }
  else {
    return null;
  }

}
