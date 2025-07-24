import { Injectable } from '@angular/core';
import { Stop } from '../models/stop.model';
import { environments } from '../../../../../core/enviroments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StopRepository {
  private apiUrl = environments.apiParadas;

  constructor(private http: HttpClient) {}

  private getHeaders(token?: string): HttpHeaders {
    const jwt = token ?? localStorage.getItem('jwt_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${jwt}` });
  }

  getAll(token?: string): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.apiUrl, { headers: this.getHeaders(token) });
  }

  getById(id: number, token?: string): Observable<Stop> {
    return this.http.get<Stop>(`${this.apiUrl}/${id}`, { headers: this.getHeaders(token) });
  }

  create(stop: Omit<Stop, 'id'>, token?: string): Observable<Stop> {
    return this.http.post<Stop>(this.apiUrl, stop, { headers: this.getHeaders(token) });
  }

  update(id: number, stop: Partial<Stop>, token?: string): Observable<Stop> {
    return this.http.put<Stop>(`${this.apiUrl}/${id}`, stop, { headers: this.getHeaders(token) });
  }

  delete(id: number, token?: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders(token) });
  }
}
