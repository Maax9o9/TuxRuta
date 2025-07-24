import { AdminUser } from '../../data/models/admin-user.model';

export class GetAllAdminUsersUseCase {
  constructor(private repository: { getAll: () => Promise<AdminUser[] | null> }) {}

  async execute(): Promise<AdminUser[] | null> {
    return await this.repository.getAll();
  }
}
