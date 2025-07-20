import { Injectable } from '@angular/core';
import { MonthlyResume } from '../models/monthly-comparative.model';

@Injectable({
  providedIn: 'root'
})
export class MonthlyResumeRepository {
  
  constructor() {}

  async getAll(): Promise<MonthlyResume[] | null> {
    try {
      const mockData: MonthlyResume[] = [
        { 
          id: 1, 
          mes: 10, 
          año: 2024, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 380, 
          pasajeros_total_mes: 11780, 
          mejor_dia_semana: 2, // Martes
          peor_rendimiento_dia: 'Domingo', 
          crecimiento_porcentual: 5.2,
          velocidad_promedio_mes: 56,
          alertas_total_mes: 42,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.75,
          intervalo_confianza_velocidad_min: 52,
          intervalo_confianza_velocidad_max: 60
        },
        { 
          id: 2, 
          mes: 11, 
          año: 2024, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 395, 
          pasajeros_total_mes: 11850, 
          mejor_dia_semana: 3, // Miércoles
          peor_rendimiento_dia: 'Sábado', 
          crecimiento_porcentual: 3.9,
          velocidad_promedio_mes: 58,
          alertas_total_mes: 38,
          dias_activos: 30,
          probabilidad_ocupacion_alta: 0.77,
          intervalo_confianza_velocidad_min: 54,
          intervalo_confianza_velocidad_max: 62
        },
        { 
          id: 3, 
          mes: 12, 
          año: 2024, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 410, 
          pasajeros_total_mes: 12710, 
          mejor_dia_semana: 4, // Jueves
          peor_rendimiento_dia: 'Lunes', 
          crecimiento_porcentual: 3.8,
          velocidad_promedio_mes: 55,
          alertas_total_mes: 45,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.79,
          intervalo_confianza_velocidad_min: 51,
          intervalo_confianza_velocidad_max: 59
        },
        // 2025 Data
        { 
          id: 4, 
          mes: 1, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 420, 
          pasajeros_total_mes: 13020, 
          mejor_dia_semana: 2, // Martes
          peor_rendimiento_dia: 'Domingo', 
          crecimiento_porcentual: 12.5,
          velocidad_promedio_mes: 58,
          alertas_total_mes: 45,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.78,
          intervalo_confianza_velocidad_min: 52,
          intervalo_confianza_velocidad_max: 64
        },
        { 
          id: 5, 
          mes: 2, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 385, 
          pasajeros_total_mes: 10780, 
          mejor_dia_semana: 3, // Miércoles
          peor_rendimiento_dia: 'Sábado', 
          crecimiento_porcentual: -8.3,
          velocidad_promedio_mes: 62,
          alertas_total_mes: 28,
          dias_activos: 28,
          probabilidad_ocupacion_alta: 0.72,
          intervalo_confianza_velocidad_min: 58,
          intervalo_confianza_velocidad_max: 66
        },
        { 
          id: 6, 
          mes: 3, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 465, 
          pasajeros_total_mes: 14415, 
          mejor_dia_semana: 4, // Jueves
          peor_rendimiento_dia: 'Lunes', 
          crecimiento_porcentual: 20.8,
          velocidad_promedio_mes: 55,
          alertas_total_mes: 52,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.85,
          intervalo_confianza_velocidad_min: 50,
          intervalo_confianza_velocidad_max: 60
        },
        { 
          id: 7, 
          mes: 4, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 445, 
          pasajeros_total_mes: 13350, 
          mejor_dia_semana: 5, // Viernes
          peor_rendimiento_dia: 'Miércoles', 
          crecimiento_porcentual: -4.3,
          velocidad_promedio_mes: 60,
          alertas_total_mes: 38,
          dias_activos: 30,
          probabilidad_ocupacion_alta: 0.80,
          intervalo_confianza_velocidad_min: 56,
          intervalo_confianza_velocidad_max: 64
        },
        { 
          id: 8, 
          mes: 5, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 490, 
          pasajeros_total_mes: 15190, 
          mejor_dia_semana: 2, // Martes
          peor_rendimiento_dia: 'Domingo', 
          crecimiento_porcentual: 10.1,
          velocidad_promedio_mes: 57,
          alertas_total_mes: 42,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.88,
          intervalo_confianza_velocidad_min: 53,
          intervalo_confianza_velocidad_max: 61
        },
        { 
          id: 9, 
          mes: 6, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 520, 
          pasajeros_total_mes: 15600, 
          mejor_dia_semana: 1, // Lunes
          peor_rendimiento_dia: 'Viernes', 
          crecimiento_porcentual: 6.1,
          velocidad_promedio_mes: 54,
          alertas_total_mes: 55,
          dias_activos: 30,
          probabilidad_ocupacion_alta: 0.92,
          intervalo_confianza_velocidad_min: 49,
          intervalo_confianza_velocidad_max: 59
        },
        { 
          id: 10, 
          mes: 7, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 480, 
          pasajeros_total_mes: 14880, 
          mejor_dia_semana: 3, // Miércoles
          peor_rendimiento_dia: 'Sábado', 
          crecimiento_porcentual: -7.7,
          velocidad_promedio_mes: 59,
          alertas_total_mes: 35,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.83,
          intervalo_confianza_velocidad_min: 55,
          intervalo_confianza_velocidad_max: 63
        },
        { 
          id: 11, 
          mes: 8, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 510, 
          pasajeros_total_mes: 15810, 
          mejor_dia_semana: 2, 
          peor_rendimiento_dia: 'Domingo', 
          crecimiento_porcentual: 6.3,
          velocidad_promedio_mes: 56,
          alertas_total_mes: 48,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.89,
          intervalo_confianza_velocidad_min: 52,
          intervalo_confianza_velocidad_max: 60
        },
        { 
          id: 12, 
          mes: 9, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 475, 
          pasajeros_total_mes: 14250, 
          mejor_dia_semana: 5, // Viernes
          peor_rendimiento_dia: 'Lunes', 
          crecimiento_porcentual: -6.9,
          velocidad_promedio_mes: 61,
          alertas_total_mes: 32,
          dias_activos: 30,
          probabilidad_ocupacion_alta: 0.81,
          intervalo_confianza_velocidad_min: 57,
          intervalo_confianza_velocidad_max: 65
        },
        { 
          id: 13, 
          mes: 10, 
          año: 2025, 
          ruta_id: 1, 
          pasajeros_promedio_dia: 525, 
          pasajeros_total_mes: 16275, 
          mejor_dia_semana: 4, // Jueves
          peor_rendimiento_dia: 'Sábado', 
          crecimiento_porcentual: 10.5,
          velocidad_promedio_mes: 58,
          alertas_total_mes: 41,
          dias_activos: 31,
          probabilidad_ocupacion_alta: 0.94,
          intervalo_confianza_velocidad_min: 54,
          intervalo_confianza_velocidad_max: 62
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 150));
      
      console.log("Monthly Repository: Datos obtenidos exitosamente", mockData);
      return mockData;
      
    } catch (error) {
      console.error("Monthly Repository: Error al obtener datos", error);
      return null;
    }
  }

  // Método para obtener datos por año específico
  async getByYear(year: number): Promise<MonthlyResume[] | null> {
    try {
      const allData = await this.getAll();
      if (!allData) return null;
      
      return allData.filter(item => item.año === year);
    } catch (error) {
      console.error("Monthly Repository: Error al obtener datos por año", error);
      return null;
    }
  }

  // Método para obtener 7 meses alrededor del mes seleccionado (mes seleccionado + 3 antes + 3 después)
  async getByMonthRange(year: number, month: number): Promise<MonthlyResume[] | null> {
    try {
      const allData = await this.getAll();
      if (!allData) return null;
      
      const targetDate = new Date(year, month - 1); // month-1 porque Date usa 0-11
      const result: MonthlyResume[] = [];
      
      // Generar 7 meses: 3 antes + mes actual + 3 después
      for (let i = -3; i <= 3; i++) {
        const currentDate = new Date(targetDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Buscar datos que coincidan con este año y mes
        const monthData = allData.find(item => 
          item.año === currentYear && item.mes === currentMonth
        );
        
        // Solo agregar si existen datos para este mes
        if (monthData) {
          result.push(monthData);
        }
        // No agregamos entradas vacías - solo datos reales
      }
      
      // Retornar solo si hay al menos 1 dato disponible
      return result.length > 0 ? result : null;
    } catch (error) {
      console.error("Monthly Repository: Error al obtener datos por rango de mes", error);
      return null;
    }
  }

  // Método para obtener datos por rango de mes y ruta específica
  async getByMonthRangeAndRoute(year: number, month: number, routeId: number): Promise<MonthlyResume[] | null> {
    try {
      const allData = await this.getAll();
      if (!allData) return null;
      
      const targetDate = new Date(year, month - 1); // month-1 porque Date usa 0-11
      const result: MonthlyResume[] = [];
      
      // Generar 7 meses: 3 antes + mes actual + 3 después
      for (let i = -3; i <= 3; i++) {
        const currentDate = new Date(targetDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Buscar datos que coincidan con este año, mes y ruta
        const monthData = allData.find(item => 
          item.año === currentYear && 
          item.mes === currentMonth && 
          item.ruta_id === routeId
        );
        
        // Solo agregar si existen datos para este mes y ruta
        if (monthData) {
          result.push(monthData);
        }
        // No agregamos entradas vacías - solo datos reales
      }
      
      // Retornar solo si hay al menos 1 dato disponible
      return result.length > 0 ? result : null;
    } catch (error) {
      console.error("Monthly Repository: Error al obtener datos por rango de mes y ruta", error);
      return null;
    }
  }

  // Método para obtener datos por ruta específica
  async getByRoute(routeId: number): Promise<MonthlyResume[] | null> {
    try {
      const allData = await this.getAll();
      if (!allData) return null;
      
      return allData.filter(item => item.ruta_id === routeId);
    } catch (error) {
      console.error("Monthly Repository: Error al obtener datos por ruta", error);
      return null;
    }
  }

}
