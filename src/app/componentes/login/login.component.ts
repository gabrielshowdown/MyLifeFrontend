import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  //Atribrutos
  formulario!: FormGroup;
  loginError!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private service: LoginService
  ){}

  ngOnInit(): void{
    this.formulario = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.minLength(3),
      ])],
      password: ['', Validators.compose([
        Validators.required, // Não permite branco
        //Validators.pattern(/(.|\s)*\S(.|\s)*/), // Não permite espaços em branco no conteúdo
      ])],
    })
  }

  enableButton(): string {
    if(this.formulario.valid){
      return 'btn btn-enabled'
    }
    else{
      return 'btn btn-disabled';
    }
  }

  logar(): void{
    console.log('Clicou no login');
    console.log(this.formulario.value);
    console.log('usuario valid: ' + this.formulario.get('username')?.valid);
    console.log('senha valid: ' + this.formulario.get('password')?.valid);

    if (this.service.validateLogin(this.formulario.value)){
      this.loginError = false;
      this.router.navigate(['/teste'])
    }
    else{
      this.loginError = true;
    }

  }
}
