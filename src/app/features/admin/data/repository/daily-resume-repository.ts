import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DailyResume } from '../models/daily-resume-route.model';

@Injectable({
  providedIn: 'root'
})
export class DailyResumeRepository {
  private apiUrl = 'https://api.example.com/daily-resume'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<DailyResume[]> {
    return this.http.get<DailyResume[]>(this.apiUrl);
  }

  getByYear(year: number): Observable<DailyResume[]> {
    return this.http.get<DailyResume[]>(`${this.apiUrl}?year=${year}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}