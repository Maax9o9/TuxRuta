import { Injectable } from '@angular/core';
import { RouteRepository } from '../../data/repository/route-repository';
import { Route as DomainRoute } from '../../data/models/route.model';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GetAllRoutesUseCase {

  constructor(private routeRepository: RouteRepository) {}

  execute(): Observable<DomainRoute[] | null> {
    console.log("GetAllRoutesUseCase: Iniciando obtención de rutas");
    return this.routeRepository.getAll().pipe(
      tap(routes => {
        console.log("GetAllRoutesUseCase: Rutas obtenidas exitosamente", routes);
      }),
      catchError(error => {
        console.error("GetAllRoutesUseCase: Error en la ejecución", error);
        return of(null);
      })
    );
  }
}
