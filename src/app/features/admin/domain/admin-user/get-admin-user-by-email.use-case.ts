import { AdminUser } from '../../data/models/admin-user.model';

export class GetAdminUserByEmailUseCase {
  constructor(private repository: { getByEmail: (email: string) => Promise<AdminUser | null> }) {}

  async execute(email: string): Promise<AdminUser | null> {
    return await this.repository.getByEmail(email);
  }
}
