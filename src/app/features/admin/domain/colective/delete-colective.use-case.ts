import { Colective } from '../../data/models/colective.model';

export class DeleteColectiveUseCase {
  constructor(private repository: { delete: (id: number) => Promise<boolean> }) {}

  async execute(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
