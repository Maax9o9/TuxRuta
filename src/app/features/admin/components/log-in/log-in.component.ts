import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  login() {
    console.log('Correo:', this.email);
    console.log('Contraseña:', this.password);
  }
}
