import { Injectable } from '@angular/core';
import { Route } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToggleRoutePathStatusUseCase {

  constructor(private routeRepository: RouteRepository) {}

  execute(id: number): Observable<Route | null> {
    console.log('ToggleRoutePathStatusUseCase: Ejecutando cambio de estado de ruta', id);
    if (id === undefined || id === null) {
      console.error('ToggleRoutePathStatusUseCase: ID de ruta es requerido');
      return of(null);
    }
    return this.routeRepository.getById(id).pipe(
      switchMap(route => {
        if (!route) {
          console.error('ToggleRoutePathStatusUseCase: Ruta no encontrada');
          return of(null);
        }
        return this.routeRepository.update(id, { activa: !route.activa }).pipe(
          tap(updatedRoute => {
            if (updatedRoute) {
              console.log('ToggleRoutePathStatusUseCase: Estado de ruta cambiado exitosamente', {
                id: updatedRoute.id,
                activa: updatedRoute.activa
              });
            } else {
              console.error('ToggleRoutePathStatusUseCase: Error al cambiar estado de ruta');
            }
          })
        );
      }),
      catchError(error => {
        console.error('ToggleRoutePathStatusUseCase: Error inesperado', error);
        return of(null);
      })
    );
  }
}
