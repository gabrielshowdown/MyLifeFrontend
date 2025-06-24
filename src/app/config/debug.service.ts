import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Garante que o serviço seja um singleton
})
export class DebugService {

  private debugMode: boolean = true;

  constructor() {}

  // Método para logar mensagens apenas se o debug estiver ativo
  log(message: string, ...optionalParams: any[]): void {
    if (this.debugMode) {
      console.log(message, ...optionalParams);
    }
  }
}
