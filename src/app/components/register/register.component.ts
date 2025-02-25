import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { birthdayValidator } from '../../validations/dateValidator';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/user';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { DebugService } from '../../services/debug.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatSlideToggle,
    MatSlideToggleModule,
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent implements OnInit, OnDestroy {

  // Atributos
  passwordsDifferents!: boolean;
  userAlreadyRegistered!: boolean;
  afterRequestRegister!: boolean;
  theme : String = 'day';
  formulario!: FormGroup;
  password: string = '';
  today = new Date();
  typeMessage : String = "alert-success";
  msgAfterClickRegister: String = "Usuário cadastrado com sucesso!"
  sun : string;
  moon: string;
  subscription!: Subscription;

  passwordFieldType = {
    password: 'password',
    confirmPassword: 'password'
  };

  passwordVisibility = {
    password: 'visibility',
    confirmPassword: 'visibility'
  };

  @ViewChild('darkModeSwitch', { read: ElementRef }) element: ElementRef | undefined;

  //Construtor
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private service: UsersService,
    private themeService: ThemeService,
    private debugService: DebugService,

  ) {
    this.theme = this.themeService.getTimeOfDay();
    this.sun = this.themeService.getSun();
    this.moon = this.themeService.getMoon();
  }

  ngOnInit(): void {
    // this.maxDate = today.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
    // Formulário reativo (as aspas vazias '' é o valor inicial do campo)
    this.formulario = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3),]], // minusculoValidator só aceitaria minusculo
      password: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/(.|\s)*\S(.|\s)*/),]],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern(/(.|\s)*\S(.|\s)*/)])], // Compose não é obrigatório
      gender: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      birthdate: ['', Validators.compose([Validators.required, birthdayValidator])],
    });
  }

  ngAfterViewInit() {
    if (this.element){
    //   this.element.nativeElement.querySelector('.mdc-switch__icon--off').firstChild.setAttribute('d', this.sun);
    //   this.element.nativeElement.querySelector('.mdc-switch__icon--on').firstChild.setAttribute('d', this.moon);
      this.themeService.configureDarkModeSwitch(this.element);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe(); // // O ? indica que pode ser undefined, caso não seja usado ele no processo
  }

  cadastrar(): void {

    this.clearMessages();

    if (this.formulario.get('password')?.value != this.formulario.get('confirmPassword')?.value){
      this.passwordsDifferents = true;
    }
    else {
      if (this.formulario.valid) {
        this.debugService.log('Dados do formulário:', this.formulario.value);

        const credentials = {
          username: this.formulario.get('username')?.value,
          senha: this.formulario.get('password')?.value,
          genero: this.formulario.get('gender')?.value,
          localizacao: this.formulario.get('location')?.value,
          dataNascimento: this.formulario.get('birthdate')?.value,
        }

        const user: User = {
          //id: 0, // ou undefined, caso o backend trate isso automaticamente
          ...credentials
        };

        this.debugService.log('Credentials ao cadastrar : ' , user);
        this.subscription =
        this.service.registerUser(user).subscribe({
          next: (user) => {
            this.debugService.log('User retornado:' , user);
            this.showStatusRequestMsg("success");
            this.clearForm();
          },
          error: (err) => {
            if (err.status === 409){
              console.error('Erro ao cadastrar usuário:', err);
              this.userAlreadyRegistered = true;
            }
            else{
              this.showStatusRequestMsg("error")
            }
          },
        });
      }
    }
  }

  showStatusRequestMsg(status : string) {
    // Se o status for success , faz o
    this.typeMessage = (status === 'success' ? "alert-success" : 'alert-danger');
    this.msgAfterClickRegister = status === 'success' ? "Usuário cadastrado com sucesso!" : 'Erro ao registrar';
    this.afterRequestRegister = true;
  }

  backLogin(): void{
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    this.passwordFieldType[field] = this.passwordFieldType[field] === 'password' ? 'text' : 'password';
    this.passwordVisibility[field] = this.passwordVisibility[field] === 'visibility' ? 'visibility_off' : 'visibility';
  }

  onToggleChange(event: any): void {
    this.theme = this.themeService.setTheme(event.checked)
    //this.theme = event.checked ? 'night' : 'day';
  }

  enableButton(): string {
    if(this.formulario.valid){
      return 'btn btn-enabled'
    }
    else{
      return 'btn btn-disabled';
    }
  }

  clearForm(): void {
    // Fazer campo a campo
    // this.formulario.get('username')?.reset();

    /* Se fizer apenas o this.formulario.reset() funciona certinho, porém mostra a mensagem no console log:
    Cannot read properties of null (reading 'length') at RegisterComponent_Template" */

    this.formulario.reset({
      username: '',
      password: '',
      confirmPassword: '',
      gender: '',
      location: '',
      birthdate: ''
    });
  }

  clearMessages(): void {
    this.userAlreadyRegistered = false;
    this.afterRequestRegister = false;
    this.passwordsDifferents = false;
  }

}
