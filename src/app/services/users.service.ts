import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';
import { DebugService } from './debug.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly API_USERS = 'http://localhost:8080/users';

  constructor(private http: HttpClient, private debugService: DebugService,) { }

  // Retorna todos os usuários cadastrados
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_USERS);
  }

  validateLogin(credentials: { username: string; senha: string }): Observable<boolean> {
    this.debugService.log('credentials:' , credentials);

    return this.http.post<boolean>(`${this.API_USERS}/validate`, credentials);
  }

  registerUser(user: User): Observable<User>{
    this.debugService.log('user: ', user);
    return this.http.post<User>(`${this.API_USERS}`, user);
  }

}
