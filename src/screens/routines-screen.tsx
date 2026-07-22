import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, colors, fontFamilies, ScreenHeading, spacing, Surface, TextField, typography } from '../design-system';
import type { CreateRoutineInput, Exercise, RoutineSummary } from '../data/offline-store';

type RoutinesScreenProps = {
  isWide: boolean;
  routines: RoutineSummary[];
  exercises: Exercise[];
  onCreateRoutine: (input: CreateRoutineInput) => Promise<void>;
};

export function RoutinesScreen({ isWide, routines, exercises, onCreateRoutine }: RoutinesScreenProps) {
  const [creating, setCreating] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={[styles.pageIntro, isWide && styles.pageIntroWide]}>
        <View style={styles.pageIntroCopy}>
          <ScreenHeading kicker={`${routines.length} DE 4 FICHAS UTILIZADAS`}>
            Seus treinos,{`\n`}prontos para repetir.
          </ScreenHeading>
        </View>
        <Button compact disabled={routines.length >= 4} label="Nova ficha" onPress={() => setCreating(true)} style={styles.compactButton} />
      </View>

      {creating ? (
        <RoutineForm exercises={exercises} onCancel={() => setCreating(false)} onSave={async (input) => {
          await onCreateRoutine(input);
          setCreating(false);
        }} />
      ) : null}

      {!routines.length && !creating ? (
        <Surface style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma ficha criada.</Text>
          <Text style={styles.emptyCopy}>Crie sua primeira ficha para iniciar um treino mesmo sem conexao.</Text>
        </Surface>
      ) : null}

      <View style={styles.list}>
        {routines.map((routine, index) => (
          <Surface key={routine.id} style={[styles.routineCard, isWide && styles.routineCardWide]}>
            <Text style={styles.routineNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.routineMain}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineFocus}>{routine.description || 'Ficha salva neste dispositivo'}</Text>
            </View>
            <View style={styles.routineStat}>
              <Text style={styles.routineStatValue}>{String(routine.exerciseCount).padStart(2, '0')}</Text>
              <Text style={styles.routineStatLabel}>EXERCICIOS</Text>
            </View>
            <View style={styles.routineStat}>
              <Text style={styles.routineStatValue}>{String(routine.setCount).padStart(2, '0')}</Text>
              <Text style={styles.routineStatLabel}>SERIES</Text>
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );
}

function RoutineForm({ exercises, onSave, onCancel }: {
  exercises: Exercise[];
  onSave: (input: CreateRoutineInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [weight, setWeight] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [rest, setRest] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const asNumber = (value: string) => {
    const parsed = Number(value.replace(',', '.'));
    return value.trim() && Number.isFinite(parsed) ? parsed : null;
  };

  async function save() {
    if (!name.trim() || !exerciseId) {
      setError('Informe o nome da ficha e escolha um exercicio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        name, exerciseId, targetWeightKg: asNumber(weight), targetRepetitions: asNumber(repetitions),
        restSeconds: asNumber(rest), targetDurationSeconds: asNumber(duration),
        targetDistanceMeters: asNumber(distance), notes,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar a ficha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Surface style={styles.form}>
      <Text style={styles.formIndex}>NOVA FICHA</Text>
      <Text style={styles.formTitle}>Primeiro exercicio</Text>
      <Text style={styles.formCopy}>A ficha e salva no dispositivo assim que voce confirmar os dados.</Text>
      <TextField label="Nome da ficha" onChangeText={setName} placeholder="Ex.: Treino A" value={name} />

      <Text style={styles.fieldLabel}>EXERCICIO</Text>
      <ScrollView contentContainerStyle={styles.exerciseOptions} horizontal showsHorizontalScrollIndicator={false}>
        {exercises.map((exercise) => (
          <Button
            compact
            key={exercise.id}
            label={exercise.name}
            onPress={() => setExerciseId(exercise.id)}
            style={exerciseId === exercise.id ? styles.selectedExercise : undefined}
            variant={exerciseId === exercise.id ? 'primary' : 'outline'}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>SERIE 01</Text>
      <View style={styles.fieldGrid}>
        <TextField keyboardType="decimal-pad" label="Carga (kg)" onChangeText={setWeight} placeholder="Opcional" value={weight} />
        <TextField keyboardType="number-pad" label="Repeticoes" onChangeText={setRepetitions} placeholder="Opcional" value={repetitions} />
        <TextField keyboardType="number-pad" label="Descanso (s)" onChangeText={setRest} placeholder="Opcional" value={rest} />
        <TextField keyboardType="number-pad" label="Tempo (s)" onChangeText={setDuration} placeholder="Opcional" value={duration} />
        <TextField keyboardType="decimal-pad" label="Distancia (m)" onChangeText={setDistance} placeholder="Opcional" value={distance} />
      </View>
      <TextField label="Observacoes" onChangeText={setNotes} placeholder="Opcional" value={notes} />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.formActions}>
        <Button compact label="Cancelar" onPress={onCancel} variant="outline" />
        <Button compact label={saving ? 'Salvando...' : 'Salvar ficha'} loading={saving} onPress={save} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  pageIntro: { gap: spacing.lg, marginBottom: 38 },
  pageIntroWide: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  pageIntroCopy: { flex: 1 },
  compactButton: { alignSelf: 'flex-start', minWidth: 150 },
  form: { marginBottom: spacing.xl, padding: 20 },
  formIndex: { ...typography.overline, color: colors.accent },
  formTitle: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 22, fontWeight: '700', marginTop: spacing.sm },
  formCopy: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.xs },
  fieldLabel: { ...typography.label, color: colors.text, letterSpacing: 0.8, marginBottom: spacing.sm },
  exerciseOptions: { gap: spacing.sm, paddingBottom: spacing.lg },
  selectedExercise: { borderColor: colors.accent },
  sectionLabel: { ...typography.overline, borderTopWidth: 1, borderTopColor: colors.border, color: colors.accent, marginBottom: spacing.md, paddingTop: spacing.md },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  formActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.sm },
  error: { ...typography.label, color: colors.danger, marginBottom: spacing.md },
  emptyState: { marginBottom: spacing.lg, padding: 22 },
  emptyTitle: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 18, fontWeight: '700' },
  emptyCopy: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  list: { width: '100%' },
  routineCard: { gap: spacing.md, marginBottom: 10, padding: 18 },
  routineCardWide: { alignItems: 'center', flexDirection: 'row', minHeight: 106 },
  routineNumber: { ...typography.label, color: colors.accent },
  routineMain: { flex: 1 },
  routineName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 17, fontWeight: '700' },
  routineFocus: { ...typography.caption, color: colors.textMuted, marginTop: 5 },
  routineStat: { minWidth: 90 },
  routineStatValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 16, fontWeight: '700' },
  routineStatLabel: { ...typography.overline, color: colors.textMuted, fontSize: 8, letterSpacing: 0.7, marginTop: spacing.xxs },
});
