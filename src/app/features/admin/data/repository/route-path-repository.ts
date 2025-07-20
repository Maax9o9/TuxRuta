import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RoutePath, RoutePathCreateRequest, RoutePathUpdateRequest } from '../models/route-path.model';

@Injectable({
  providedIn: 'root'
})
export class RoutePathRepository {
  private routePathsSubject = new BehaviorSubject<RoutePath[]>([]);

  constructor() {}

  async create(request: RoutePathCreateRequest): Promise<RoutePath | null> {
    try {
      const newRoutePath: RoutePath = {
        id: this.generateId(),
        name: request.name,
        description: request.description,
        points: request.points,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      const currentRoutes = this.routePathsSubject.value;
      this.routePathsSubject.next([...currentRoutes, newRoutePath]);
      
      console.log("RoutePathRepository: Ruta creada exitosamente", newRoutePath);
      return newRoutePath;
    } catch (error) {
      console.error("RoutePathRepository: Error al crear ruta", error);
      return null;
    }
  }

  async getAll(): Promise<RoutePath[] | null> {
    try {
      const routes = this.routePathsSubject.value;
      console.log("RoutePathRepository: Rutas obtenidas exitosamente", routes);
      return routes;
    } catch (error) {
      console.error("RoutePathRepository: Error al obtener rutas", error);
      return null;
    }
  }

  async getById(id: string): Promise<RoutePath | null> {
    try {
      const route = this.routePathsSubject.value.find(r => r.id === id);
      console.log("RoutePathRepository: Ruta obtenida por ID", route);
      return route || null;
    } catch (error) {
      console.error("RoutePathRepository: Error al obtener ruta por ID", error);
      return null;
    }
  }

  async update(request: RoutePathUpdateRequest): Promise<RoutePath | null> {
    try {
      const routes = this.routePathsSubject.value;
      const routeIndex = routes.findIndex(r => r.id === request.id);
      
      if (routeIndex === -1) {
        console.error("RoutePathRepository: Ruta no encontrada para actualizar");
        return null;
      }

      const updatedRoute: RoutePath = {
        ...routes[routeIndex],
        ...request,
        updatedAt: new Date()
      };

      const updatedRoutes = [...routes];
      updatedRoutes[routeIndex] = updatedRoute;
      this.routePathsSubject.next(updatedRoutes);
      
      console.log("RoutePathRepository: Ruta actualizada exitosamente", updatedRoute);
      return updatedRoute;
    } catch (error) {
      console.error("RoutePathRepository: Error al actualizar ruta", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const routes = this.routePathsSubject.value;
      const filteredRoutes = routes.filter(r => r.id !== id);
      
      if (filteredRoutes.length === routes.length) {
        console.error("RoutePathRepository: Ruta no encontrada para eliminar");
        return false;
      }

      this.routePathsSubject.next(filteredRoutes);
      console.log("RoutePathRepository: Ruta eliminada exitosamente");
      return true;
    } catch (error) {
      console.error("RoutePathRepository: Error al eliminar ruta", error);
      return false;
    }
  }

  async toggleStatus(id: string): Promise<RoutePath | null> {
    try {
      const routes = this.routePathsSubject.value;
      const routeIndex = routes.findIndex(r => r.id === id);
      
      if (routeIndex === -1) {
        console.error("RoutePathRepository: Ruta no encontrada para cambiar estado");
        return null;
      }

      const updatedRoute: RoutePath = {
        ...routes[routeIndex],
        isActive: !routes[routeIndex].isActive,
        updatedAt: new Date()
      };

      const updatedRoutes = [...routes];
      updatedRoutes[routeIndex] = updatedRoute;
      this.routePathsSubject.next(updatedRoutes);
      
      console.log("RoutePathRepository: Estado de ruta cambiado exitosamente", updatedRoute);
      return updatedRoute;
    } catch (error) {
      console.error("RoutePathRepository: Error al cambiar estado de ruta", error);
      return null;
    }
  }

  // Método para obtener rutas como Observable (para compatibilidad con el servicio existente)
  getAllAsObservable(): Observable<RoutePath[]> {
    return this.routePathsSubject.asObservable();
  }

  private generateId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
