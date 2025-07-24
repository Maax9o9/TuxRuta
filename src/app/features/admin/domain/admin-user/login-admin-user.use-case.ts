import { AdminUserRepository } from '../../data/repository/admin-user-repository';

export interface LoginRequest {
  email: string;
  password: string;
}

export class LoginAdminUserUseCase {
  constructor(private repository: AdminUserRepository) {}

  execute(request: LoginRequest) {
    return this.repository.login(request);
  }
}
