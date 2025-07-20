import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ColectiveLocationRepository } from '../data/repository/colective-location-repository';
import { ColectiveLocation } from '../data/models/colective-location.model';

@Injectable({
  providedIn: 'root'
})
export class GetRealTimeLocationUseCase {
  private location$: BehaviorSubject<ColectiveLocation>;

  constructor(private colectiveLocationRepository: ColectiveLocationRepository) {
    const initialLocation: ColectiveLocation = {
      id: 1,
      colectivo_id: 1,
      latitud: 16.7549,
      longitud: -93.1292,
      fecha_hora: new Date().toISOString(),
      velocidad: 25
    };

    this.location$ = new BehaviorSubject<ColectiveLocation>(initialLocation);

    interval(3000).pipe(  
      map(() => this.generateNewLocation(this.location$.value))
    ).subscribe(newLoc => this.location$.next(newLoc));
  }

  execute(): Observable<ColectiveLocation> {
    return this.location$.asObservable();
  }

  private generateNewLocation(prev: ColectiveLocation): ColectiveLocation {
    const metersInDegree = 0.000009; 
    const delta = 12 * metersInDegree; 

    return {
      ...prev,
      latitud: prev.latitud + delta,
      longitud: prev.longitud,
      fecha_hora: new Date().toISOString(),
      velocidad: Math.random() * 50 + 10 
    };
  }
}
