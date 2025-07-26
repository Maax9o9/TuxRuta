import { Injectable } from '@angular/core';
import { MonthlyResume } from '../../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByYearUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  execute(year: number): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Getting monthly resume by year:', year);
    return new Promise((resolve) => {
      this.monthlyResumeRepository.getByYear(year).subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Found monthly resumes for year:', response);
          resolve(response && response.length > 0 ? response : null);
        },
        error: (error) => {
          console.error('Monthly UseCase: Error getting monthly resume by year:', error);
          resolve(null);
        }
      });
    });
  }
}
