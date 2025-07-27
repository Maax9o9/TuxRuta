import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DailyResume } from '../models/daily-resume-route.model';
import { environments } from '../../../../../core/enviroments';

@Injectable({
  providedIn: 'root'
})
export class DailyResumeRepository {
  private apiUrl = environments.apiMetricasDiarias;
  private apiUrlRango = environments.apiMetricasRango;

  constructor(private http: HttpClient) {}
getByRouteId(year: number, month: number, routeId: number): Observable<DailyResume[]> {
  // Construir la URL con los parámetros año, mes y ruta_id
  const formattedMonth = month.toString().padStart(2, '0');
  console.log(`Fetching data for año: ${year}, mes: ${formattedMonth}, ruta_id: ${routeId}`);
  return this.http.get<DailyResume[]>(`${this.apiUrl}?año=${year}&mes=${formattedMonth}&ruta_id=${routeId}`);
}

// Nuevo método para obtener por fecha específica y ruta
getByDateAndRoute(date: string, routeId: number): Observable<DailyResume[]> {
  // date debe estar en formato YYYY-MM-DD
  console.log(`Fetching data for fecha: ${date}, ruta_id: ${routeId}`);
  return this.http.get<DailyResume[]>(`${this.apiUrl}?fecha=${date}&ruta_id=${routeId}`);
}

getByDateRange(startDate: string, endDate: string, routeId: number): Observable<DailyResume[]> {
  // startDate y endDate deben estar en formato YYYY-MM-DD
  console.log(`Fetching data for rango de fechas: ${startDate} a ${endDate}, ruta_id: ${routeId}`);
  return this.http.get<DailyResume[]>(`${this.apiUrlRango}?fecha_inicio=${startDate}&fecha_fin=${endDate}&ruta_id=${routeId}`);

}

}