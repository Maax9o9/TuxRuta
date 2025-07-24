import { AdminUser } from '../../data/models/admin-user.model';

export class GetAdminUserByIdUseCase {
  constructor(private repository: { getById: (id: number) => Promise<AdminUser | null> }) {}

  async execute(id: number): Promise<AdminUser | null> {
    return await this.repository.getById(id);
  }
}
