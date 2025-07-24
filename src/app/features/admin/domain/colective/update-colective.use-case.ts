import { Colective } from '../../data/models/colective.model';

export class UpdateColectiveUseCase {
  constructor(private repository: { update: (id: number, colective: Partial<Colective>) => Promise<Colective | null> }) {}

  async execute(id: number, colective: Partial<Colective>): Promise<Colective | null> {
    return await this.repository.update(id, colective);
  }
}
