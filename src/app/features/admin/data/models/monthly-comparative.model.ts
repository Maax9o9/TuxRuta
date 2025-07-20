export interface MonthlyResume {
  id: number;
  mes: number;
  año: number;
  ruta_id: number;
  pasajeros_promedio_dia: number;
  pasajeros_total_mes: number;
  mejor_dia_semana: number;
  peor_rendimiento_dia: string; 
  crecimiento_porcentual: number;
  velocidad_promedio_mes: number;
  alertas_total_mes: number;
  dias_activos: number;
  probabilidad_ocupacion_alta: number;
  intervalo_confianza_velocidad_min: number;
  intervalo_confianza_velocidad_max: number;
}
