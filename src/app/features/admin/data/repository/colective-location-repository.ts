import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ColectiveLocation } from '../models/colective-location.model';

@Injectable({
  providedIn: 'root'
})
export class ColectiveLocationRepository {
  
  constructor() {}

  getAllColectiveLocations(): Observable<ColectiveLocation[]> {
    const mockLocations: ColectiveLocation[] = [
      {
        id: 1,
        colectivo_id: 101,
        fecha_hora: '2025-01-06T10:30:00Z',
        latitud: -33.4489,
        longitud: -70.6693,
        velocidad: 45
      },
      {
        id: 2,
        colectivo_id: 101,
        fecha_hora: '2025-01-06T10:31:00Z',
        latitud: -33.4500,
        longitud: -70.6700,
        velocidad: 52
      },
      {
        id: 3,
        colectivo_id: 102,
        fecha_hora: '2025-01-06T10:30:00Z',
        latitud: -33.4600,
        longitud: -70.6800,
        velocidad: 38
      }
    ];
    
    return of(mockLocations);
  }

  getColectiveLocationsByBusId(colectivoId: number): Observable<ColectiveLocation[]> {
    return new Observable(observer => {
      this.getAllColectiveLocations().subscribe(locations => {
        const filteredLocations = locations.filter(loc => loc.colectivo_id === colectivoId);
        observer.next(filteredLocations);
        observer.complete();
      });
    });
  }

  getLatestColectiveLocation(colectivoId: number): Observable<ColectiveLocation | null> {
    return new Observable(observer => {
      this.getColectiveLocationsByBusId(colectivoId).subscribe(locations => {
        if (locations.length > 0) {
          const sortedLocations = locations.sort((a, b) => 
            new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
          );
          observer.next(sortedLocations[0]);
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }

  createColectiveLocation(location: Omit<ColectiveLocation, 'id'>): Observable<ColectiveLocation> {
    const newLocation: ColectiveLocation = {
      id: Date.now(), 
      ...location
    };
    
    return of(newLocation);
  }
}
