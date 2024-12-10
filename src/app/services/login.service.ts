import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly API_USERS = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_USERS);
  }

  validateLogin(credentials: { username: string; senha: string }): Observable<boolean> {
    console.log('credentials:' , credentials);

    return this.http.post<boolean>(`${this.API_USERS}/validate`, credentials);
  }

}
