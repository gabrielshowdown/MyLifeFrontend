import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  //Atribrutos
  formulario!: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ){}

  ngOnInit(): void{
    this.formulario = this.formBuilder.group({
      usuario: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.pattern(/(.|\s)*\S(.|\s)*/), // Não permite espaços em branco no conteúdo
        Validators.minLength(3),
      ])],
      senha: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.pattern(/(.|\s)*\S(.|\s)*/), // Não permite espaços em branco no conteúdo
      ])],
    })
  }

  logar(): void{
    console.log('Clicou no login');
    //console.log(this.formulario);
    console.log(this.formulario.get('usuario')?.value);
    console.log(this.formulario.valid);

  }
}
