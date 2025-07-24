import { Injectable } from '@angular/core';
import { RouteRepository } from '../../data/repository/route-repository';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeleteRouteUseCase {
  constructor(private routeRepository: RouteRepository) {}

  execute(id: number): Observable<boolean> {
    console.log('DeleteRouteUseCase: Ejecutando eliminación de ruta', id);
    if (id === undefined || id === null) {
      console.error('DeleteRouteUseCase: ID de ruta es requerido');
      return of(false);
    }
    return this.routeRepository.delete(id).pipe(
      tap(() => {
        console.log('DeleteRouteUseCase: Ruta eliminada exitosamente');
      }),
      catchError(error => {
        console.error('DeleteRouteUseCase: Error al eliminar ruta', error);
        return of(false);
      }),
      require('rxjs/operators').map(() => true)
    );
  }
}
