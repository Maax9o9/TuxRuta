import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Colective } from '../models/colective.model';
import { environments } from '../../../../../core/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ColectiveRepository {
  private apiUrl = environments.apiColectivo;
  private apiUrlAll = environments.apiColectivos;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(token?: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAll(token?: string) {
    return this.http.get<Colective[]>(this.apiUrlAll, {
      headers: this.getAuthHeaders(token)
    });
  }

  getById(id: number, token?: string) {
    return this.http.get<Colective>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    });
  }

  create(colective: Omit<Colective, 'id'>, token?: string) {
    return this.http.post<Colective>(this.apiUrl, colective, {
      headers: this.getAuthHeaders(token)
    });
  }

  update(id: number, colective: Partial<Colective>, token?: string) {
    return this.http.put<Colective>(`${this.apiUrl}/${id}`, colective, {
      headers: this.getAuthHeaders(token)
    });
  }

  delete(id: number, token?: string) {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token)
    });
  }
}
