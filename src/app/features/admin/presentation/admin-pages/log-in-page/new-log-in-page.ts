import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../../../components/log-in/log-in.component';

@Component({
  selector: 'app-new-login-page',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  templateUrl: './new-log-in-page.html',
  styleUrls: ['./new-log-in-page.scss'],
})
export class NewLoginPageComponent {
  constructor() {}
}
