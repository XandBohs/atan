import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type Exercise = { id: string; name: string; mainMuscle: string; equipment: string | null };
export type RoutineSummary = { id: string; name: string; description: string | null; exerciseCount: number; setCount: number; updatedAt: string };
export type RoutineSet = { id: string; setNumber: number; targetWeightKg: number | null; targetRepetitions: number | null; restSeconds: number | null; targetDurationSeconds: number | null; targetDistanceMeters: number | null; notes: string | null };
export type RoutineExercise = { id: string; exerciseId: string; exerciseName: string; mainMuscle: string; position: number; notes: string | null; sets: RoutineSet[] };
export type RoutineDetail = RoutineSummary & { exercises: RoutineExercise[] };
export type WorkoutSet = { id: string; setNumber: number; weightKg: number | null; repetitions: number | null; restSeconds: number | null; durationSeconds: number | null; distanceMeters: number | null; notes: string | null; confirmedAt: string | null };
export type WorkoutExercise = { id: string; exerciseName: string; mainMuscle: string | null; position: number; sets: WorkoutSet[] };
export type WorkoutSession = { id: string; routineId: string | null; routineName: string | null; status: 'active' | 'draft' | 'completed' | 'discarded'; startedAt: string; completedAt: string | null; durationSeconds: number | null; exercises: WorkoutExercise[] };
export type HistoryEntry = { id: string; routineName: string; startedAt: string; durationSeconds: number | null; confirmedSets: number; volumeKg: number };
export type SyncOperation = { id: string; operation: 'create' | 'update' | 'delete'; entityType: string; entityId: string; payload: string; attempts: number; lastError: string | null; createdAt: string };
export type CreateRoutineInput = { name: string; exerciseId: string; targetWeightKg?: number | null; targetRepetitions?: number | null; restSeconds?: number | null; targetDurationSeconds?: number | null; targetDistanceMeters?: number | null; notes?: string | null };
export type UpdateRoutineInput = { name: string; description?: string | null };
export type UpdateWorkoutSetInput = Omit<WorkoutSet, 'id' | 'setNumber' | 'confirmedAt'> & { confirmed: boolean };

type SyncMetadata = { createdAt: string; updatedAt: string; deletedAt: string | null };
type StoredRoutine = { id: string; name: string; description: string | null } & SyncMetadata;
type StoredRoutineExercise = { id: string; routineId: string; exerciseId: string; position: number; notes: string | null } & SyncMetadata;
type StoredRoutineSet = RoutineSet & { routineExerciseId: string } & SyncMetadata;
type StoredSession = Omit<WorkoutSession, 'exercises'> & { routineNameSnapshot: string | null } & SyncMetadata;
type StoredWorkoutExercise = { id: string; sessionId: string; exerciseId: string; position: number; exerciseName: string; mainMuscle: string | null; notes: string | null } & SyncMetadata;
type StoredWorkoutSet = WorkoutSet & { workoutExerciseId: string } & SyncMetadata;
type StoredDatabase = {
  deviceId: string | null;
  authUserId?: string | null;
  routines: StoredRoutine[];
  routineExercises: StoredRoutineExercise[];
  routineSets: StoredRoutineSet[];
  sessions: StoredSession[];
  workoutExercises: StoredWorkoutExercise[];
  workoutSets: StoredWorkoutSet[];
  syncOperations: SyncOperation[];
};

const STORAGE_KEY = '@ata:offline-web-store:v1';
const now = () => new Date().toISOString();
const createId = () => Crypto.randomUUID();
const catalogEntries: Array<[string, string, string, string | null]> = [
  ['001', 'Supino reto com barra', 'Peito', 'Barra e banco'], ['002', 'Agachamento livre', 'Quadriceps', 'Barra e rack'],
  ['003', 'Levantamento terra', 'Posterior de coxa', 'Barra'], ['004', 'Puxada frontal', 'Costas', 'Maquina de puxada'],
  ['005', 'Remada baixa', 'Costas', 'Polia baixa'], ['006', 'Desenvolvimento de ombros', 'Ombros', 'Maquina'],
  ['007', 'Elevacao lateral', 'Ombros', 'Halteres'], ['008', 'Rosca direta', 'Biceps', 'Barra'],
  ['009', 'Triceps na polia', 'Triceps', 'Polia alta'], ['010', 'Leg press', 'Quadriceps', 'Leg press'],
  ['011', 'Mesa flexora', 'Posterior de coxa', 'Mesa flexora'], ['012', 'Prancha', 'Abdomen', null],
];
const catalog: Exercise[] = catalogEntries.map(([suffix, name, mainMuscle, equipment]) => ({ id: `10000000-0000-4000-8000-000000000${suffix}`, name, mainMuscle, equipment }));

const emptyDatabase = (): StoredDatabase => ({ deviceId: null, authUserId: null, routines: [], routineExercises: [], routineSets: [], sessions: [], workoutExercises: [], workoutSets: [], syncOperations: [] });

async function readDatabase() {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return emptyDatabase();
  const stored = JSON.parse(value) as StoredDatabase;
  const timestamp = now();
  return {
    ...emptyDatabase(), ...stored,
    routines: stored.routines.map((item) => ({ ...item, createdAt: item.createdAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
    routineExercises: stored.routineExercises.map((item) => ({ ...item, createdAt: item.createdAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
    routineSets: stored.routineSets.map((item) => ({ ...item, createdAt: item.createdAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
    sessions: stored.sessions.map((item) => ({ ...item, createdAt: item.createdAt ?? item.startedAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
    workoutExercises: stored.workoutExercises.map((item) => ({ ...item, createdAt: item.createdAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
    workoutSets: stored.workoutSets.map((item) => ({ ...item, createdAt: item.createdAt ?? timestamp, updatedAt: item.updatedAt ?? timestamp, deletedAt: item.deletedAt ?? null })),
  };
}

async function writeDatabase(database: StoredDatabase) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function addOperation(database: StoredDatabase, operation: SyncOperation['operation'], entityType: string, entityId: string, payload: unknown) {
  database.syncOperations.push({ id: createId(), operation, entityType, entityId, payload: JSON.stringify(payload), attempts: 0, lastError: null, createdAt: now() });
}

export async function initializeOfflineStore() {
  const database = await readDatabase();
  await writeDatabase(database);
}

export async function getDeviceId() {
  const database = await readDatabase();
  if (!database.deviceId) {
    database.deviceId = createId();
    await writeDatabase(database);
  }
  return database.deviceId;
}

export async function prepareOfflineStoreForUser(userId: string) {
  const database = await readDatabase();
  if (database.authUserId === userId) return;
  database.authUserId = userId;
  database.routines = [];
  database.routineExercises = [];
  database.routineSets = [];
  database.sessions = [];
  database.workoutExercises = [];
  database.workoutSets = [];
  database.syncOperations = [];
  await writeDatabase(database);
}

export async function listExercises() {
  return [...catalog].sort((first, second) => first.name.localeCompare(second.name));
}

export async function listRoutines(): Promise<RoutineSummary[]> {
  const database = await readDatabase();
  return database.routines.filter((routine) => !routine.deletedAt).map((routine) => ({
    id: routine.id, name: routine.name, description: routine.description, updatedAt: routine.updatedAt,
    exerciseCount: database.routineExercises.filter((exercise) => exercise.routineId === routine.id && !exercise.deletedAt).length,
    setCount: database.routineSets.filter((set) => !set.deletedAt && database.routineExercises.some((exercise) => exercise.id === set.routineExerciseId && exercise.routineId === routine.id && !exercise.deletedAt)).length,
  })).sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

export async function getRoutine(routineId: string): Promise<RoutineDetail | null> {
  const database = await readDatabase();
  const routine = database.routines.find((item) => item.id === routineId && !item.deletedAt);
  if (!routine) return null;
  const exercises = database.routineExercises.filter((item) => item.routineId === routineId && !item.deletedAt).sort((first, second) => first.position - second.position).map((item) => {
    const exercise = catalog.find((candidate) => candidate.id === item.exerciseId);
    const sets = database.routineSets.filter((set) => set.routineExerciseId === item.id && !set.deletedAt).sort((first, second) => first.setNumber - second.setNumber).map(({ routineExerciseId: _routineExerciseId, createdAt: _createdAt, updatedAt: _updatedAt, deletedAt: _deletedAt, ...set }) => set);
    return { id: item.id, exerciseId: item.exerciseId, exerciseName: exercise?.name ?? 'Exercicio removido', mainMuscle: exercise?.mainMuscle ?? 'Exercicio', position: item.position, notes: item.notes, sets };
  });
  return { id: routine.id, name: routine.name, description: routine.description, updatedAt: routine.updatedAt, exerciseCount: exercises.length, setCount: exercises.reduce((count, exercise) => count + exercise.sets.length, 0), exercises };
}

export async function createRoutine(input: CreateRoutineInput) {
  const database = await readDatabase();
  const name = input.name.trim();
  if (!name) throw new Error('Informe um nome para a ficha.');
  if (database.routines.filter((routine) => !routine.deletedAt).length >= 4) throw new Error('Voce pode manter no maximo 4 fichas neste dispositivo.');
  if (!catalog.some((exercise) => exercise.id === input.exerciseId)) throw new Error('Selecione um exercicio valido.');
  const timestamp = now();
  const routineId = createId();
  const routineExerciseId = createId();
  const routineSetId = createId();
  database.routines.push({ id: routineId, name, description: null, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
  database.routineExercises.push({ id: routineExerciseId, routineId, exerciseId: input.exerciseId, position: 1, notes: null, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
  database.routineSets.push({ id: routineSetId, routineExerciseId, setNumber: 1, targetWeightKg: input.targetWeightKg ?? null, targetRepetitions: input.targetRepetitions ?? null, restSeconds: input.restSeconds ?? null, targetDurationSeconds: input.targetDurationSeconds ?? null, targetDistanceMeters: input.targetDistanceMeters ?? null, notes: input.notes?.trim() || null, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
  addOperation(database, 'create', 'routine', routineId, { id: routineId, name });
  addOperation(database, 'create', 'routine_exercise', routineExerciseId, { id: routineExerciseId, routineId, exerciseId: input.exerciseId });
  addOperation(database, 'create', 'routine_set', routineSetId, { id: routineSetId, routineExerciseId });
  await writeDatabase(database);
  return routineId;
}

export async function updateRoutine(routineId: string, input: UpdateRoutineInput) {
  const database = await readDatabase();
  const routine = database.routines.find((item) => item.id === routineId && !item.deletedAt);
  const name = input.name.trim();
  if (!routine || !name) throw new Error('Ficha nao encontrada ou sem nome.');
  routine.name = name; routine.description = input.description?.trim() || null; routine.updatedAt = now();
  addOperation(database, 'update', 'routine', routineId, { id: routineId, name: routine.name, description: routine.description });
  await writeDatabase(database);
}

export async function deleteRoutine(routineId: string) {
  const database = await readDatabase();
  const timestamp = now();
  const routine = database.routines.find((item) => item.id === routineId && !item.deletedAt);
  if (!routine) return;
  routine.deletedAt = timestamp; routine.updatedAt = timestamp;
  const exercises = database.routineExercises.filter((item) => item.routineId === routineId && !item.deletedAt);
  exercises.forEach((exercise) => {
    exercise.deletedAt = timestamp; exercise.updatedAt = timestamp;
    addOperation(database, 'delete', 'routine_exercise', exercise.id, { id: exercise.id, deletedAt: timestamp });
  });
  database.routineSets.filter((item) => exercises.some((exercise) => exercise.id === item.routineExerciseId) && !item.deletedAt).forEach((set) => {
    set.deletedAt = timestamp; set.updatedAt = timestamp;
    addOperation(database, 'delete', 'routine_set', set.id, { id: set.id, deletedAt: timestamp });
  });
  addOperation(database, 'delete', 'routine', routineId, { id: routineId, deletedAt: timestamp });
  await writeDatabase(database);
}

export async function startWorkoutSession(routineId: string) {
  const openSession = await getActiveWorkoutSession();
  if (openSession) return openSession.id;
  const database = await readDatabase();
  const routine = await getRoutine(routineId);
  if (!routine || !routine.exercises.length) throw new Error('Esta ficha nao possui exercicios para iniciar.');
  const timestamp = now(); const sessionId = createId(); const deviceId = await getDeviceId();
  database.deviceId = deviceId;
  database.sessions.push({ id: sessionId, routineId, routineName: routine.name, routineNameSnapshot: routine.name, status: 'active', startedAt: timestamp, completedAt: null, durationSeconds: null, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
  routine.exercises.forEach((exercise) => {
    const workoutExerciseId = createId();
    database.workoutExercises.push({ id: workoutExerciseId, sessionId, exerciseId: exercise.exerciseId, position: exercise.position, exerciseName: exercise.exerciseName, mainMuscle: exercise.mainMuscle, notes: exercise.notes, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
    exercise.sets.forEach((set) => {
      const workoutSetId = createId();
      database.workoutSets.push({ id: workoutSetId, workoutExerciseId, setNumber: set.setNumber, weightKg: set.targetWeightKg, repetitions: set.targetRepetitions, restSeconds: set.restSeconds, durationSeconds: set.targetDurationSeconds, distanceMeters: set.targetDistanceMeters, notes: set.notes, confirmedAt: null, createdAt: timestamp, updatedAt: timestamp, deletedAt: null });
      addOperation(database, 'create', 'workout_set', workoutSetId, { id: workoutSetId, sessionId });
    });
    addOperation(database, 'create', 'workout_exercise', workoutExerciseId, { id: workoutExerciseId, sessionId });
  });
  addOperation(database, 'create', 'workout_session', sessionId, { id: sessionId, routineId, deviceId });
  await writeDatabase(database);
  return sessionId;
}

export async function getActiveWorkoutSession() {
  const database = await readDatabase();
  const session = database.sessions.filter((item) => !item.deletedAt && (item.status === 'active' || item.status === 'draft')).sort((first, second) => second.startedAt.localeCompare(first.startedAt))[0];
  return session ? getWorkoutSession(session.id) : null;
}

export async function getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
  const database = await readDatabase();
  const session = database.sessions.find((item) => item.id === sessionId && !item.deletedAt);
  if (!session) return null;
  const exercises = database.workoutExercises.filter((item) => item.sessionId === sessionId && !item.deletedAt).sort((first, second) => first.position - second.position).map((exercise) => ({
    id: exercise.id, exerciseName: exercise.exerciseName, mainMuscle: exercise.mainMuscle, position: exercise.position,
    sets: database.workoutSets.filter((set) => set.workoutExerciseId === exercise.id && !set.deletedAt).sort((first, second) => first.setNumber - second.setNumber).map(({ workoutExerciseId: _workoutExerciseId, createdAt: _createdAt, updatedAt: _updatedAt, deletedAt: _deletedAt, ...set }) => set),
  }));
  return { id: session.id, routineId: session.routineId, routineName: session.routineNameSnapshot, status: session.status, startedAt: session.startedAt, completedAt: session.completedAt, durationSeconds: session.durationSeconds, exercises };
}

export async function updateWorkoutSet(setId: string, input: UpdateWorkoutSetInput) {
  const database = await readDatabase(); const set = database.workoutSets.find((item) => item.id === setId && !item.deletedAt);
  if (!set) throw new Error('Serie nao encontrada.');
  const confirmedAt = input.confirmed ? now() : null;
  Object.assign(set, { weightKg: input.weightKg, repetitions: input.repetitions, restSeconds: input.restSeconds, durationSeconds: input.durationSeconds, distanceMeters: input.distanceMeters, notes: input.notes?.trim() || null, confirmedAt, updatedAt: now() });
  addOperation(database, 'update', 'workout_set', setId, { id: setId, ...input, confirmedAt });
  await writeDatabase(database);
}

export async function completeWorkoutSession(sessionId: string) {
  const database = await readDatabase(); const session = database.sessions.find((item) => item.id === sessionId && !item.deletedAt);
  if (!session) throw new Error('Sessao nao encontrada.');
  const exerciseIds = database.workoutExercises.filter((item) => item.sessionId === sessionId && !item.deletedAt).map((item) => item.id);
  if (!database.workoutSets.some((set) => exerciseIds.includes(set.workoutExerciseId) && set.confirmedAt && !set.deletedAt)) throw new Error('Confirme pelo menos uma serie antes de concluir.');
  const completedAt = now(); session.status = 'completed'; session.completedAt = completedAt; session.updatedAt = completedAt; session.durationSeconds = Math.max(0, Math.floor((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000));
  addOperation(database, 'update', 'workout_session', sessionId, { id: sessionId, status: 'completed', completedAt, durationSeconds: session.durationSeconds });
  await writeDatabase(database);
}

export async function saveWorkoutDraft(sessionId: string) {
  const database = await readDatabase(); const session = database.sessions.find((item) => item.id === sessionId && !item.deletedAt);
  if (!session) return; session.status = 'draft'; session.updatedAt = now();
  addOperation(database, 'update', 'workout_session', sessionId, { id: sessionId, status: 'draft' });
  await writeDatabase(database);
}

export async function discardWorkoutSession(sessionId: string) {
  const database = await readDatabase(); const timestamp = now(); const session = database.sessions.find((item) => item.id === sessionId && !item.deletedAt);
  if (!session) return;
  session.deletedAt = timestamp; session.updatedAt = timestamp;
  const exercises = database.workoutExercises.filter((item) => item.sessionId === sessionId && !item.deletedAt);
  exercises.forEach((exercise) => { exercise.deletedAt = timestamp; exercise.updatedAt = timestamp; addOperation(database, 'delete', 'workout_exercise', exercise.id, { id: exercise.id, deletedAt: timestamp }); });
  database.workoutSets.filter((item) => exercises.some((exercise) => exercise.id === item.workoutExerciseId) && !item.deletedAt).forEach((set) => { set.deletedAt = timestamp; set.updatedAt = timestamp; addOperation(database, 'delete', 'workout_set', set.id, { id: set.id, deletedAt: timestamp }); });
  addOperation(database, 'delete', 'workout_session', sessionId, { id: sessionId, deletedAt: timestamp });
  await writeDatabase(database);
}

export async function listHistory(): Promise<HistoryEntry[]> {
  const database = await readDatabase();
  return database.sessions.filter((session) => session.status === 'completed' && !session.deletedAt).sort((first, second) => (second.completedAt ?? '').localeCompare(first.completedAt ?? '')).map((session) => {
    const exerciseIds = database.workoutExercises.filter((item) => item.sessionId === session.id && !item.deletedAt).map((item) => item.id);
    const sets = database.workoutSets.filter((set) => exerciseIds.includes(set.workoutExerciseId) && set.confirmedAt && !set.deletedAt);
    return { id: session.id, routineName: session.routineNameSnapshot ?? 'Treino sem ficha', startedAt: session.startedAt, durationSeconds: session.durationSeconds, confirmedSets: sets.length, volumeKg: sets.reduce((volume, set) => volume + (set.weightKg ?? 0) * (set.repetitions ?? 0), 0) };
  });
}

export async function listPendingSyncOperations() {
  const database = await readDatabase();
  return [...database.syncOperations].sort((first, second) => first.createdAt.localeCompare(second.createdAt));
}
