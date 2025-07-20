export interface RoutePoint {
  lat: number;
  lng: number;
  order: number;
}

export interface Route {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  creado_por: number;
  modificado_por: number;
  creado_en: string;  
  modificado_en: string;
  points: RoutePoint[];
}
