import { Injectable } from '@angular/core';
import { RoutePath, RoutePathCreateRequest } from '../data/models/route-path.model';
import { RoutePathRepository } from '../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class CreateRoutePathUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(request: RoutePathCreateRequest): Promise<RoutePath | null> {
    try {
      console.log('CreateRoutePathUseCase: Ejecutando creación de ruta', request);
      
      if (!request.name || request.name.trim().length === 0) {
        console.error('CreateRoutePathUseCase: Nombre de ruta es requerido');
        return null;
      }

      if (!request.points || request.points.length < 2) {
        console.error('CreateRoutePathUseCase: Se requieren al menos 2 puntos para crear una ruta');
        return null;
      }

      const result = await this.routePathRepository.create(request);
      
      if (result) {
        console.log('CreateRoutePathUseCase: Ruta creada exitosamente', result);
      } else {
        console.error('CreateRoutePathUseCase: Error al crear ruta');
      }
      
      return result;
    } catch (error) {
      console.error('CreateRoutePathUseCase: Error inesperado', error);
      return null;
    }
  }
}
