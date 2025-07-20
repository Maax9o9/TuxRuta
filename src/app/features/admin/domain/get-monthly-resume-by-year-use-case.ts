import { Injectable } from '@angular/core';
import { MonthlyResume } from '../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByYearUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  async execute(year: number): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Getting monthly resume by year:', year);
    
    try {
      const response: MonthlyResume[] | null = await this.monthlyResumeRepository.getAll();
      
      if (response != null && response.length > 0) {
        const filteredData = response.filter(item => item.año === year);
        console.log('Monthly UseCase: Found monthly resumes for year:', filteredData);
        return filteredData.length > 0 ? filteredData : null;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error getting monthly resume by year:', error);
      return null;
    }
  }
}
