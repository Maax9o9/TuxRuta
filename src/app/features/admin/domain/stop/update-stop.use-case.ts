import { Stop } from '../../data/models/stop.model';

export class UpdateStopUseCase {
  constructor(private repository: { update: (id: number, stop: Partial<Stop>) => Promise<Stop | null> }) {}

  async execute(id: number, stop: Partial<Stop>): Promise<Stop | null> {
    return await this.repository.update(id, stop);
  }
}
