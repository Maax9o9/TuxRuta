import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MonthlyResume } from '../models/monthly-comparative.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlyResumeRepository {
  getByRouteId(routeId: number): Observable<MonthlyResume[]> {
    return this.http.get<MonthlyResume[]>(`${this.apiUrl}?routeId=${routeId}`);
  }
  private apiUrl = 'https://api.example.com/monthly-resume'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<MonthlyResume[]> {
    return this.http.get<MonthlyResume[]>(this.apiUrl);
  }

  getByYear(year: number): Observable<MonthlyResume[]> {
    return this.http.get<MonthlyResume[]>(`${this.apiUrl}?year=${year}`);
  }

  getByMonthRange(year: number, month: number): Observable<MonthlyResume[]> {
    return this.http.get<MonthlyResume[]>(`${this.apiUrl}?year=${year}&month=${month}`);
  }

  getById(id: number): Observable<MonthlyResume> {
    return this.http.get<MonthlyResume>(`${this.apiUrl}/${id}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}