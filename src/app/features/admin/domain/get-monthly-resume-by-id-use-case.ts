import { Injectable } from '@angular/core';
import { MonthlyResume } from '../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetMonthlyResumeByIdUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  async execute(id: number): Promise<MonthlyResume | null> {
    console.log('Monthly UseCase: Getting monthly resume by ID:', id);
    
    try {
      const response: MonthlyResume[] | null = await this.monthlyResumeRepository.getAll();
      
      if (response != null && response.length > 0) {
        const monthlyResume = response.find(item => item.id === id);
        console.log('Monthly UseCase: Found monthly resume:', monthlyResume);
        return monthlyResume || null;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error getting monthly resume by ID:', error);
      return null;
    }
  }
}
