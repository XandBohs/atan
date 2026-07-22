-- Apply after 202607220001_add_sync_timestamps.sql.
-- Owners can read tombstones for synchronization. Client deletes are blocked;
-- applications must mark rows with deleted_at instead.

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.routine_sets enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Anyone can read active exercises" on public.exercises;
drop policy if exists "Authenticated users can read active exercises" on public.exercises;
drop policy if exists "Users can manage their routines" on public.routines;
drop policy if exists "Users can manage exercises in their routines" on public.routine_exercises;
drop policy if exists "Users can manage sets in their routines" on public.routine_sets;
drop policy if exists "Users can manage their workout sessions" on public.workout_sessions;
drop policy if exists "Users can manage exercises in their sessions" on public.workout_exercises;
drop policy if exists "Users can manage sets in their sessions" on public.workout_sets;

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
