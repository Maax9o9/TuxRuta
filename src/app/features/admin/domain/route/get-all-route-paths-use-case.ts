import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoutePath } from '../../data/models/route-path.model';
import { RoutePathRepository } from '../../data/repository/route-path-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllRoutePathsUseCase {

  constructor(private routePathRepository: RoutePathRepository) {}

  async execute(): Promise<RoutePath[] | null> {
    try {
      console.log('GetAllRoutePathsUseCase: Ejecutando obtención de todas las rutas');
      
      const result = await this.routePathRepository.getAll();
      
      if (result) {
        console.log('GetAllRoutePathsUseCase: Rutas obtenidas exitosamente', result.length, 'rutas encontradas');
      } else {
        console.error('GetAllRoutePathsUseCase: Error al obtener rutas');
      }
      
      return result;
    } catch (error) {
      console.error('GetAllRoutePathsUseCase: Error inesperado', error);
      return null;
    }
  }

  // Método para obtener como Observable (mantener compatibilidad)
  executeAsObservable(): Observable<RoutePath[]> {
    return this.routePathRepository.getAllAsObservable();
  }
}
