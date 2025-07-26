import { Injectable } from '@angular/core';
import { MonthlyResume } from '../../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByIdUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  execute(id: number): Promise<MonthlyResume | null> {
    console.log('Monthly UseCase: Getting monthly resume by ID:', id);
    return new Promise((resolve) => {
      if (!this.monthlyResumeRepository.getById) {
        console.error('Monthly UseCase: getById method not implemented in repository');
        resolve(null);
        return;
      }
      this.monthlyResumeRepository.getById(id).subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Found monthly resume:', response);
          resolve(response || null);
        },
        error: (error) => {
          console.error('Monthly UseCase: Error getting monthly resume by ID:', error);
          resolve(null);
        }
      });
    });
  }
}
