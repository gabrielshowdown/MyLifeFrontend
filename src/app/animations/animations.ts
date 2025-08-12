  import { animate, group, keyframes, query, stagger, state, style, transition, trigger } from "@angular/animations";
  
  export const shownStateTrigger = trigger('shownState', [
    // Inicia o estilo com 'opacity 0' e depois gradualmente durante 3 segundos aumenta a opacidade para 1
    transition(':enter', [ // 'enter' serve para quando o elemento aparece no dom, equivalente (void => *)
      style({
        opacity: 0
      }),
      animate(300, style({
        opacity: 1
      }))
    ]),
    // Durante 3 segundos a opacity vai para 0 quando o elemento sumir (não precisa de style inicial,
    // já vai estar como 1)
    transition(':leave', [ // 'leave' serve para quando o elemento sai do dom, equivalente (* => void)
      animate(300, style({// milisegundos
        opacity: 0
      }))
    ])
  ])
  
  // Usasdo nos invalid-data, porém não funciona direito quando é dentro de um *ngIf :(
  export const shakeTrigger = trigger('shakeAnimation', [
  // A transição ':enter' é acionada quando o elemento é adicionado à tela (ex: por um *ngIf)
  transition(':enter', [
    animate('0.5s', keyframes([
      // Define os passos da animação 'shake'
      style({ transform: 'translateX(0)',     offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.1 }),
      style({ transform: 'translateX(10px)',  offset: 0.3 }),
      style({ transform: 'translateX(-10px)', offset: 0.5 }),
      style({ transform: 'translateX(10px)',  offset: 0.7 }),
      style({ transform: 'translateX(-10px)', offset: 0.9 }),
      style({ transform: 'translateX(0)',     offset: 1.0 })
    ]))
  ])
]);