import { Injectable } from '@angular/core';
import { Route } from '../models/route.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from '../../../../../core/enviroments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RouteRepository {
  private apiUrl = environments.apiRuta;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Route[]> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Route[]>(this.apiUrl, { headers });
  }

  create(route: Omit<Route, 'id' | 'creado_en' | 'modificado_en'>): Observable<Route> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<Route>(this.apiUrl, route, { headers });
  }

  update(id: number, route: Partial<Route>): Observable<Route> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.put<Route>(`${this.apiUrl}/${id}`, route, { headers });
  }

  delete(id: number): Observable<void> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  getById(id: number): Observable<Route> {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Route>(`${this.apiUrl}/${id}`, { headers });
  }
}
