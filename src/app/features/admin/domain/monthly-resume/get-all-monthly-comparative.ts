import { Injectable } from '@angular/core';
import { MonthlyResume } from '../../data/models/monthly-comparative.model';
import { MonthlyResumeRepository } from '../../data/repository/monthly-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllMonthlyResumeUseCase {

  constructor(private monthlyResumeRepository: MonthlyResumeRepository) {}

  async execute(): Promise<MonthlyResume[] | null> {
    console.log('Monthly UseCase: Starting execute method...');
    
    try {
      const response: MonthlyResume[] | null = await this.monthlyResumeRepository.getAll();
      console.log('Monthly UseCase: Repository response:', response);

      if (response != null && response.length > 0) {
        // Limitar a exactamente 7 meses de datos
        const limitedData = response.slice(0, 7);
        console.log(`Monthly UseCase: Limited data to ${limitedData.length} months:`, limitedData);
        return limitedData;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error in execute method:', error);
      return null;
    }
  }

  async executeByYear(year: number): Promise<MonthlyResume[] | null> {
    console.log(`Monthly UseCase: Starting executeByYear method for year ${year}...`);
    
    try {
      const response = await this.monthlyResumeRepository.getByYear(year);
      console.log('Monthly UseCase: Repository response by year:', response);

      if (response != null && response.length > 0) {
        console.log(`Monthly UseCase: Found ${response.length} months for year ${year}:`, response);
        return response;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error in executeByYear method:', error);
      return null;
    }
  }

  async executeByMonthRange(year: number, month: number): Promise<MonthlyResume[] | null> {
    console.log(`Monthly UseCase: Starting executeByMonthRange for ${year}-${month}...`);
    
    try {
      const response = await this.monthlyResumeRepository.getByMonthRange(year, month);
      console.log('Monthly UseCase: Repository response by month range:', response);

      if (response != null && response.length > 0) {
        console.log(`Monthly UseCase: Found ${response.length} months around ${year}-${month}:`, response);
        return response;
      }
      
      return null;
    
    } catch (error) {
      console.error('Monthly UseCase: Error in executeByMonthRange method:', error);
      return null;
    }
  }
}
