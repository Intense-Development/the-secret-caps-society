import { createClient } from '@supabase/supabase-js';

// Server-only Supabase admin client
// IMPORTANT: Never import this in client components.

if (typeof window !== 'undefined') {
  throw new Error('supabase admin client must not be imported in the browser');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('Missing SUPABASE_SERVICE_ROLE (server-only). Admin client will not work.');
}

export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  : undefined;
