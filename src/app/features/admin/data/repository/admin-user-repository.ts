import { Injectable } from '@angular/core';
import { AdminUser } from '../models/admin-user.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../../../core/enviroments';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminUserRepository {
  private apiUrl = environments.apiLogin;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.apiUrl);
  }

  getById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  getByEmail(email: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/by-email/${email}`);
  }

  create(user: Omit<AdminUser, 'id'>): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.apiUrl, user);
  }

  update(id: number, user: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

  setUser(user: AdminUser): void {
    const userWithRole = { ...user, rol: 'admin' };
    localStorage.setItem('admin_user', JSON.stringify(userWithRole));
  }

  getUser(): AdminUser | null {
    const data = localStorage.getItem('admin_user');
    if (!data) return null;
    const user = JSON.parse(data);
    return { ...user, rol: 'admin' };
  }

  removeUser(): void {
    localStorage.removeItem('admin_user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(request: { email: string; password: string }): Observable<{ user: AdminUser; token: string }> {
    const requestWithRole = { ...request, rol: 'admin' };
    console.log('Login request:', requestWithRole);
    console.log('Login endpoint:', this.apiUrl);
    return this.http.post<any>(
      this.apiUrl,
      requestWithRole,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(resp => {
        const data = resp.data ? resp.data : resp;
        return {
          ...data,
          user: { ...data.user, rol: 'admin' }
        };
      })
    );
  }
}
