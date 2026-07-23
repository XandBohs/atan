-- Apply after the storage migration. It enables Realtime events for profile updates.
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
end $$;
