import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

type Cookie = {
  name: string;
  value: string;
};

type CookieStore = {
  getAll(): Cookie[];
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

export const createClient = (cookieStore: CookieStore) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignore in server components where cookies cannot be mutated directly.
        }
      },
    },
  });
};
