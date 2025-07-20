import { Injectable } from '@angular/core';
import { Route } from '../models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RouteRepository {

  constructor() {}

  async getAll(): Promise<Route[] | null> {
    try {
      const mockData: Route[] = [
        {
          id: 1,
          nombre: 'Ruta Centro - Norte',
          descripcion: 'Ruta principal que conecta el centro de la ciudad con la zona norte',
          activa: true,
          creado_por: 1,
          modificado_por: 1,
          creado_en: '2025-01-01T10:00:00Z',
          modificado_en: '2025-01-01T10:00:00Z',
          points: [
            { lat: 16.7549, lng: -93.1292, order: 1 },
            { lat: 16.7560, lng: -93.1300, order: 2 },
            { lat: 16.7575, lng: -93.1315, order: 3 }
          ]
        },
        {
          id: 2,
          nombre: 'Ruta Sur - Este',
          descripcion: 'Conecta la zona sur con el sector este de la ciudad',
          activa: true,
          creado_por: 1,
          modificado_por: 1,
          creado_en: '2025-01-02T09:00:00Z',
          modificado_en: '2025-01-02T09:00:00Z',
          points: [
            { lat: 16.7400, lng: -93.1200, order: 1 },
            { lat: 16.7420, lng: -93.1180, order: 2 },
            { lat: 16.7440, lng: -93.1160, order: 3 }
          ]
        },
        {
          id: 3,
          nombre: 'Ruta Universitaria',
          descripcion: 'Ruta especializada para conectar universidades y centros educativos',
          activa: false,
          creado_por: 1,
          modificado_por: 1,
          creado_en: '2025-01-03T08:00:00Z',
          modificado_en: '2025-01-03T08:00:00Z',
          points: [
            { lat: 16.7650, lng: -93.1400, order: 1 },
            { lat: 16.7670, lng: -93.1420, order: 2 }
          ]
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("RouteRepository: Datos obtenidos exitosamente", mockData);
      return mockData;
      
    } catch (error) {
      console.error("RouteRepository: Error al obtener datos", error);
      return null;
    }
  }

  async create(route: Omit<Route, 'id' | 'creado_en' | 'modificado_en'>): Promise<Route | null> {
    try {
      const newRoute: Route = {
        id: Math.floor(Math.random() * 1000) + 100,
        nombre: route.nombre,
        descripcion: route.descripcion,
        activa: route.activa,
        creado_por: route.creado_por,
        modificado_por: route.modificado_por,
        creado_en: new Date().toISOString(),
        modificado_en: new Date().toISOString(),
        points: route.points || []
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("RouteRepository: Ruta creada exitosamente", newRoute);
      return newRoute;
      
    } catch (error) {
      console.error("RouteRepository: Error al crear ruta", error);
      return null;
    }
  }

  async update(id: number, route: Partial<Route>): Promise<Route | null> {
    try {
      const updatedRoute: Route = {
        id,
        nombre: route.nombre || 'Ruta sin nombre',
        descripcion: route.descripcion || 'Sin descripción',
        activa: route.activa ?? true,
        creado_por: route.creado_por || 1,
        modificado_por: route.modificado_por || 1,
        creado_en: route.creado_en || new Date().toISOString(),
        modificado_en: new Date().toISOString(),
        points: route.points || []
      };

      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log("RouteRepository: Ruta actualizada exitosamente", updatedRoute);
      return updatedRoute;
      
    } catch (error) {
      console.error("RouteRepository: Error al actualizar ruta", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      console.log("RouteRepository: Ruta eliminada exitosamente", id);
      return true;
      
    } catch (error) {
      console.error("RouteRepository: Error al eliminar ruta", error);
      return false;
    }
  }

  async getById(id: number): Promise<Route | null> {
    try {
      const mockRoute: Route = {
        id,
        nombre: 'Ruta de ejemplo',
        descripcion: 'Descripción de la ruta de ejemplo',
        activa: true,
        creado_por: 1,
        modificado_por: 1,
        creado_en: '2025-01-01T10:00:00Z',
        modificado_en: '2025-01-01T10:00:00Z',
        points: [
          { lat: 16.7549, lng: -93.1292, order: 1 },
          { lat: 16.7560, lng: -93.1300, order: 2 }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("RouteRepository: Ruta obtenida por ID", mockRoute);
      return mockRoute;
      
    } catch (error) {
      console.error("RouteRepository: Error al obtener ruta por ID", error);
      return null;
    }
  }
}
