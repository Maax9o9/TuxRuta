import { Injectable } from '@angular/core';
import { DailyResume } from '../../data/models/daily-resume-route.model';
import { DailyResumeRepository } from '../../data/repository/daily-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllDailyResumeUseCase {

  constructor(private dailyResumeRepository: DailyResumeRepository) {}

  execute(): Promise<DailyResume[] | null> {
    console.log('UseCase: Starting execute method...');
    return new Promise((resolve) => {
      this.dailyResumeRepository.getAll().subscribe({
        next: (response) => {
          console.log('UseCase: Repository response:', response);
          if (response && response.length > 0) {
            const limitedData = response.slice(0, 7);
            console.log(`UseCase: Limited data to ${limitedData.length} days:`, limitedData);
            resolve(limitedData);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error('UseCase: Error in execute method:', error);
          resolve(null);
        }
      });
    });
  }

  executeByYear(year: number): Promise<DailyResume[] | null> {
    console.log(`Daily UseCase: Starting executeByYear method for year ${year}...`);
    return new Promise((resolve) => {
      this.dailyResumeRepository.getByYear(year).subscribe({
        next: (response) => {
          console.log('Daily UseCase: Repository response by year:', response);
          if (response && response.length > 0) {
            const limitedData = response.slice(0, 7);
            console.log(`Daily UseCase: Limited data to ${limitedData.length} days for year ${year}:`, limitedData);
            resolve(limitedData);
          } else {
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Daily UseCase: Error in executeByYear method:', error);
          resolve(null);
        }
      });
    });
  }
}