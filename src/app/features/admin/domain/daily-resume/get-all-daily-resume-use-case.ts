import { Injectable } from '@angular/core';
import { DailyResume } from '../../data/models/daily-resume-route.model';
import { DailyResumeRepository } from '../../data/repository/daily-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllDailyResumeUseCase {

  constructor(private dailyResumeRepository: DailyResumeRepository) {}

 

executeByDateAndRoute(year: number, month: number, day: number, routeId: number): Promise<DailyResume[] | null> {
    console.log('Daily UseCase: Getting daily resume by date and route ID:', { year, month, day, routeId });
    
    // Construir la fecha en formato YYYY-MM-DD
    const formattedDate = this.formatDate(year, month, day);
    console.log('Daily UseCase: Formatted date:', formattedDate);
    
    return new Promise((resolve) => {
      if (!this.dailyResumeRepository.getByDateAndRoute) {
        console.error('Daily UseCase: getByDateAndRoute method not implemented in repository');
        resolve(null);
        return;
      }
      
      this.dailyResumeRepository.getByDateAndRoute(formattedDate, routeId).subscribe({
        next: (response) => {
          console.log('Daily UseCase: Found daily resumes for date and route:', response);
          resolve(response && response.length > 0 ? response : null);
        },
        error: (error) => {
          console.error('Daily UseCase: Error getting daily resume by date and route:', error);
          resolve(null);
        }
      });
    });
  }
 
    formatDate(year: number, month: number, day: number): string {
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  }

  executeByDateRange(startDate: string, endDate: string, routeId: number): Promise<DailyResume[] | null> {
    console.log('Daily UseCase: Getting daily resume by date range and route ID:', { startDate, endDate, routeId });
    
    return new Promise((resolve) => {
      if (!this.dailyResumeRepository.getByDateRange) {
        console.error('Daily UseCase: getByDateRange method not implemented in repository');
        resolve(null);
        return;
      }
      
      this.dailyResumeRepository.getByDateRange(startDate, endDate, routeId).subscribe({
        next: (response) => {
          console.log('Daily UseCase: Found daily resumes for date range and route:', response);
          resolve(response && response.length > 0 ? response : null);
        },
        error: (error) => {
          console.error('Daily UseCase: Error getting daily resume by date range and route:', error);
          resolve(null);
        }
      });
    });
  }

}