import { Injectable } from '@angular/core';
import { RoutePath,RoutePathUpdateRequest } from '../../data/models/route-path.model';
import { RoutePathRepository } from '../../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class UpdateRoutePathUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(request: RoutePathUpdateRequest): Promise<RoutePath | null> {
    try {
      console.log('UpdateRoutePathUseCase: Ejecutando actualización de ruta', request);
      
      if (!request.id || request.id.trim().length === 0) {
        console.error('UpdateRoutePathUseCase: ID de ruta es requerido');
        return null;
      }

      const result = await this.routePathRepository.update(request);
      
      if (result) {
        console.log('UpdateRoutePathUseCase: Ruta actualizada exitosamente', result);
      } else {
        console.error('UpdateRoutePathUseCase: Error al actualizar ruta');
      }
      
      return result;
    } catch (error) {
      console.error('UpdateRoutePathUseCase: Error inesperado', error);
      return null;
    }
  }
}
