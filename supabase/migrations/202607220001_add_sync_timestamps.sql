-- Apply this migration to existing Supabase projects that already ran schema.sql.

alter table public.profiles add column if not exists deleted_at timestamptz;
alter table public.exercises add column if not exists deleted_at timestamptz;
alter table public.routines add column if not exists deleted_at timestamptz;
alter table public.routine_exercises add column if not exists deleted_at timestamptz;
alter table public.routine_sets add column if not exists deleted_at timestamptz;
alter table public.workout_sessions add column if not exists deleted_at timestamptz;
alter table public.workout_exercises add column if not exists deleted_at timestamptz;
alter table public.workout_sets add column if not exists deleted_at timestamptz;

create index if not exists routines_active_user_id_idx
  on public.routines (user_id) where deleted_at is null;
create index if not exists workout_sessions_active_user_date_idx
  on public.workout_sessions (user_id, started_at desc) where deleted_at is null;

create or replace function public.enforce_routine_limits()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.routines where user_id = new.user_id and not is_archived and deleted_at is null) >= 4 then
    raise exception 'A user can have at most 4 active routines';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_routine_exercise_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.routine_exercises where routine_id = new.routine_id and deleted_at is null) >= 10 then
    raise exception 'A routine can have at most 10 exercises';
  end if;
  return new;
end;
$$;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id and deleted_at is null);
drop policy if exists "Anyone can read active exercises" on public.exercises;
create policy "Anyone can read active exercises" on public.exercises for select using (is_active = true and deleted_at is null);
drop policy if exists "Users can manage their routines" on public.routines;
create policy "Users can manage their routines" on public.routines for all
using (auth.uid() = user_id and deleted_at is null)
with check (auth.uid() = user_id);
