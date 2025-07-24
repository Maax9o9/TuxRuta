import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginAdminUserUseCase, LoginRequest } from '../../domain/admin-user/login-admin-user.use-case';
import { AdminUserRepository } from '../../data/repository/admin-user-repository';
import { Router } from '@angular/router';

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
  loading = false;
  error: string | null = null;
  private loginUseCase: LoginAdminUserUseCase;

  constructor(private router: Router, private adminUserRepository: AdminUserRepository) {
    this.loginUseCase = new LoginAdminUserUseCase(this.adminUserRepository);
  }

  login() {
    this.loading = true;
    this.error = null;
    const request: LoginRequest = {
      email: this.email,
      password: this.password
    };
    this.loginUseCase.execute(request).subscribe({
      next: (resp: any) => {
        console.log('Respuesta completa del login:', resp);
        let user, token;
        if (resp && resp.data && resp.data.user && resp.data.token) {
          user = resp.data.user;
          token = resp.data.token;
        } else if (resp && resp.user && resp.token) {
          user = resp.user;
          token = resp.token;
        } else {
          this.error = 'Credenciales inválidas';
          this.loading = false;
          return;
        }
        console.log('Token recibido (typeof):', typeof token, token);
        this.adminUserRepository.setToken(token);
        const storedToken = localStorage.getItem('jwt_token');
        console.log('Token guardado en localStorage:', storedToken);
        this.adminUserRepository.setUser(user);
        this.router.navigate(['/admin/dashboard']);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error de autenticación';
        this.loading = false;
      }
    });
  }
}
