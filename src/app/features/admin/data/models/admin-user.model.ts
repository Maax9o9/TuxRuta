export interface AdminUser {
  id: number;
  email: string;
  password: string;
  nombre: string;
  rol: string;
  activo: boolean;
  ultimo_acceso: string; 
  creado_en: string;    
}
