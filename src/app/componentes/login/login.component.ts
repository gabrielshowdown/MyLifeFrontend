import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
  ){}

  ngOnInit(): void{
    this.formulario = this.formBuilder.group({
      usuario: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.minLength(3),
      ])],
      senha: ['', Validators.compose([
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
    //console.log('Clicou no login');
    console.log(this.formulario);
    console.log('usuario valid: ' + this.formulario.get('usuario')?.valid);
    console.log(this.formulario.get('senha')?.value);
    console.log(this.formulario.valid);
    this.router.navigate(['/teste'])

  }
}
