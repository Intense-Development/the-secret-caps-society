import type { User } from '@/domain/entities/user';
import type { UserRepository } from '@/domain/repositories/user-repo';

export class GetCurrentUser {
  constructor(private readonly repo: UserRepository) {}

  async execute(): Promise<User | null> {
    return this.repo.getCurrentUser();
  }
}
