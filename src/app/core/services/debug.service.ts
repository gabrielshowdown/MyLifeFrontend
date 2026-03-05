import { Injectable } from '@angular/core';
import { debugMode, desenvMode } from '../../config/parameters';

@Injectable({
  providedIn: 'root' // Garante que o serviço seja um singleton
})

export class DebugService {

  constructor() {}

  // Método para logar mensagens apenas se o debug estiver ativo
  log(message: string, ...optionalParams: any[]): void {
    if (debugMode) {
      console.log(message, ...optionalParams);
    }
  }

  getAPI() : string {
    if (desenvMode){
      /* API do Json Server */
      return 'http://localhost:3000'
    }
    else{
      return 'http://localhost:8080'
    }
  }
}
