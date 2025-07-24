import { Injectable } from '@angular/core';
import { Point, Route } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreateRouteUseCase {

  constructor(private routeRepository: RouteRepository) {}

  execute(routeData: {
    nombre: string;
    descripcion: string;
    points?: Point[];
  }): Observable<Route | null> {
    console.log("CreateRouteUseCase: Iniciando creación de ruta", routeData);

    if (!routeData.nombre || routeData.nombre.trim().length === 0) {
      console.error("CreateRouteUseCase: El nombre de la ruta es requerido");
      return of(null);
    }
    if (!routeData.descripcion || routeData.descripcion.trim().length === 0) {
      console.error("CreateRouteUseCase: La descripción de la ruta es requerida");
      return of(null);
    }
    if (routeData.nombre.length > 100) {
      console.error("CreateRouteUseCase: El nombre de la ruta no puede exceder 100 caracteres");
      return of(null);
    }
    if (routeData.descripcion.length > 500) {
      console.error("CreateRouteUseCase: La descripción no puede exceder 500 caracteres");
      return of(null);
    }
    if (routeData.points && routeData.points.length > 0) {
      console.log(`CreateRouteUseCase: Validando ${routeData.points.length} puntos de ruta`);
      for (let i = 0; i < routeData.points.length; i++) {
        const point = routeData.points[i];
        if (typeof point.lat !== 'number' || typeof point.lng !== 'number' || typeof point.order !== 'number') {
          console.error(`CreateRouteUseCase: Punto ${i + 1} tiene propiedades inválidas`, point);
          return of(null);
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

    return this.routeRepository.create(routeToCreate).pipe(
      map(createdRoute => {
        console.log("CreateRouteUseCase: Ruta creada exitosamente", createdRoute);
        console.log("CreateRouteUseCase: Puntos guardados:", createdRoute.points);
        return createdRoute;
      }),
      catchError(error => {
        console.error("CreateRouteUseCase: Error en la ejecución", error);
        return of(null);
      })
    );
  }
}
