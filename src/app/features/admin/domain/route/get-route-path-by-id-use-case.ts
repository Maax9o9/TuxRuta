import { Injectable } from '@angular/core';
import { Route } from '../../data/models/route.model';
import { RouteRepository } from '../../data/repository/route-repository';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GetRoutePathByIdUseCase {

  constructor(private routeRepository: RouteRepository) {}

  execute(id: number): Observable<Route | null> {
    console.log('GetRoutePathByIdUseCase: Ejecutando búsqueda de ruta por ID', id);
    if (id === undefined || id === null) {
      console.error('GetRoutePathByIdUseCase: ID de ruta es requerido');
      return of(null);
    }
    return this.routeRepository.getById(id).pipe(
      tap(result => {
        if (result) {
          console.log('GetRoutePathByIdUseCase: Ruta encontrada exitosamente', result);
        } else {
          console.log('GetRoutePathByIdUseCase: Ruta no encontrada con ID:', id);
        }
      }),
      catchError(error => {
        console.error('GetRoutePathByIdUseCase: Error inesperado', error);
        return of(null);
      })
    );
  }
}
