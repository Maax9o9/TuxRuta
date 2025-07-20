import { Injectable } from '@angular/core';
import { RoutePathRepository } from '../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class DeleteRoutePathUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(id: string): Promise<boolean> {
    try {
      console.log('DeleteRoutePathUseCase: Ejecutando eliminación de ruta', id);
      
      if (!id || id.trim().length === 0) {
        console.error('DeleteRoutePathUseCase: ID de ruta es requerido');
        return false;
      }

      const result = await this.routePathRepository.delete(id);
      
      if (result) {
        console.log('DeleteRoutePathUseCase: Ruta eliminada exitosamente');
      } else {
        console.error('DeleteRoutePathUseCase: Error al eliminar ruta');
      }
      
      return result;
    } catch (error) {
      console.error('DeleteRoutePathUseCase: Error inesperado', error);
      return false;
    }
  }
}
