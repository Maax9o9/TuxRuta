import { Injectable } from '@angular/core';
import { DailyResume } from '../models/daily-resume-route.model';

@Injectable({
  providedIn: 'root'
})
export class WeeklyResumeRepository {
  
  constructor() {}

  async getAll(): Promise<DailyResume[] | null> {
    try {
      const mockData: DailyResume[] = [
        { 
          id: 1, 
          fecha: '2025-06-02', 
          ruta_id: 1, 
          pasajeros_total: 2450, 
          pasajeros_promedio_por_viaje: 35,
          velocidad_promedio: 58.5,
          hora_pico: '08:30',
          total_viajes: 70,
          total_alertas: 3,
          ocupacion_maxima: 95,
          probabilidad_ocupacion_alta: 0.82,
          intervalo_confianza_velocidad_min: 55,
          intervalo_confianza_velocidad_max: 62
        },
        { 
          id: 2, 
          fecha: '2025-06-09', // Semana 2 de Junio 2025
          ruta_id: 1, 
          pasajeros_total: 2680, 
          pasajeros_promedio_por_viaje: 38,
          velocidad_promedio: 61.2,
          hora_pico: '07:45',
          total_viajes: 71,
          total_alertas: 1,
          ocupacion_maxima: 98,
          probabilidad_ocupacion_alta: 0.89,
          intervalo_confianza_velocidad_min: 58,
          intervalo_confianza_velocidad_max: 64
        },
        { 
          id: 3, 
          fecha: '2025-06-16', // Semana 3 de Junio 2025
          ruta_id: 1, 
          pasajeros_total: 2520, 
          pasajeros_promedio_por_viaje: 36,
          velocidad_promedio: 56.8,
          hora_pico: '08:15',
          total_viajes: 70,
          total_alertas: 2,
          ocupacion_maxima: 92,
          probabilidad_ocupacion_alta: 0.85,
          intervalo_confianza_velocidad_min: 53,
          intervalo_confianza_velocidad_max: 60
        },
        { 
          id: 4, 
          fecha: '2025-06-23', // Semana 4 de Junio 2025
          ruta_id: 1, 
          pasajeros_total: 2750, 
          pasajeros_promedio_por_viaje: 39,
          velocidad_promedio: 59.3,
          hora_pico: '08:00',
          total_viajes: 71,
          total_alertas: 4,
          ocupacion_maxima: 100,
          probabilidad_ocupacion_alta: 0.91,
          intervalo_confianza_velocidad_min: 56,
          intervalo_confianza_velocidad_max: 62
        },
        { 
          id: 5, 
          fecha: '2025-06-30', // Semana 5 de Junio/Julio 2025
          ruta_id: 1, 
          pasajeros_total: 2610, 
          pasajeros_promedio_por_viaje: 37,
          velocidad_promedio: 57.7,
          hora_pico: '08:45',
          total_viajes: 70,
          total_alertas: 2,
          ocupacion_maxima: 94,
          probabilidad_ocupacion_alta: 0.87,
          intervalo_confianza_velocidad_min: 54,
          intervalo_confianza_velocidad_max: 61
        },
        { 
          id: 6, 
          fecha: '2025-07-07', // Semana 1 de Julio 2025
          ruta_id: 1, 
          pasajeros_total: 2420, 
          pasajeros_promedio_por_viaje: 34,
          velocidad_promedio: 60.1,
          hora_pico: '07:30',
          total_viajes: 71,
          total_alertas: 1,
          ocupacion_maxima: 89,
          probabilidad_ocupacion_alta: 0.83,
          intervalo_confianza_velocidad_min: 57,
          intervalo_confianza_velocidad_max: 63
        },
        { 
          id: 7, 
          fecha: '2025-07-14', // Semana 2 de Julio 2025 (semana actual)
          ruta_id: 1, 
          pasajeros_total: 2580, 
          pasajeros_promedio_por_viaje: 37,
          velocidad_promedio: 58.9,
          hora_pico: '08:20',
          total_viajes: 70,
          total_alertas: 3,
          ocupacion_maxima: 96,
          probabilidad_ocupacion_alta: 0.86,
          intervalo_confianza_velocidad_min: 55,
          intervalo_confianza_velocidad_max: 62
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("Weekly Repository: Datos semanales obtenidos exitosamente", mockData);
      return mockData;
      
    } catch (error) {
      console.error("Weekly Repository: Error al obtener datos semanales", error);
      return null;
    }
  }

  // Método para obtener datos por año específico
  async getByYear(year: number): Promise<DailyResume[] | null> {
    const allData = await this.getAll();
    if (!allData) return null;
    
    return allData.filter(item => new Date(item.fecha).getFullYear() === year);
  }

  // Método para obtener datos por mes específico (con rango de 7 semanas)
  async getByMonth(year: number, month: number): Promise<DailyResume[] | null> {
    const allData = await this.getAll();
    if (!allData) return null;
    
    // Filtrar datos que estén cerca del mes seleccionado (±3 meses)
    return allData.filter(item => {
      const itemDate = new Date(item.fecha);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      return itemYear === year && Math.abs(itemMonth - month) <= 3;
    }).slice(0, 7); // Limitar a 7 registros
  }
}
