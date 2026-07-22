import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

export type Exercise = {
  id: string;
  name: string;
  mainMuscle: string;
  equipment: string | null;
};

export type RoutineSummary = {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  setCount: number;
  updatedAt: string;
};

export type RoutineSet = {
  id: string;
  setNumber: number;
  targetWeightKg: number | null;
  targetRepetitions: number | null;
  restSeconds: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  notes: string | null;
};

export type RoutineExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  mainMuscle: string;
  position: number;
  notes: string | null;
  sets: RoutineSet[];
};

export type RoutineDetail = RoutineSummary & { exercises: RoutineExercise[] };

export type WorkoutSet = {
  id: string;
  setNumber: number;
  weightKg: number | null;
  repetitions: number | null;
  restSeconds: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  notes: string | null;
  confirmedAt: string | null;
};

export type WorkoutExercise = {
  id: string;
  exerciseName: string;
  mainMuscle: string | null;
  position: number;
  sets: WorkoutSet[];
};

export type WorkoutSession = {
  id: string;
  routineId: string | null;
  routineName: string | null;
  status: 'active' | 'draft' | 'completed' | 'discarded';
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  exercises: WorkoutExercise[];
};

export type HistoryEntry = {
  id: string;
  routineName: string;
  startedAt: string;
  durationSeconds: number | null;
  confirmedSets: number;
  volumeKg: number;
};

export type SyncOperation = {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  payload: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

export type CreateRoutineInput = {
  name: string;
  exerciseId: string;
  targetWeightKg?: number | null;
  targetRepetitions?: number | null;
  restSeconds?: number | null;
  targetDurationSeconds?: number | null;
  targetDistanceMeters?: number | null;
  notes?: string | null;
};

export type UpdateRoutineInput = {
  name: string;
  description?: string | null;
};

export type UpdateWorkoutSetInput = Omit<WorkoutSet, 'id' | 'setNumber' | 'confirmedAt'> & {
  confirmed: boolean;
};

const db = SQLite.openDatabaseSync('ata-offline.db');
let initialization: Promise<void> | null = null;

const catalog: Array<Exercise & { instructions: string; exerciseType: string }> = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'Supino reto com barra', mainMuscle: 'Peito', equipment: 'Barra e banco', exerciseType: 'free_weight', instructions: 'Desca a barra com controle ate a linha do peito e empurre com estabilidade.' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'Agachamento livre', mainMuscle: 'Quadriceps', equipment: 'Barra e rack', exerciseType: 'free_weight', instructions: 'Desca com controle e mantenha o tronco firme durante todo o movimento.' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'Levantamento terra', mainMuscle: 'Posterior de coxa', equipment: 'Barra', exerciseType: 'free_weight', instructions: 'Mantenha a coluna neutra e a barra proxima ao corpo.' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'Puxada frontal', mainMuscle: 'Costas', equipment: 'Maquina de puxada', exerciseType: 'machine', instructions: 'Puxe a barra em direcao ao peito sem balancar o tronco.' },
  { id: '10000000-0000-4000-8000-000000000005', name: 'Remada baixa', mainMuscle: 'Costas', equipment: 'Polia baixa', exerciseType: 'cable', instructions: 'Puxe o cabo ate o abdomen mantendo o peito aberto.' },
  { id: '10000000-0000-4000-8000-000000000006', name: 'Desenvolvimento de ombros', mainMuscle: 'Ombros', equipment: 'Maquina', exerciseType: 'machine', instructions: 'Empurre as alcas acima da cabeca sem perder a postura.' },
  { id: '10000000-0000-4000-8000-000000000007', name: 'Elevacao lateral', mainMuscle: 'Ombros', equipment: 'Halteres', exerciseType: 'free_weight', instructions: 'Eleve os bracos ate a linha dos ombros com controle.' },
  { id: '10000000-0000-4000-8000-000000000008', name: 'Rosca direta', mainMuscle: 'Biceps', equipment: 'Barra', exerciseType: 'free_weight', instructions: 'Flexione os cotovelos sem projetar os ombros para frente.' },
  { id: '10000000-0000-4000-8000-000000000009', name: 'Triceps na polia', mainMuscle: 'Triceps', equipment: 'Polia alta', exerciseType: 'cable', instructions: 'Estenda os cotovelos mantendo-os proximos ao tronco.' },
  { id: '10000000-0000-4000-8000-000000000010', name: 'Leg press', mainMuscle: 'Quadriceps', equipment: 'Leg press', exerciseType: 'machine', instructions: 'Empurre a plataforma sem travar os joelhos.' },
  { id: '10000000-0000-4000-8000-000000000011', name: 'Mesa flexora', mainMuscle: 'Posterior de coxa', equipment: 'Mesa flexora', exerciseType: 'machine', instructions: 'Flexione os joelhos com controle e retorne lentamente.' },
  { id: '10000000-0000-4000-8000-000000000012', name: 'Prancha', mainMuscle: 'Abdomen', equipment: null, exerciseType: 'bodyweight', instructions: 'Mantenha o corpo alinhado e o abdomen contraido.' },
];

const now = () => new Date().toISOString();
const createId = () => Crypto.randomUUID();

async function queueOperation(operation: SyncOperation['operation'], entityType: string, entityId: string, payload: unknown) {
  await db.runAsync(
    `insert into sync_operations (id, operation, entity_type, entity_id, payload, attempts, created_at)
     values (?, ?, ?, ?, ?, 0, ?)`,
    [createId(), operation, entityType, entityId, JSON.stringify(payload), now()],
  );
}

export function initializeOfflineStore() {
  if (initialization) return initialization;

  initialization = (async () => {
    await db.execAsync(`
      pragma foreign_keys = on;
      create table if not exists app_metadata (key text primary key, value text not null);
      create table if not exists exercises (
        id text primary key, name text not null, instructions text not null, exercise_type text not null,
        main_muscle text not null, equipment text, created_at text not null, updated_at text not null, deleted_at text
      );
      create table if not exists routines (
        id text primary key, name text not null, description text, created_at text not null, updated_at text not null, deleted_at text
      );
      create table if not exists routine_exercises (
        id text primary key, routine_id text not null references routines(id) on delete cascade,
        exercise_id text not null references exercises(id), position integer not null, notes text,
        created_at text not null, updated_at text not null, deleted_at text, unique(routine_id, position)
      );
      create table if not exists routine_sets (
        id text primary key, routine_exercise_id text not null references routine_exercises(id) on delete cascade,
        set_number integer not null, target_weight_kg real, target_repetitions integer, rest_seconds integer,
        target_duration_seconds integer, target_distance_meters real, notes text,
        created_at text not null, updated_at text not null, deleted_at text, unique(routine_exercise_id, set_number)
      );
      create table if not exists workout_sessions (
        id text primary key, routine_id text references routines(id) on delete set null, device_id text not null,
        routine_name_snapshot text, status text not null, started_at text not null, completed_at text, duration_seconds integer, notes text,
        created_at text not null, updated_at text not null, deleted_at text
      );
      create table if not exists workout_exercises (
        id text primary key, session_id text not null references workout_sessions(id) on delete cascade,
        source_routine_exercise_id text, exercise_id text references exercises(id) on delete set null,
        position integer not null, exercise_name_snapshot text not null, main_muscle_snapshot text, notes text,
        created_at text not null, updated_at text not null, deleted_at text, unique(session_id, position)
      );
      create table if not exists workout_sets (
        id text primary key, workout_exercise_id text not null references workout_exercises(id) on delete cascade,
        set_number integer not null, weight_kg real, repetitions integer, rest_seconds integer,
        duration_seconds integer, distance_meters real, confirmed_at text, notes text,
        created_at text not null, updated_at text not null, deleted_at text, unique(workout_exercise_id, set_number)
      );
      create table if not exists sync_operations (
        id text primary key, operation text not null, entity_type text not null, entity_id text not null,
        payload text not null, attempts integer not null default 0, last_error text, created_at text not null
      );
      create index if not exists routines_updated_at_idx on routines(updated_at desc);
      create index if not exists workout_sessions_status_idx on workout_sessions(status, started_at desc);
      create index if not exists sync_operations_created_at_idx on sync_operations(created_at asc);
    `);

    const ensureColumn = async (table: string, column: string, definition: string) => {
      const columns = await db.getAllAsync<{ name: string }>(`pragma table_info(${table})`);
      if (!columns.some((item) => item.name === column)) await db.execAsync(`alter table ${table} add column ${definition}`);
    };
    await ensureColumn('exercises', 'updated_at', 'updated_at text');
    await ensureColumn('exercises', 'deleted_at', 'deleted_at text');
    await ensureColumn('routines', 'deleted_at', 'deleted_at text');
    await ensureColumn('routine_exercises', 'deleted_at', 'deleted_at text');
    await ensureColumn('routine_sets', 'deleted_at', 'deleted_at text');
    await ensureColumn('workout_sessions', 'routine_name_snapshot', 'routine_name_snapshot text');
    await ensureColumn('workout_sessions', 'deleted_at', 'deleted_at text');
    await ensureColumn('workout_exercises', 'deleted_at', 'deleted_at text');
    await ensureColumn('workout_sets', 'deleted_at', 'deleted_at text');
    await db.execAsync('pragma user_version = 2');

    for (const exercise of catalog) {
      await db.runAsync(
        `insert or ignore into exercises (id, name, instructions, exercise_type, main_muscle, equipment, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [exercise.id, exercise.name, exercise.instructions, exercise.exerciseType, exercise.mainMuscle, exercise.equipment, now(), now()],
      );
    }
  })();

  return initialization;
}

export async function getDeviceId() {
  await initializeOfflineStore();
  const stored = await db.getFirstAsync<{ value: string }>('select value from app_metadata where key = ?', ['device_id']);
  if (stored) return stored.value;

  const deviceId = createId();
  await db.runAsync('insert into app_metadata (key, value) values (?, ?)', ['device_id', deviceId]);
  return deviceId;
}

export async function prepareOfflineStoreForUser(userId: string) {
  await initializeOfflineStore();
  const stored = await db.getFirstAsync<{ value: string }>('select value from app_metadata where key = ?', ['auth_user_id']);
  if (stored?.value === userId) return;

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      delete from sync_operations;
      delete from workout_sets;
      delete from workout_exercises;
      delete from workout_sessions;
      delete from routine_sets;
      delete from routine_exercises;
      delete from routines;
    `);
    await db.runAsync(
      `insert into app_metadata (key, value) values ('auth_user_id', ?)
       on conflict(key) do update set value = excluded.value`,
      [userId],
    );
  });
}

export async function listExercises() {
  await initializeOfflineStore();
  const rows = await db.getAllAsync<{ id: string; name: string; main_muscle: string; equipment: string | null }>(
    'select id, name, main_muscle, equipment from exercises where deleted_at is null order by name',
  );
  return rows.map((row) => ({ id: row.id, name: row.name, mainMuscle: row.main_muscle, equipment: row.equipment }));
}

export async function listRoutines(): Promise<RoutineSummary[]> {
  await initializeOfflineStore();
  const rows = await db.getAllAsync<{
    id: string; name: string; description: string | null; updated_at: string; exercise_count: number; set_count: number;
  }>(`
    select r.id, r.name, r.description, r.updated_at,
      count(distinct re.id) as exercise_count, count(rs.id) as set_count
    from routines r
    left join routine_exercises re on re.routine_id = r.id and re.deleted_at is null
    left join routine_sets rs on rs.routine_exercise_id = re.id and rs.deleted_at is null
    where r.deleted_at is null
    group by r.id
    order by r.updated_at desc
  `);
  return rows.map((row) => ({
    id: row.id, name: row.name, description: row.description, updatedAt: row.updated_at,
    exerciseCount: row.exercise_count, setCount: row.set_count,
  }));
}

export async function getRoutine(routineId: string): Promise<RoutineDetail | null> {
  await initializeOfflineStore();
  const routine = await db.getFirstAsync<{ id: string; name: string; description: string | null; updated_at: string }>(
    'select id, name, description, updated_at from routines where id = ? and deleted_at is null', [routineId],
  );
  if (!routine) return null;

  const exerciseRows = await db.getAllAsync<{
    id: string; exercise_id: string; name: string; main_muscle: string; position: number; notes: string | null;
  }>(`
    select re.id, re.exercise_id, e.name, e.main_muscle, re.position, re.notes
    from routine_exercises re join exercises e on e.id = re.exercise_id
    where re.routine_id = ? and re.deleted_at is null and e.deleted_at is null order by re.position
  `, [routineId]);
  const setRows = await db.getAllAsync<{
    id: string; routine_exercise_id: string; set_number: number; target_weight_kg: number | null;
    target_repetitions: number | null; rest_seconds: number | null; target_duration_seconds: number | null;
    target_distance_meters: number | null; notes: string | null;
  }>('select * from routine_sets where deleted_at is null and routine_exercise_id in (select id from routine_exercises where routine_id = ? and deleted_at is null) order by set_number', [routineId]);

  return {
    id: routine.id, name: routine.name, description: routine.description, updatedAt: routine.updated_at,
    exerciseCount: exerciseRows.length, setCount: setRows.length,
    exercises: exerciseRows.map((exercise) => ({
      id: exercise.id, exerciseId: exercise.exercise_id, exerciseName: exercise.name, mainMuscle: exercise.main_muscle,
      position: exercise.position, notes: exercise.notes,
      sets: setRows.filter((set) => set.routine_exercise_id === exercise.id).map((set) => ({
        id: set.id, setNumber: set.set_number, targetWeightKg: set.target_weight_kg,
        targetRepetitions: set.target_repetitions, restSeconds: set.rest_seconds,
        targetDurationSeconds: set.target_duration_seconds, targetDistanceMeters: set.target_distance_meters,
        notes: set.notes,
      })),
    })),
  };
}

export async function createRoutine(input: CreateRoutineInput) {
  await initializeOfflineStore();
  const name = input.name.trim();
  if (!name) throw new Error('Informe um nome para a ficha.');
  const existingRoutines = await db.getFirstAsync<{ count: number }>('select count(*) as count from routines');
  if ((existingRoutines?.count ?? 0) >= 4) throw new Error('Voce pode manter no maximo 4 fichas neste dispositivo.');
  const exercise = await db.getFirstAsync<{ id: string }>('select id from exercises where id = ? and deleted_at is null', [input.exerciseId]);
  if (!exercise) throw new Error('Selecione um exercicio valido.');

  const timestamp = now();
  const routineId = createId();
  const routineExerciseId = createId();
  const routineSetId = createId();

  await db.withTransactionAsync(async () => {
    await db.runAsync('insert into routines (id, name, created_at, updated_at) values (?, ?, ?, ?)', [routineId, name, timestamp, timestamp]);
    await db.runAsync(
      `insert into routine_exercises (id, routine_id, exercise_id, position, created_at, updated_at)
       values (?, ?, ?, 1, ?, ?)`,
      [routineExerciseId, routineId, input.exerciseId, timestamp, timestamp],
    );
    await db.runAsync(
      `insert into routine_sets (id, routine_exercise_id, set_number, target_weight_kg, target_repetitions, rest_seconds,
       target_duration_seconds, target_distance_meters, notes, created_at, updated_at)
       values (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [routineSetId, routineExerciseId, input.targetWeightKg ?? null, input.targetRepetitions ?? null, input.restSeconds ?? null,
        input.targetDurationSeconds ?? null, input.targetDistanceMeters ?? null, input.notes?.trim() || null, timestamp, timestamp],
    );
    await queueOperation('create', 'routine', routineId, { id: routineId, name });
    await queueOperation('create', 'routine_exercise', routineExerciseId, { id: routineExerciseId, routineId, exerciseId: input.exerciseId });
    await queueOperation('create', 'routine_set', routineSetId, { id: routineSetId, routineExerciseId });
  });

  return routineId;
}

export async function updateRoutine(routineId: string, input: UpdateRoutineInput) {
  await initializeOfflineStore();
  const name = input.name.trim();
  if (!name) throw new Error('Informe um nome para a ficha.');
  const timestamp = now();
  await db.runAsync('update routines set name = ?, description = ?, updated_at = ? where id = ? and deleted_at is null', [name, input.description?.trim() || null, timestamp, routineId]);
  await queueOperation('update', 'routine', routineId, { id: routineId, name, description: input.description?.trim() || null });
}

export async function deleteRoutine(routineId: string) {
  await initializeOfflineStore();
  const timestamp = now();
  const exercises = await db.getAllAsync<{ id: string }>('select id from routine_exercises where routine_id = ? and deleted_at is null', [routineId]);
  const exerciseIds = exercises.map((exercise) => exercise.id);
  const sets = await db.getAllAsync<{ id: string }>('select id from routine_sets where routine_exercise_id in (select id from routine_exercises where routine_id = ?) and deleted_at is null', [routineId]);
  await db.withTransactionAsync(async () => {
    await db.runAsync('update routines set deleted_at = ?, updated_at = ? where id = ? and deleted_at is null', [timestamp, timestamp, routineId]);
    await db.runAsync('update routine_exercises set deleted_at = ?, updated_at = ? where routine_id = ? and deleted_at is null', [timestamp, timestamp, routineId]);
    for (const exerciseId of exerciseIds) {
      await db.runAsync('update routine_sets set deleted_at = ?, updated_at = ? where routine_exercise_id = ? and deleted_at is null', [timestamp, timestamp, exerciseId]);
      await queueOperation('delete', 'routine_exercise', exerciseId, { id: exerciseId, deletedAt: timestamp });
    }
    for (const set of sets) {
      await queueOperation('delete', 'routine_set', set.id, { id: set.id, deletedAt: timestamp });
    }
    await queueOperation('delete', 'routine', routineId, { id: routineId, deletedAt: timestamp });
  });
}

export async function startWorkoutSession(routineId: string) {
  await initializeOfflineStore();
  const active = await getActiveWorkoutSession();
  if (active) return active.id;

  const routine = await getRoutine(routineId);
  if (!routine || !routine.exercises.length) throw new Error('Esta ficha nao possui exercicios para iniciar.');
  const timestamp = now();
  const sessionId = createId();
  const deviceId = await getDeviceId();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `insert into workout_sessions (id, routine_id, device_id, routine_name_snapshot, status, started_at, created_at, updated_at)
       values (?, ?, ?, ?, 'active', ?, ?, ?)`,
      [sessionId, routineId, deviceId, routine.name, timestamp, timestamp, timestamp],
    );
    for (const exercise of routine.exercises) {
      const workoutExerciseId = createId();
      await db.runAsync(
        `insert into workout_exercises (id, session_id, source_routine_exercise_id, exercise_id, position,
         exercise_name_snapshot, main_muscle_snapshot, notes, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [workoutExerciseId, sessionId, exercise.id, exercise.exerciseId, exercise.position, exercise.exerciseName,
          exercise.mainMuscle, exercise.notes, timestamp, timestamp],
      );
      for (const set of exercise.sets) {
        const workoutSetId = createId();
        await db.runAsync(
          `insert into workout_sets (id, workout_exercise_id, set_number, weight_kg, repetitions, rest_seconds,
           duration_seconds, distance_meters, notes, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [workoutSetId, workoutExerciseId, set.setNumber, set.targetWeightKg, set.targetRepetitions,
            set.restSeconds, set.targetDurationSeconds, set.targetDistanceMeters, set.notes, timestamp, timestamp],
        );
        await queueOperation('create', 'workout_set', workoutSetId, { id: workoutSetId, sessionId });
      }
      await queueOperation('create', 'workout_exercise', workoutExerciseId, { id: workoutExerciseId, sessionId });
    }
    await queueOperation('create', 'workout_session', sessionId, { id: sessionId, routineId, deviceId });
  });
  return sessionId;
}

export async function getActiveWorkoutSession() {
  await initializeOfflineStore();
  const row = await db.getFirstAsync<{ id: string }>(
    "select id from workout_sessions where deleted_at is null and status in ('active', 'draft') order by started_at desc limit 1",
  );
  return row ? getWorkoutSession(row.id) : null;
}

export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
  await initializeOfflineStore();
  const session = await db.getFirstAsync<{
    id: string; routine_id: string | null; routine_name: string | null; status: WorkoutSession['status'];
    started_at: string; completed_at: string | null; duration_seconds: number | null;
  }>(`
    select ws.id, ws.routine_id, coalesce(r.name, ws.routine_name_snapshot) as routine_name, ws.status, ws.started_at, ws.completed_at, ws.duration_seconds
    from workout_sessions ws left join routines r on r.id = ws.routine_id and r.deleted_at is null where ws.id = ? and ws.deleted_at is null
  `, [sessionId]);
  if (!session) return null;

  const exerciseRows = await db.getAllAsync<{
    id: string; exercise_name_snapshot: string; main_muscle_snapshot: string | null; position: number;
  }>('select id, exercise_name_snapshot, main_muscle_snapshot, position from workout_exercises where session_id = ? and deleted_at is null order by position', [sessionId]);
  const setRows = await db.getAllAsync<{
    id: string; workout_exercise_id: string; set_number: number; weight_kg: number | null; repetitions: number | null;
    rest_seconds: number | null; duration_seconds: number | null; distance_meters: number | null; notes: string | null; confirmed_at: string | null;
  }>('select * from workout_sets where deleted_at is null and workout_exercise_id in (select id from workout_exercises where session_id = ? and deleted_at is null) order by set_number', [sessionId]);

  return {
    id: session.id, routineId: session.routine_id, routineName: session.routine_name, status: session.status,
    startedAt: session.started_at, completedAt: session.completed_at, durationSeconds: session.duration_seconds,
    exercises: exerciseRows.map((exercise) => ({
      id: exercise.id, exerciseName: exercise.exercise_name_snapshot, mainMuscle: exercise.main_muscle_snapshot,
      position: exercise.position,
      sets: setRows.filter((set) => set.workout_exercise_id === exercise.id).map((set) => ({
        id: set.id, setNumber: set.set_number, weightKg: set.weight_kg, repetitions: set.repetitions,
        restSeconds: set.rest_seconds, durationSeconds: set.duration_seconds, distanceMeters: set.distance_meters,
        notes: set.notes, confirmedAt: set.confirmed_at,
      })),
    })),
  };
}

export async function updateWorkoutSet(setId: string, input: UpdateWorkoutSetInput) {
  await initializeOfflineStore();
  const timestamp = now();
  await db.runAsync(
    `update workout_sets set weight_kg = ?, repetitions = ?, rest_seconds = ?, duration_seconds = ?, distance_meters = ?,
     notes = ?, confirmed_at = ?, updated_at = ? where id = ? and deleted_at is null`,
    [input.weightKg, input.repetitions, input.restSeconds, input.durationSeconds, input.distanceMeters,
      input.notes?.trim() || null, input.confirmed ? timestamp : null, timestamp, setId],
  );
  await queueOperation('update', 'workout_set', setId, { id: setId, ...input, confirmedAt: input.confirmed ? timestamp : null });
}

export async function completeWorkoutSession(sessionId: string) {
  await initializeOfflineStore();
  const confirmed = await db.getFirstAsync<{ count: number }>(`
    select count(*) as count from workout_sets where confirmed_at is not null
    and workout_exercise_id in (select id from workout_exercises where session_id = ?)
  `, [sessionId]);
  if (!confirmed?.count) throw new Error('Confirme pelo menos uma serie antes de concluir.');

  const session = await db.getFirstAsync<{ started_at: string }>('select started_at from workout_sessions where id = ? and deleted_at is null', [sessionId]);
  if (!session) throw new Error('Sessao nao encontrada.');
  const completedAt = now();
  const durationSeconds = Math.max(0, Math.floor((Date.parse(completedAt) - Date.parse(session.started_at)) / 1000));
  await db.runAsync(
    "update workout_sessions set status = 'completed', completed_at = ?, duration_seconds = ?, updated_at = ? where id = ?",
    [completedAt, durationSeconds, completedAt, sessionId],
  );
  await queueOperation('update', 'workout_session', sessionId, { id: sessionId, status: 'completed', completedAt, durationSeconds });
}

export async function saveWorkoutDraft(sessionId: string) {
  await initializeOfflineStore();
  const timestamp = now();
  await db.runAsync(
    "update workout_sessions set status = 'draft', updated_at = ? where id = ? and status = 'active'",
    [timestamp, sessionId],
  );
  await queueOperation('update', 'workout_session', sessionId, { id: sessionId, status: 'draft' });
}

export async function discardWorkoutSession(sessionId: string) {
  await initializeOfflineStore();
  const timestamp = now();
  const exercises = await db.getAllAsync<{ id: string }>('select id from workout_exercises where session_id = ? and deleted_at is null', [sessionId]);
  const sets = await db.getAllAsync<{ id: string }>('select id from workout_sets where workout_exercise_id in (select id from workout_exercises where session_id = ?) and deleted_at is null', [sessionId]);
  await db.withTransactionAsync(async () => {
    await db.runAsync('update workout_sessions set deleted_at = ?, updated_at = ? where id = ? and deleted_at is null', [timestamp, timestamp, sessionId]);
    await db.runAsync('update workout_exercises set deleted_at = ?, updated_at = ? where session_id = ? and deleted_at is null', [timestamp, timestamp, sessionId]);
    await db.runAsync('update workout_sets set deleted_at = ?, updated_at = ? where workout_exercise_id in (select id from workout_exercises where session_id = ?) and deleted_at is null', [timestamp, timestamp, sessionId]);
    for (const exercise of exercises) {
      await queueOperation('delete', 'workout_exercise', exercise.id, { id: exercise.id, deletedAt: timestamp });
    }
    for (const set of sets) {
      await queueOperation('delete', 'workout_set', set.id, { id: set.id, deletedAt: timestamp });
    }
    await queueOperation('delete', 'workout_session', sessionId, { id: sessionId, deletedAt: timestamp });
  });
}

export async function listHistory(): Promise<HistoryEntry[]> {
  await initializeOfflineStore();
  const rows = await db.getAllAsync<{
    id: string; routine_name: string | null; started_at: string; duration_seconds: number | null;
    confirmed_sets: number; volume_kg: number;
  }>(`
    select ws.id, coalesce(r.name, ws.routine_name_snapshot) as routine_name, ws.started_at, ws.duration_seconds,
      count(wset.id) as confirmed_sets,
      coalesce(sum(coalesce(wset.weight_kg, 0) * coalesce(wset.repetitions, 0)), 0) as volume_kg
    from workout_sessions ws
    left join routines r on r.id = ws.routine_id and r.deleted_at is null
    left join workout_exercises we on we.session_id = ws.id and we.deleted_at is null
    left join workout_sets wset on wset.workout_exercise_id = we.id and wset.confirmed_at is not null and wset.deleted_at is null
    where ws.status = 'completed' and ws.deleted_at is null
    group by ws.id
    order by ws.completed_at desc
  `);
  return rows.map((row) => ({
    id: row.id, routineName: row.routine_name ?? 'Treino sem ficha', startedAt: row.started_at,
    durationSeconds: row.duration_seconds, confirmedSets: row.confirmed_sets, volumeKg: row.volume_kg,
  }));
}

export async function listPendingSyncOperations() {
  await initializeOfflineStore();
  const rows = await db.getAllAsync<{
    id: string; operation: SyncOperation['operation']; entity_type: string; entity_id: string;
    payload: string; attempts: number; last_error: string | null; created_at: string;
  }>('select * from sync_operations order by created_at');
  return rows.map((row) => ({
    id: row.id, operation: row.operation, entityType: row.entity_type, entityId: row.entity_id,
    payload: row.payload, attempts: row.attempts, lastError: row.last_error, createdAt: row.created_at,
  }));
}
