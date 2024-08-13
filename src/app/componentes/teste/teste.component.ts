import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-teste',
  standalone: true,
  imports: [MatIconModule,
    MatSlideToggle
  ],
  templateUrl: './teste.component.html',
  styleUrl: './teste.component.scss'
})
export class TesteComponent {

}
