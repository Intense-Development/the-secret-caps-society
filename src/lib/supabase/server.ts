import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Note: In RSC, cookies() is read-only; set/remove are no-ops here.
// In Route Handlers, you can use a variant that mutates Response cookies.
export const supabaseServer = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // no-op in RSC
      },
      remove() {
        // no-op in RSC
      },
    },
  });
};
