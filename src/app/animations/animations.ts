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