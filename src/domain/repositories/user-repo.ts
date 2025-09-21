import type { User } from '@/domain/entities/user';

export interface UserRepository {
  getCurrentUser(): Promise<User | null>;
}
