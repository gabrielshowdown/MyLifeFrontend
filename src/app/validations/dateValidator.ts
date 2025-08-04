import { AbstractControl, ValidationErrors } from "@angular/forms";

export function birthdayValidator(control: AbstractControl): ValidationErrors | null {

    // Se o campo não for preenchido, outro validador (como Validators.required) cuidará disso.
    if (!control.value) {
        return null;
    }

    const birthDay = new Date(control.value);
    
    // O input type="date" já passa a data no formato correto, 
    // mas sem fuso horário, o que pode causar problemas de um dia de diferença.
    // Adicionar 4 horas "engana" o fuso e garante que estamos no dia correto.
    // Ex: '2025-08-04' vira '2025-08-04T00:00:00Z', que pode ser interpretado como dia 03 em GMT-3.
    // Somando horas, garantimos que a data local seja a correta.
    birthDay.setUTCHours(birthDay.getUTCHours() + 4);

    const today = new Date();

    // Zera o horário de ambas as datas para comparar apenas o dia, mês e ano.
    birthDay.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Verifica se a data é inválida após a conversão (ex: texto digitado)
    if (isNaN(birthDay.getTime())) {
        return { invalidDate: true };
    }

    // Verifica se o ano é anterior a 1900
    if (birthDay.getFullYear() < 1900) {
        return { yearBefore1900: true };
    }

    // Verifica se a data é futura
    if (birthDay > today) {
        return { futureDate: true };
    }

    // Se passou por todas as validações, está tudo certo.
    return null;
}