import { Stop } from '../../data/models/stop.model';

export class DeleteStopUseCase {
  constructor(private repository: { delete: (id: number) => Promise<boolean> }) {}

  async execute(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
