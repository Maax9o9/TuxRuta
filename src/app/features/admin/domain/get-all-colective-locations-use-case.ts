import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColectiveLocationRepository } from '../data/repository/colective-location-repository';
import { ColectiveLocation } from '../data/models/colective-location.model';

@Injectable({
  providedIn: 'root'
})
export class GetAllColectiveLocationsUseCase {
  
  constructor(private colectiveLocationRepository: ColectiveLocationRepository) {}

  execute(): Observable<ColectiveLocation[]> {
    console.log('GetAllColectiveLocationsUseCase: Obteniendo todas las ubicaciones de colectivos');
    return this.colectiveLocationRepository.getAllColectiveLocations();
  }
}
