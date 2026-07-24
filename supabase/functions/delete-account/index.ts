import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const body = await request.json().catch(() => null);
  if (body?.confirmation !== 'DELETE_ACCOUNT') {
    return json({ error: 'Account deletion was not confirmed.' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase Edge Function environment variables.');
    return json({ error: 'Account deletion is not configured.' }, 500);
  }
  if (!authorization) return json({ error: 'Unauthorized.' }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;
  if (userError || !user) return json({ error: 'Unauthorized.' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const profileFolder = `profiles/${user.id}`;
  const paths: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data: files, error: listError } = await admin.storage.from('profile-photos').list(profileFolder, { limit: 100, offset });
    if (listError) {
      console.error('Unable to list profile photos.', listError);
      return json({ error: 'Unable to delete profile photo.' }, 500);
    }
    paths.push(...(files ?? []).map((file) => `${profileFolder}/${file.name}`));
    if (!files || files.length < 100) break;
  }

  if (paths.length) {
    const { error: removeError } = await admin.storage.from('profile-photos').remove(paths);
    if (removeError) {
      console.error('Unable to delete profile photos.', removeError);
      return json({ error: 'Unable to delete profile photo.' }, 500);
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, false);
  if (deleteError) {
    console.error('Unable to delete account.', deleteError);
    return json({ error: deleteError.message }, 500);
  }

  return json({ deleted: true });
});
