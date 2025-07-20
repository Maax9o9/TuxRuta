export interface DailyResume {
  id: number;
  fecha: string; 
  ruta_id: number;
  pasajeros_total: number;
  pasajeros_promedio_por_viaje: number;
  velocidad_promedio: number;
  hora_pico: string;
  total_viajes: number;
  total_alertas: number;
  ocupacion_maxima: number;
  probabilidad_ocupacion_alta: number;
  intervalo_confianza_velocidad_min: number;
  intervalo_confianza_velocidad_max: number;
}
