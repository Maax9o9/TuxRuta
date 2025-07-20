import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DailyResume } from '../models/daily-resume-route.model';

@Injectable({
  providedIn: 'root'
})
export class DailyResumeRepository {
  
  constructor() {}

  async getAll(): Promise<DailyResume[] | null> {
    try {
      const mockData: DailyResume[] = [
        { 
          id: 1, 
          fecha: '2025-07-01', 
          ruta_id: 1, 
          pasajeros_total: 450, 
          pasajeros_promedio_por_viaje: 25, 
          velocidad_promedio: 55, 
          hora_pico: '08:00', 
          total_viajes: 18,
          total_alertas: 3,
          ocupacion_maxima: 85,
          probabilidad_ocupacion_alta: 0.75,
          intervalo_confianza_velocidad_min: 50,
          intervalo_confianza_velocidad_max: 60
        },
        { 
          id: 2, 
          fecha: '2025-07-02', 
          ruta_id: 1, 
          pasajeros_total: 504, 
          pasajeros_promedio_por_viaje: 28, 
          velocidad_promedio: 70, 
          hora_pico: '07:30', 
          total_viajes: 18,
          total_alertas: 1,
          ocupacion_maxima: 92,
          probabilidad_ocupacion_alta: 0.85,
          intervalo_confianza_velocidad_min: 65,
          intervalo_confianza_velocidad_max: 75
        },
        { 
          id: 3, 
          fecha: '2025-07-03', 
          ruta_id: 1, 
          pasajeros_total: 332, 
          pasajeros_promedio_por_viaje: 24, 
          velocidad_promedio: 62, 
          hora_pico: '08:15', 
          total_viajes: 14,
          total_alertas: 2,
          ocupacion_maxima: 78,
          probabilidad_ocupacion_alta: 0.68,
          intervalo_confianza_velocidad_min: 58,
          intervalo_confianza_velocidad_max: 66
        },
        { 
          id: 4, 
          fecha: '2025-07-04', 
          ruta_id: 1, 
          pasajeros_total: 240, 
          pasajeros_promedio_por_viaje: 30, 
          velocidad_promedio: 48, 
          hora_pico: '08:45', 
          total_viajes: 8,
          total_alertas: 5,
          ocupacion_maxima: 95,
          probabilidad_ocupacion_alta: 0.92,
          intervalo_confianza_velocidad_min: 44,
          intervalo_confianza_velocidad_max: 52
        },
        { 
          id: 5, 
          fecha: '2025-07-05', 
          ruta_id: 1, 
          pasajeros_total: 480, 
          pasajeros_promedio_por_viaje: 27, 
          velocidad_promedio: 58, 
          hora_pico: '08:10', 
          total_viajes: 18,
          total_alertas: 2,
          ocupacion_maxima: 88,
          probabilidad_ocupacion_alta: 0.78,
          intervalo_confianza_velocidad_min: 54,
          intervalo_confianza_velocidad_max: 62
        },
        { 
          id: 6, 
          fecha: '2025-07-06', 
          ruta_id: 1, 
          pasajeros_total: 420, 
          pasajeros_promedio_por_viaje: 26, 
          velocidad_promedio: 65, 
          hora_pico: '07:45', 
          total_viajes: 16,
          total_alertas: 1,
          ocupacion_maxima: 89,
          probabilidad_ocupacion_alta: 0.82,
          intervalo_confianza_velocidad_min: 61,
          intervalo_confianza_velocidad_max: 69
        },
        { 
          id: 7, 
          fecha: '2025-07-07', 
          ruta_id: 1, 
          pasajeros_total: 380, 
          pasajeros_promedio_por_viaje: 23, 
          velocidad_promedio: 52, 
          hora_pico: '08:20', 
          total_viajes: 17,
          total_alertas: 4,
          ocupacion_maxima: 76,
          probabilidad_ocupacion_alta: 0.71,
          intervalo_confianza_velocidad_min: 48,
          intervalo_confianza_velocidad_max: 56
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("Repository: Datos obtenidos exitosamente", mockData);
      return mockData;
      
    } catch (error) {
      console.error("Repository: Error al obtener datos", error);
      return null;
    }
  }

  // Método para obtener datos por año específico
  async getByYear(year: number): Promise<DailyResume[] | null> {
    try {
      const allData = await this.getAll();
      if (!allData) return null;
      
      return allData.filter(item => new Date(item.fecha).getFullYear() === year);
    } catch (error) {
      console.error("Daily Repository: Error al obtener datos por año", error);
      return null;
    }
  }

}