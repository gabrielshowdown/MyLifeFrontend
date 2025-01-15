import { AbstractControl } from "@angular/forms";

// Função que valida campos de formulário
export function minusculoValidator(campoDoForm: AbstractControl) {
    const autoria = campoDoForm.value as string;
    if(autoria !== autoria?.toLowerCase()) { // Verifica se a string do campo autoria NÃO é toda minuscula
        return { minusculo: true };
    }
    else {
      return null;
    }

}

export function maiusculoValidator(campoDoForm: AbstractControl) {
  const autoria = campoDoForm.value as string;
  if(autoria !== autoria?.toUpperCase()) { // Verifica se a string do campo autoria NÃO é toda minuscula
      return { minusculo: true };
  }
  else {
    return null;
  }

}
