import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';
import { DebugService } from '../config/debug.service';
import { desenvMode } from '../config/parameters';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  /* A API do Json Server não aceita endpoins customizados, apenas GET/POST padrão */
  private readonly API_USERS = 'http://localhost:8080/users';
  private readonly API_USERS_DEV = 'http://localhost:3000/users';
  private API: string = '';

  constructor(private http: HttpClient, private debugService: DebugService,) { }

  // Retorna todos os usuários cadastrados
  getUsers(): Observable<User[]> {
    !desenvMode ? this.API = this.API_USERS : this.API = this.API_USERS_DEV
    return this.http.get<User[]>(this.API);
  }

  validateLogin(credentials: { username: string; senha: string }): Observable<boolean> {
    this.debugService.log('credentials:' , credentials);

    return this.http.post<boolean>(`${this.API_USERS}/validate`, credentials);
  }

  registerUser(user: User): Observable<User>{
    this.debugService.log('user: ', user);
    console.log(desenvMode);

    !desenvMode ? this.API = this.API_USERS : this.API = this.API_USERS_DEV
    return this.http.post<User>(`${this.API}`, user);
  }

}
