import { Injectable } from '@angular/core';
import { MonthlyResume } from '../../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByRouteIdUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  execute(routeId: number): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Getting monthly resume by route ID:', routeId);
    return new Promise((resolve) => {
      if (!this.monthlyResumeRepository.getByRouteId) {
        console.error('Monthly UseCase: getByRouteId method not implemented in repository');
        resolve(null);
        return;
      }
      this.monthlyResumeRepository.getByRouteId(routeId).subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Found monthly resumes for route:', response);
          resolve(response && response.length > 0 ? response : null);
        },
        error: (error) => {
          console.error('Monthly UseCase: Error getting monthly resume by route ID:', error);
          resolve(null);
        }
      });
    });
  }
}
