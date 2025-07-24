import { Stop } from '../../data/models/stop.model';

export class GetAllStopsUseCase {
  constructor(private repository: { getAll: () => Promise<Stop[] | null> }) {}

  async execute(): Promise<Stop[] | null> {
    return await this.repository.getAll();
  }
}
