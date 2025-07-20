import { Injectable } from '@angular/core';
import { RoutePath } from '../data/models/route-path.model';
import { RoutePathRepository } from '../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class GetRoutePathByIdUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(id: string): Promise<RoutePath | null> {
    try {
      console.log('GetRoutePathByIdUseCase: Ejecutando búsqueda de ruta por ID', id);
      
      if (!id || id.trim().length === 0) {
        console.error('GetRoutePathByIdUseCase: ID de ruta es requerido');
        return null;
      }

      const result = await this.routePathRepository.getById(id);
      
      if (result) {
        console.log('GetRoutePathByIdUseCase: Ruta encontrada exitosamente', result);
      } else {
        console.log('GetRoutePathByIdUseCase: Ruta no encontrada con ID:', id);
      }
      
      return result;
    } catch (error) {
      console.error('GetRoutePathByIdUseCase: Error inesperado', error);
      return null;
    }
  }
}
