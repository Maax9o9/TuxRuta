import { Stop } from '../../data/models/stop.model';

export class GetStopByIdUseCase {
  constructor(private repository: { getById: (id: number) => Promise<Stop | null> }) {}

  async execute(id: number): Promise<Stop | null> {
    return await this.repository.getById(id);
  }
}
