import { Directive, HostListener } from '@angular/core';

/* Aplica a máscara DD/MM/AAAA enquanto o usuário digita */
@Directive({
  selector: 'input[appDateMask]',
  standalone: true
})
export class DateMaskDirective {

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);

    let masked = digits;
    if (digits.length > 4) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    if (masked !== input.value) {
      input.value = masked;
      /* Reemite o evento para o matDatepickerInput/ngModel lerem o valor já mascarado.
         Na segunda passada masked === value, então não entra em loop. */
      input.dispatchEvent(new Event('input'));
    }
  }
}