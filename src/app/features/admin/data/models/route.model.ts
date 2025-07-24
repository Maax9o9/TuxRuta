
export interface Point {
  lat: number;
  lng: number;
  order: number;
}

export interface Route {
  id: number;
  nombre: string;
  descripcion?: string | null;
  points: Point[];
  activa: boolean;
  creado_por: number;
  modificado_por?: number | null;
  creado_en: string;
  modificado_en: string;
}

