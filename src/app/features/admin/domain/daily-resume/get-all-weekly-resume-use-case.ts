import { WeeklyResumeRepository } from '../../data/repository/weekly-resume-repository';
import { DailyResume } from '../../data/models/daily-resume-route.model';

export class GetAllWeeklyResumeUseCase {
  constructor(private repository: WeeklyResumeRepository) {}

  async execute(): Promise<DailyResume[]> {
    try {
      const data = await this.repository.getAll();
      if (data && data.length > 0) {
        return data.slice(0, 7);
      }
      return [];
    } catch (error) {
      console.error('Error in GetAllWeeklyResumeUseCase:', error);
      return [];
    }
  }

  async executeByYear(year: number): Promise<DailyResume[]> {
    try {
      const data = await this.repository.getByYear(year);
      if (data && data.length > 0) {
        return data.slice(0, 7);
      }
      return [];
    } catch (error) {
      console.error('Error in GetAllWeeklyResumeUseCase by year:', error);
      return [];
    }
  }

  async executeByMonth(year: number, month: number): Promise<DailyResume[]> {
    try {
      const data = await this.repository.getByMonth(year, month);
      if (data && data.length > 0) {
        return data.slice(0, 7);
      }
      return [];
    } catch (error) {
      console.error('Error in GetAllWeeklyResumeUseCase by month:', error);
      return [];
    }
  }
}
