import { Injectable } from '@angular/core';
import { DailyResume } from '../../data/models/daily-resume-route.model';
import { DailyResumeRepository } from '../../data/repository/daily-resume-repository';

@Injectable({
  providedIn: 'root'
})
export class GetAllDailyResumeUseCase {

  constructor(private dailyResumeRepository: DailyResumeRepository) {}

  async execute(): Promise<DailyResume[] | null> {
    console.log('UseCase: Starting execute method...');
    
    try {
      const response: DailyResume[] | null = await this.dailyResumeRepository.getAll();
      console.log('UseCase: Repository response:', response);

      if (response != null && response.length > 0) {
        // Limitar a exactamente 7 días de datos
        const limitedData = response.slice(0, 7);
        console.log(`UseCase: Limited data to ${limitedData.length} days:`, limitedData);
        return limitedData;
      }
      
      return null;
    
    } catch (error) {
      console.error('UseCase: Error in execute method:', error);
      return null;
    }
  }

  async executeByYear(year: number): Promise<DailyResume[] | null> {
    console.log(`Daily UseCase: Starting executeByYear method for year ${year}...`);
    
    try {
      const response = await this.dailyResumeRepository.getByYear(year);
      console.log('Daily UseCase: Repository response by year:', response);

      if (response != null && response.length > 0) {
        // Limitar a exactamente 7 días de datos
        const limitedData = response.slice(0, 7);
        console.log(`Daily UseCase: Limited data to ${limitedData.length} days for year ${year}:`, limitedData);
        return limitedData;
      }
      
      return null;
    
    } catch (error) {
      console.error('Daily UseCase: Error in executeByYear method:', error);
      return null;
    }
  }
}