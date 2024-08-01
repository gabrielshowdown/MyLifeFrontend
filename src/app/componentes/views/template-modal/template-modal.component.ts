import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-template-modal',
  standalone: true,
  imports: [],
  templateUrl: './template-modal.component.html',
  styleUrl: './template-modal.component.scss'
})
export class TemplateModalComponent {

  @Input()
  message: {
    title: string,
    content: string
  } = {
    title: '', content: '' };


  constructor(){}

}
