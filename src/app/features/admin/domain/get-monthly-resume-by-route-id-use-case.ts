import { Injectable } from '@angular/core';
import { MonthlyResume } from '../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByRouteIdUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  async execute(routeId: number): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Getting monthly resume by route ID:', routeId);
    
    try {
      const response: MonthlyResume[] | null = await this.monthlyResumeRepository.getAll();
      
      if (response != null && response.length > 0) {
        const filteredData = response.filter(item => item.ruta_id === routeId);
        console.log('Monthly UseCase: Found monthly resumes for route:', filteredData);
        return filteredData.length > 0 ? filteredData : null;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error getting monthly resume by route ID:', error);
      return null;
    }
  }
}
