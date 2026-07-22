-- Atã MVP database schema
-- Run this file in the Supabase SQL editor.

create extension if not exists pgcrypto;

create type public.profile_visibility as enum ('private', 'public');
create type public.exercise_type as enum ('free_weight', 'machine', 'cable', 'bodyweight', 'cardio');
create type public.workout_status as enum ('active', 'draft', 'completed', 'discarded');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  birth_date date,
  sex text check (sex is null or sex in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  current_weight_kg numeric(6, 2) check (current_weight_kg is null or current_weight_kg > 0),
  height_cm numeric(5, 2) check (height_cm is null or height_cm > 0),
  description text,
  visibility public.profile_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  instructions text,
  exercise_type public.exercise_type not null,
  main_muscle text not null,
  equipment text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint routines_name_not_blank check (length(trim(name)) > 0)
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position integer not null check (position > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (routine_id, position),
  unique (routine_id, exercise_id)
);

create table public.routine_sets (
  id uuid primary key default gen_random_uuid(),
  routine_exercise_id uuid not null references public.routine_exercises (id) on delete cascade,
  set_number integer not null check (set_number > 0),
  target_weight_kg numeric(7, 2) check (target_weight_kg is null or target_weight_kg >= 0),
  target_repetitions integer check (target_repetitions is null or target_repetitions > 0),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  target_duration_seconds integer check (target_duration_seconds is null or target_duration_seconds > 0),
  target_distance_meters numeric(10, 2) check (target_distance_meters is null or target_distance_meters > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (routine_exercise_id, set_number)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  device_id text not null,
  status public.workout_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint completed_session_has_date check (status <> 'completed' or completed_at is not null)
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  position integer not null check (position > 0),
  exercise_name_snapshot text not null,
  main_muscle_snapshot text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (session_id, position)
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number integer not null check (set_number > 0),
  weight_kg numeric(7, 2) check (weight_kg is null or weight_kg >= 0),
  repetitions integer check (repetitions is null or repetitions > 0),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  distance_meters numeric(10, 2) check (distance_meters is null or distance_meters > 0),
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (workout_exercise_id, set_number)
);

create index routines_user_id_idx on public.routines (user_id);
create index routines_active_user_id_idx on public.routines (user_id) where deleted_at is null;
create index workout_sessions_user_date_idx on public.workout_sessions (user_id, started_at desc);
create index workout_sessions_active_user_date_idx on public.workout_sessions (user_id, started_at desc) where deleted_at is null;
create index workout_exercises_session_id_idx on public.workout_exercises (session_id);
create index workout_sets_confirmed_at_idx on public.workout_sets (confirmed_at) where confirmed_at is not null;
create unique index one_active_session_per_device_idx
  on public.workout_sessions (user_id, device_id)
  where status = 'active';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger exercises_set_updated_at before update on public.exercises
for each row execute function public.set_updated_at();
create trigger routines_set_updated_at before update on public.routines
for each row execute function public.set_updated_at();
create trigger routine_exercises_set_updated_at before update on public.routine_exercises
for each row execute function public.set_updated_at();
create trigger routine_sets_set_updated_at before update on public.routine_sets
for each row execute function public.set_updated_at();
create trigger workout_sessions_set_updated_at before update on public.workout_sessions
for each row execute function public.set_updated_at();
create trigger workout_exercises_set_updated_at before update on public.workout_exercises
for each row execute function public.set_updated_at();
create trigger workout_sets_set_updated_at before update on public.workout_sets
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

create trigger routines_enforce_limit
  before insert on public.routines
  for each row execute function public.enforce_routine_limits();

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

create trigger routine_exercises_enforce_limit
  before insert on public.routine_exercises
  for each row execute function public.enforce_routine_exercise_limit();

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.routine_sets enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Authenticated users can read active exercises" on public.exercises for select
using (auth.role() = 'authenticated' and is_active = true and deleted_at is null);

create policy "Users can read their own routines" on public.routines for select using (auth.uid() = user_id);
create policy "Users can create their own routines" on public.routines for insert with check (auth.uid() = user_id);
create policy "Users can update their own routines" on public.routines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can read exercises in their routines" on public.routine_exercises for select
using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Users can create exercises in their routines" on public.routine_exercises for insert
with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Users can update exercises in their routines" on public.routine_exercises for update
using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()))
with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy "Users can read sets in their routines" on public.routine_sets for select
using (exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where re.id = routine_exercise_id and r.user_id = auth.uid()));
create policy "Users can create sets in their routines" on public.routine_sets for insert
with check (exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where re.id = routine_exercise_id and r.user_id = auth.uid()));
create policy "Users can update sets in their routines" on public.routine_sets for update
using (exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where re.id = routine_exercise_id and r.user_id = auth.uid()))
with check (exists (select 1 from public.routine_exercises re join public.routines r on r.id = re.routine_id where re.id = routine_exercise_id and r.user_id = auth.uid()));

create policy "Users can read their own workout sessions" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "Users can create their own workout sessions" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own workout sessions" on public.workout_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can read exercises in their sessions" on public.workout_exercises for select
using (exists (select 1 from public.workout_sessions ws where ws.id = session_id and ws.user_id = auth.uid()));
create policy "Users can create exercises in their sessions" on public.workout_exercises for insert
with check (exists (select 1 from public.workout_sessions ws where ws.id = session_id and ws.user_id = auth.uid()));
create policy "Users can update exercises in their sessions" on public.workout_exercises for update
using (exists (select 1 from public.workout_sessions ws where ws.id = session_id and ws.user_id = auth.uid()))
with check (exists (select 1 from public.workout_sessions ws where ws.id = session_id and ws.user_id = auth.uid()));
create policy "Users can read sets in their sessions" on public.workout_sets for select
using (exists (select 1 from public.workout_exercises we join public.workout_sessions ws on ws.id = we.session_id where we.id = workout_exercise_id and ws.user_id = auth.uid()));
create policy "Users can create sets in their sessions" on public.workout_sets for insert
with check (exists (select 1 from public.workout_exercises we join public.workout_sessions ws on ws.id = we.session_id where we.id = workout_exercise_id and ws.user_id = auth.uid()));
create policy "Users can update sets in their sessions" on public.workout_sets for update
using (exists (select 1 from public.workout_exercises we join public.workout_sessions ws on ws.id = we.session_id where we.id = workout_exercise_id and ws.user_id = auth.uid()))
with check (exists (select 1 from public.workout_exercises we join public.workout_sessions ws on ws.id = we.session_id where we.id = workout_exercise_id and ws.user_id = auth.uid()));

insert into public.exercises (name, instructions, exercise_type, main_muscle, equipment)
values
  ('Supino reto com barra', 'Desça a barra com controle até a linha do peito e empurre sem perder a estabilidade dos ombros.', 'free_weight', 'Peito', 'Barra e banco'),
  ('Agachamento livre', 'Mantenha o tronco firme, desça com controle e empurre o chão para retornar.', 'free_weight', 'Quadríceps', 'Barra e rack'),
  ('Levantamento terra', 'Aproxime a barra do corpo, mantenha a coluna neutra e estenda quadril e joelhos juntos.', 'free_weight', 'Posterior de coxa', 'Barra'),
  ('Puxada frontal', 'Puxe a barra em direção ao peito sem balançar o tronco.', 'machine', 'Costas', 'Máquina de puxada'),
  ('Remada baixa', 'Puxe o cabo até o abdômen mantendo o peito aberto.', 'cable', 'Costas', 'Polia baixa'),
  ('Desenvolvimento de ombros', 'Empurre as alças acima da cabeça sem hiperestender a lombar.', 'machine', 'Ombros', 'Máquina'),
  ('Elevação lateral', 'Eleve os braços até a linha dos ombros com os cotovelos levemente flexionados.', 'free_weight', 'Ombros', 'Halteres'),
  ('Rosca direta', 'Flexione os cotovelos sem projetar os ombros para frente.', 'free_weight', 'Bíceps', 'Barra'),
  ('Tríceps na polia', 'Estenda os cotovelos mantendo-os próximos ao tronco.', 'cable', 'Tríceps', 'Polia alta'),
  ('Leg press', 'Desça até uma amplitude confortável e empurre a plataforma sem travar os joelhos.', 'machine', 'Quadríceps', 'Leg press'),
  ('Mesa flexora', 'Flexione os joelhos com controle e retorne lentamente.', 'machine', 'Posterior de coxa', 'Mesa flexora'),
  ('Prancha', 'Mantenha o corpo alinhado e o abdômen contraído durante todo o exercício.', 'bodyweight', 'Abdômen', null)
on conflict (name) do nothing;
