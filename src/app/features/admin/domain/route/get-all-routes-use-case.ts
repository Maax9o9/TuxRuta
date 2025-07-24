import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { RouteRepository } from '../../data/repository/route-repository';
import { Route as DomainRoute } from '../../data/models/route.model';

@Injectable({
  providedIn: 'root'
})
export class GetAllRoutesUseCase {

  constructor(private routeRepository: RouteRepository) {}

  async execute(): Promise<DomainRoute[] | null> {
    try {
      console.log("GetAllRoutesUseCase: Iniciando obtención de rutas");
      
      const routes = await this.routeRepository.getAll();
      
      if (routes) {
        console.log("GetAllRoutesUseCase: Rutas obtenidas exitosamente", routes);
        return routes;
      } else {
        console.error("GetAllRoutesUseCase: No se pudieron obtener las rutas");
        return null;
      }
      
    } catch (error) {
      console.error("GetAllRoutesUseCase: Error en la ejecución", error);
      return null;
    }
  }
}
