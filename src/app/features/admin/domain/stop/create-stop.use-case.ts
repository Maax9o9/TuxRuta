import { Stop } from '../../data/models/stop.model';

export class CreateStopUseCase {
  constructor(private repository: { create: (stop: Omit<Stop, 'id'>) => Promise<Stop | null> }) {}

  async execute(stop: Omit<Stop, 'id'>): Promise<Stop | null> {
    return await this.repository.create(stop);
  }
}
