import { Injectable } from '@angular/core';
import { RoutePath } from '../../data/models/route-path.model';
import { RoutePathRepository } from '../../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class ToggleRoutePathStatusUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(id: string): Promise<RoutePath | null> {
    try {
      console.log('ToggleRoutePathStatusUseCase: Ejecutando cambio de estado de ruta', id);
      
      if (!id || id.trim().length === 0) {
        console.error('ToggleRoutePathStatusUseCase: ID de ruta es requerido');
        return null;
      }

      const result = await this.routePathRepository.toggleStatus(id);
      
      if (result) {
        console.log('ToggleRoutePathStatusUseCase: Estado de ruta cambiado exitosamente', {
          id: result.id,
          isActive: result.isActive
        });
      } else {
        console.error('ToggleRoutePathStatusUseCase: Error al cambiar estado de ruta');
      }
      
      return result;
    } catch (error) {
      console.error('ToggleRoutePathStatusUseCase: Error inesperado', error);
      return null;
    }
  }
}
