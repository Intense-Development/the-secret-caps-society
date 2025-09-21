import type { User } from '@/domain/entities/user';
import type { UserRepository } from '@/domain/repositories/user-repo';
import { supabaseBrowser } from '@/lib/supabase/client';

export class SupabaseUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabaseBrowser.auth.getUser();
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? 'unknown@unknown',
      createdAt: data.user.created_at ?? new Date().toISOString(),
    };
  }
}
