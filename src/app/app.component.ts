import { Component } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { routeTransition } from './animations/animations'; // Importe a animação criada

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    animations: [routeTransition]
})
export class AppComponent {
  title = 'MyLife';

  // Injeta o contexto das rotas para sabermos quando a rota muda
  constructor(private contexts: ChildrenOutletContexts) {}

  // Pega o nome da rota atual para servir de "gatilho" para a animação
  getRouteAnimationData() {
    // Acessamos o snapshot da rota ativa e pegamos o path configurado
    return this.contexts.getContext('primary')?.route?.snapshot?.routeConfig?.path;
  }
}