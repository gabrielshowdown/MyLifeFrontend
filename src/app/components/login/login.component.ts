import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { TemplateModalComponent } from "../views/template-modal/template-modal.component";
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../config/theme.service';
import { Subscription } from 'rxjs';
import { DebugService } from '../../config/debug.service';
import { shakeTrigger } from '../../animations/animations';

@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        TemplateModalComponent,
        MatIconModule,
        MatSlideToggle,
        MatSlideToggleModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    animations: [shakeTrigger]
})
export class LoginComponent implements OnInit, OnDestroy{

  // Atribrutos
  form!: FormGroup;
  loginError!: boolean;
  openModal!: boolean;
  password: string = '';
  passwordFieldType: string = 'password';
  passwordVisibility: string = 'visibility';
  theme = 'day';
  sun : string;
  moon: string;
  subscription!: Subscription;
  messageErrorLogin: string = '';

  forgotPasswordMessage = {
    title: 'Esqueceu sua senha? ',
    content: 'Chama o Gabriel no zap que ele resolve :)'
   };

  @ViewChild('darkModeSwitch', { read: ElementRef }) element: ElementRef | undefined;
  // sun = 'M12 15.5q1.45 0 2.475-1.025Q15.5 13.45 15.5 12q0-1.45-1.025-2.475Q13.45 8.5 12 8.5q-1.45 0-2.475 1.025Q8.5 10.55 8.5 12q0 1.45 1.025 2.475Q10.55 15.5 12 15.5Zm0 1.5q-2.075 0-3.537-1.463T7 12q0-2.075 1.463-3.537T12 7q2.075 0 3.537 1.463T17 12q0 2.075-1.463 3.537T12 17ZM1.75 12.75q-.325 0-.538-.213Q1 12.325 1 12q0-.325.212-.537Q1.425 11.25 1.75 11.25h2.5q.325 0 .537.213Q5 11.675 5 12q0 .325-.213.537-.213.213-.537.213Zm18 0q-.325 0-.538-.213Q19 12.325 19 12q0-.325.212-.537.212-.213.538-.213h2.5q.325 0 .538.213Q23 11.675 23 12q0 .325-.212.537-.212.213-.538.213ZM12 5q-.325 0-.537-.213Q11.25 4.575 11.25 4.25v-2.5q0-.325.213-.538Q11.675 1 12 1q.325 0 .537.212 .213.212 .213.538v2.5q0 .325-.213.537Q12.325 5 12 5Zm0 18q-.325 0-.537-.212-.213-.212-.213-.538v-2.5q0-.325.213-.538Q11.675 19 12 19q.325 0 .537.212 .213.212 .213.538v2.5q0 .325-.213.538Q12.325 23 12 23ZM6 7.05l-1.425-1.4q-.225-.225-.213-.537.013-.312.213-.537.225-.225.537-.225t.537.225L7.05 6q.2.225 .2.525 0 .3-.2.5-.2.225-.513.225-.312 0-.537-.2Zm12.35 12.375L16.95 18q-.2-.225-.2-.538t.225-.512q.2-.225.5-.225t.525.225l1.425 1.4q.225.225 .212.538-.012.313-.212.538-.225.225-.538.225t-.538-.225ZM16.95 7.05q-.225-.225-.225-.525 0-.3.225-.525l1.4-1.425q.225-.225.538-.213.313 .013.538 .213.225 .225.225 .537t-.225.537L18 7.05q-.2.2-.512.2-.312 0-.538-.2ZM4.575 19.425q-.225-.225-.225-.538t.225-.538L6 16.95q.225-.225.525-.225.3 0 .525.225 .225.225 .225.525 0 .3-.225.525l-1.4 1.425q-.225.225-.537.212-.312-.012-.537-.212ZM12 12Z'
  // moon ='M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.2 0 .425.013 .225.013 .575.038-.9.8-1.4 1.975-.5 1.175-.5 2.475 0 2.25 1.575 3.825Q14.25 12.9 16.5 12.9q1.3 0 2.475-.463T20.95 11.15q.025.3 .038.488Q21 11.825 21 12q0 3.75-2.625 6.375T12 21Zm0-1.5q2.725 0 4.75-1.687t2.525-3.963q-.625.275-1.337.412Q17.225 14.4 16.5 14.4q-2.875 0-4.887-2.013T9.6 7.5q0-.6.125-1.287.125-.687.45-1.562-2.45.675-4.062 2.738Q4.5 9.45 4.5 12q0 3.125 2.188 5.313T12 19.5Zm-.1-7.425Z'

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private service: UsersService,
    private themeService: ThemeService,
    private debugService: DebugService,
  ){
    this.sun = this.themeService.getSun();
    this.moon = this.themeService.getMoon();
  }

  ngOnInit(): void{
    this.theme = this.themeService.getTheme() == undefined ? this.themeService.getTimeOfDay() : this.themeService.getTheme();

    this.form = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.minLength(3),
      ])],
      password: ['', Validators.compose([
        Validators.required, // Não permite branco
        Validators.minLength(3),
        //Validators.pattern(/(.|\s)*\S(.|\s)*/), // Não permite espaços em branco no conteúdo
      ])],
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe(); // O ? indica que pode ser undefined, caso não seja usado ele no processo
  }

  ngAfterViewInit() {
    if (this.element){
      // this.element.nativeElement.querySelector('.mdc-switch__icon--off').firstChild.setAttribute('d', this.sun);
      // this.element.nativeElement.querySelector('.mdc-switch__icon--on').firstChild.setAttribute('d', this.moon);
      this.themeService.configureDarkModeSwitch(this.element);
    }
  }

  enableButton(): string {
    if(this.form.valid){
      return 'btn btn-enabled'
    }
    else{
      return 'btn btn-disabled';
    }
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.passwordVisibility = this.passwordVisibility === 'visibility' ? 'visibility_off' : 'visibility'
  }

  register(): void{
    this.themeService.setTheme(this.theme);
    this.router.navigate(['/register']);
  }

  login(): void{

    this.clearMessages();

    this.debugService.log(this.form.value);
    this.debugService.log('usuario valid: ' + this.form.get('username')?.valid);
    this.debugService.log('senha valid: ' + this.form.get('password')?.valid);

    // const credentials = this.form.value;
    /* Se deixar assim como no trecho acima vai gerar o json dessa forma:
    {username: 'super', password: 'super'}
    e como na interface e no banco é 'senha' no lugar de 'password', da pau. */

    const credentials = {
      username: this.form.get('username')?.value,
      senha: this.form.get('password')?.value
    }

    this.debugService.log('Credentials do logar : ' , credentials);
    this.subscription =
    this.service.validateLogin(credentials).subscribe({
      next: (user) => {
        this.debugService.log('User:' , user);
        this.loginError = false;
        this.router.navigate(['/teste']);
      },
      error: (err) => {
        console.error('Erro ao validar login:', err);
        this.loginError = true;
         if (err.status === 0) {
        // Erro de conexão com o backend
        this.messageErrorLogin = 'Não foi possível conectar ao servidor';
      } 
      else if (err.status === 401) {
        // Usuário ou senha inválidos
        this.messageErrorLogin = 'Usuário ou senha incorretos.';
      } 
      else {
        // Outros erros
        this.messageErrorLogin = `Erro inesperado (${err.status}): ${err.message}`;
      }
      },
    });

    // this.service.getUsers().subscribe({
    //   next: (users) => {
    //     this.debugService.log(users); // Manipulação de sucesso
    //   },
    //   error: (error) => {
    //     console.error('Erro ao buscar usuários:', error); // Manipulação de erro
    //   },
    //   complete: () => {
    //     this.debugService.log('Busca de usuários concluída.'); // (Opcional) Finalização do Observable
    //   }
    // });

  }

  onToggleChange(event: any): void {
    // this.theme = event.checked ? 'night' : 'day';
    this.theme = this.themeService.changeTheme(event.checked)
  }

    clearMessages(): void {
    this.loginError = false;
  }

}
