import { Injectable } from '@angular/core';
import { RoutePoint, Route } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';

@Injectable({
  providedIn: 'root'
})
export class CreateRouteUseCase {

  constructor(private routeRepository: RouteRepository) {}

  async execute(routeData: { 
    nombre: string; 
    descripcion: string; 
    points?: RoutePoint[] 
  }): Promise<Route | null> {
    try {
      console.log("CreateRouteUseCase: Iniciando creación de ruta", routeData);
      
      if (!routeData.nombre || routeData.nombre.trim().length === 0) {
        console.error("CreateRouteUseCase: El nombre de la ruta es requerido");
        return null;
      }

      if (!routeData.descripcion || routeData.descripcion.trim().length === 0) {
        console.error("CreateRouteUseCase: La descripción de la ruta es requerida");
        return null;
      }

      if (routeData.nombre.length > 100) {
        console.error("CreateRouteUseCase: El nombre de la ruta no puede exceder 100 caracteres");
        return null;
      }

      if (routeData.descripcion.length > 500) {
        console.error("CreateRouteUseCase: La descripción no puede exceder 500 caracteres");
        return null;
      }

      if (routeData.points && routeData.points.length > 0) {
        console.log(`CreateRouteUseCase: Validando ${routeData.points.length} puntos de ruta`);
        
        for (let i = 0; i < routeData.points.length; i++) {
          const point = routeData.points[i];
          if (typeof point.lat !== 'number' || typeof point.lng !== 'number' || typeof point.order !== 'number') {
            console.error(`CreateRouteUseCase: Punto ${i + 1} tiene propiedades inválidas`, point);
            return null;
          }
        }
      }

      const routeToCreate = {
        nombre: routeData.nombre.trim(),
        descripcion: routeData.descripcion.trim(),
        activa: true,
        creado_por: 1, 
        modificado_por: 1,
        points: routeData.points || []
      };

      const createdRoute = await this.routeRepository.create(routeToCreate);
      
      if (createdRoute) {
        console.log("CreateRouteUseCase: Ruta creada exitosamente", createdRoute);
        console.log("CreateRouteUseCase: Puntos guardados:", createdRoute.points);
        return createdRoute;
      } else {
        console.error("CreateRouteUseCase: Error al crear la ruta");
        return null;
      }
      
    } catch (error) {
      console.error("CreateRouteUseCase: Error en la ejecución", error);
      return null;
    }
  }
}
