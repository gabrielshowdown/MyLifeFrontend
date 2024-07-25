import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {


  constructor() { }

  validateLogin(credentials: { username: string; password: string }) : boolean{
    const { username, password } = credentials
    if (username === 'gabriel' && password === 'senha123'){
      return true;
    }
    else {
      return false;
    }
  }

}
