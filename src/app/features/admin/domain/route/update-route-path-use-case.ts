import { Injectable } from '@angular/core';
import { Route, Point } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateRoutePathUseCase {

  constructor(private routeRepository: RouteRepository) {}

  execute(request: {
    id: number;
    nombre?: string;
    descripcion?: string;
    path_data?: Point[];
    activa?: boolean;
    modificado_por?: number;
  }): Observable<Route | null> {
    console.log('UpdateRoutePathUseCase: Ejecutando actualización de ruta', request);
    if (request.id === undefined || request.id === null) {
      console.error('UpdateRoutePathUseCase: ID de ruta es requerido');
      return of(null);
    }
    return this.routeRepository.update(request.id, request).pipe(
      tap(result => {
        if (result) {
          console.log('UpdateRoutePathUseCase: Ruta actualizada exitosamente', result);
        } else {
          console.error('UpdateRoutePathUseCase: Error al actualizar ruta');
        }
      }),
      catchError(error => {
        console.error('UpdateRoutePathUseCase: Error inesperado', error);
        return of(null);
      })
    );
  }
}
