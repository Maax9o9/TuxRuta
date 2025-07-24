import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColectiveLocationRepository } from '../../data/repository/colective-location-repository';
import { ColectiveLocation } from '../../data/models/colective-location.model';

@Injectable({
  providedIn: 'root'
})
export class GetColectiveLocationsByBusIdUseCase {
  
  constructor(private colectiveLocationRepository: ColectiveLocationRepository) {}

  execute(colectivoId: number): Observable<ColectiveLocation[]> {
    console.log(`GetColectiveLocationsByBusIdUseCase: Obteniendo ubicaciones del colectivo ${colectivoId}`);
    return this.colectiveLocationRepository.getColectiveLocationsByBusId(colectivoId);
  }
}
