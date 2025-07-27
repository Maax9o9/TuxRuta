import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MonthlyResume } from '../models/monthly-comparative.model';
import { environments } from '../../../../../core/enviroments';

@Injectable({
  providedIn: 'root'
})
export class MonthlyResumeRepository {
  private apiUrl = environments.apiMetricas;

  constructor(private http: HttpClient) {}

  getByRouteId(year: number, month: number, routeId: number): Observable<MonthlyResume[]> {
    // Construir la URL con los parámetros año, mes y ruta_id
    const formattedMonth = month.toString().padStart(2, '0'); // Asegura que el mes tenga dos dígitos

    console.log(`Fetching data for año: ${year}, mes: ${formattedMonth}, ruta_id: ${routeId}`);

    // Realizar la solicitud GET con los parámetros 'año', 'mes' y 'ruta_id'
    return this.http.get<MonthlyResume[]>(`${this.apiUrl}?año=${year}&mes=${formattedMonth}&ruta_id=${routeId}`);
  }
}