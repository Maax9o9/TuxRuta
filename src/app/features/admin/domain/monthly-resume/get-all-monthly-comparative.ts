import { Injectable } from '@angular/core';
import { MonthlyResume } from '../../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllMonthlyResumeUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  execute(): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Starting execute method...');
    return new Promise((resolve) => {
      this.monthlyResumeRepository.getAll().subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Repository response:', response);
          if (response && response.length > 0) {
            const limitedData = response.slice(0, 7);
            console.log(`Monthly UseCase: Limited data to ${limitedData.length} months:`, limitedData);
            resolve(limitedData);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Monthly UseCase: Error in execute method:', error);
          resolve(null);
        }
      });
    });
  }

  executeByYear(year: number): Promise<MonthlyResume[] | null> {
    console.log(`Monthly UseCase: Starting executeByYear method for year ${year}...`);
    return new Promise((resolve) => {
      this.monthlyResumeRepository.getByYear(year).subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Repository response by year:', response);
          if (response && response.length > 0) {
            console.log(`Monthly UseCase: Found ${response.length} months for year ${year}:`, response);
            resolve(response);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Monthly UseCase: Error in executeByYear method:', error);
          resolve(null);
        }
      });
    });
  }

  executeByMonthRange(year: number, month: number): Promise<MonthlyResume[] | null> {
    console.log(`Monthly UseCase: Starting executeByMonthRange for ${year}-${month}...`);
    return new Promise((resolve) => {
      if (!this.monthlyResumeRepository.getByMonthRange) {
        console.error('Monthly UseCase: getByMonthRange method not implemented in repository');
        resolve(null);
        return;
      }
      this.monthlyResumeRepository.getByMonthRange(year, month).subscribe({
        next: (response) => {
          console.log('Monthly UseCase: Repository response by month range:', response);
          if (response && response.length > 0) {
            console.log(`Monthly UseCase: Found ${response.length} months around ${year}-${month}:`, response);
            resolve(response);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Monthly UseCase: Error in executeByMonthRange method:', error);
          resolve(null);
        }
      });
    });
  }
}
