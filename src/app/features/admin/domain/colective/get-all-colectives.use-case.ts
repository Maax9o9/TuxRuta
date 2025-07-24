import { Colective } from '../../data/models/colective.model';

export class GetAllColectivesUseCase {
  constructor(private repository: { getAll: () => Promise<Colective[] | null> }) {}

  async execute(): Promise<Colective[] | null> {
    return await this.repository.getAll();
  }
}
