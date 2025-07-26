
export interface Ubicacion {
  lat?: number;
  lng?: number;
  latitud?: number;
  longitud?: number;
  order?: number;
}

export interface Stop {
  id: number;
  nombre: string;
  ubicacion: Ubicacion;
  ruta_id: number;
  activa: boolean;
  creado_por: number;
  creado_en: string;
}
