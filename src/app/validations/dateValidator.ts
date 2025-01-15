import { AbstractControl } from "@angular/forms";

// Função que valida campos de formulário
export function birthdayValidator(campoDoForm: AbstractControl) {
  console.log('idnde', campoDoForm.value as string);

    const birthDay = campoDoForm.value as string + 'GMT-0300';
    const today = new Date();
    const birthDayDate = new Date(birthDay);

    birthDayDate.setHours(0, 0, 0, 0); // Remove o horário para comparação precisa
    today.setHours(0, 0, 0, 0); // Remove o horário para comparação precisa

    if (birthDayDate <= today ){
      return null;
    }
    else{
      return { futureDate: true }
    }
}
