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

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(100, [
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const routeTransition = trigger('routeTransition', [
  // O asterisco (*) significa que vai animar de QUALQUER rota para QUALQUER rota
  transition('* <=> *', [
    // Prepara os componentes que estão entrando e saindo para ficarem sobrepostos
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    
    // Anima o componente que está entrando (faz um fade-in suave)
    query(':enter', [
      animate('400ms ease-in-out', style({ opacity: 1 }))
    ], { optional: true })
  ])
]);