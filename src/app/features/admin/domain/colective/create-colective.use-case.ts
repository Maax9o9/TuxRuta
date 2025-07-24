import { Colective } from '../../data/models/colective.model';

export class CreateColectiveUseCase {
  constructor(private repository: { create: (colective: Omit<Colective, 'id'>) => Promise<Colective | null> }) {}

  async execute(colective: Omit<Colective, 'id'>): Promise<Colective | null> {
    return await this.repository.create(colective);
  }
}
