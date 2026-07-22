import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

type Cookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

type CookieStore = {
  getAll(): Array<Pick<Cookie, 'name' | 'value'>>;
  set(name: string, value: string, options?: Record<string, unknown>): void;
};

type MiddlewareContext = {
  requestCookies: CookieStore;
  responseCookies: CookieStore;
};

export const createClient = ({ requestCookies, responseCookies }: MiddlewareContext) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return requestCookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          requestCookies.set(name, value, options);
          responseCookies.set(name, value, options);
        });
      },
    },
  });
};
