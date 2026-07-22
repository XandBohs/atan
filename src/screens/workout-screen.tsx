import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, colors, fontFamilies, ScreenHeading, spacing, Surface, TextField, typography } from '../design-system';
import type { UpdateWorkoutSetInput, WorkoutSession, WorkoutSet } from '../data/offline-store';

type WorkoutScreenProps = {
  session: WorkoutSession;
  isWide: boolean;
  onSaveSet: (setId: string, input: UpdateWorkoutSetInput) => Promise<void>;
  onComplete: () => Promise<void>;
  onClose: () => Promise<void>;
};

export function WorkoutScreen({ session, isWide, onSaveSet, onComplete, onClose }: WorkoutScreenProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');

  async function complete() {
    setError('');
    setIsCompleting(true);
    try {
      await onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel concluir o treino.');
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, isWide && styles.topBarWide]}>
        <View>
          <Text style={styles.sessionLabel}>SESSAO ATIVA</Text>
          <Text style={styles.sessionName}>{session.routineName ?? 'Treino livre'}</Text>
        </View>
        <Button compact label="Salvar rascunho" onPress={onClose} variant="outline" />
      </View>

      <ScreenHeading kicker="REGISTRO LOCAL">Confirme cada{`\n`}serie realizada.</ScreenHeading>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {session.exercises.map((exercise, index) => (
          <Surface key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            <Text style={styles.exerciseMuscle}>{exercise.mainMuscle ?? 'Exercicio'}</Text>
            {exercise.sets.map((set) => (
              <WorkoutSetEditor key={set.id} set={set} onSave={onSaveSet} />
            ))}
          </Surface>
        ))}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Button label={isCompleting ? 'Concluindo...' : 'Concluir treino'} loading={isCompleting} onPress={complete} />
      </ScrollView>
    </View>
  );
}

function WorkoutSetEditor({ set, onSave }: { set: WorkoutSet; onSave: WorkoutScreenProps['onSaveSet'] }) {
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? '');
  const [repetitions, setRepetitions] = useState(set.repetitions?.toString() ?? '');
  const [rest, setRest] = useState(set.restSeconds?.toString() ?? '');
  const [duration, setDuration] = useState(set.durationSeconds?.toString() ?? '');
  const [distance, setDistance] = useState(set.distanceMeters?.toString() ?? '');
  const [notes, setNotes] = useState(set.notes ?? '');
  const [saving, setSaving] = useState(false);

  const toNumber = (value: string) => {
    const parsed = Number(value.replace(',', '.'));
    return value.trim() && Number.isFinite(parsed) ? parsed : null;
  };

  async function save() {
    setSaving(true);
    try {
      await onSave(set.id, {
        weightKg: toNumber(weight),
        repetitions: toNumber(repetitions),
        restSeconds: toNumber(rest),
        durationSeconds: toNumber(duration),
        distanceMeters: toNumber(distance),
        notes,
        confirmed: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.setEditor}>
      <View style={styles.setHeader}>
        <Text style={styles.setTitle}>SERIE {String(set.setNumber).padStart(2, '0')}</Text>
        <Text style={[styles.setStatus, set.confirmedAt && styles.setStatusConfirmed]}>
          {set.confirmedAt ? 'CONFIRMADA' : 'PENDENTE'}
        </Text>
      </View>
      <View style={styles.fieldGrid}>
        <TextField keyboardType="decimal-pad" label="Carga (kg)" onChangeText={setWeight} placeholder="0" value={weight} />
        <TextField keyboardType="number-pad" label="Repeticoes" onChangeText={setRepetitions} placeholder="0" value={repetitions} />
        <TextField keyboardType="number-pad" label="Descanso (s)" onChangeText={setRest} placeholder="0" value={rest} />
        <TextField keyboardType="number-pad" label="Tempo (s)" onChangeText={setDuration} placeholder="0" value={duration} />
        <TextField keyboardType="decimal-pad" label="Distancia (m)" onChangeText={setDistance} placeholder="0" value={distance} />
      </View>
      <TextField label="Observacoes" onChangeText={setNotes} placeholder="Opcional" value={notes} />
      <Button
        compact
        label={saving ? 'Salvando...' : set.confirmedAt ? 'Atualizar serie' : 'Confirmar serie'}
        loading={saving}
        onPress={save}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  topBar: { gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.xl, paddingBottom: spacing.md },
  topBarWide: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sessionLabel: { ...typography.overline, color: colors.accent },
  sessionName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 17, fontWeight: '700', marginTop: 5 },
  content: { gap: spacing.md, paddingBottom: spacing.section },
  exerciseCard: { padding: 20 },
  exerciseNumber: { ...typography.overline, color: colors.accent },
  exerciseName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 20, fontWeight: '700', marginTop: spacing.sm },
  exerciseMuscle: { ...typography.caption, color: colors.textMuted, marginTop: 5 },
  setEditor: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.lg, paddingTop: spacing.md },
  setHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  setTitle: { ...typography.label, color: colors.text },
  setStatus: { ...typography.overline, color: colors.textMuted },
  setStatusConfirmed: { color: colors.accent },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { ...typography.label, color: colors.danger },
});
