export interface AdminUser {
  id: number;
  email: string;
  password: string;
  readonly rol: 'admin';
  activo: boolean;
  ultimo_acceso?: string | null;
  creado_en: string;
}
