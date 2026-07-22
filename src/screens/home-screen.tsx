import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, colors, fontFamilies, Metric, ScreenHeading, SectionTitle, spacing, Surface, typography } from '../design-system';
import type { RoutineSummary, WorkoutSession } from '../data/offline-store';
import type { AppTab } from '../navigation/tabs';

type HomeScreenProps = {
  isWide: boolean;
  onNavigate: (tab: AppTab) => void;
  routine: RoutineSummary | null;
  activeSession: WorkoutSession | null;
  onStartWorkout: () => Promise<void>;
  onResumeWorkout: () => void;
};

export function HomeScreen({ isWide, onNavigate, routine, activeSession, onStartWorkout, onResumeWorkout }: HomeScreenProps) {
  const [isStarting, setIsStarting] = useState(false);

  async function startWorkout() {
    setIsStarting(true);
    try {
      await onStartWorkout();
    } finally {
      setIsStarting(false);
    }
  }

  const hasRoutine = Boolean(routine);
  const title = activeSession ? activeSession.routineName ?? 'Treino em andamento' : routine?.name ?? 'Sua proxima ficha';
  const meta = activeSession
    ? `${activeSession.exercises.length} exercicios salvos localmente`
    : routine ? `${routine.exerciseCount} exercicios - ${routine.setCount} series planejadas` : 'Crie uma ficha para iniciar seu primeiro treino.';

  return (
    <View style={styles.screen}>
      <ScreenHeading kicker="TREINO OFFLINE">Boa noite,{`\n`}atleta.</ScreenHeading>
      <View style={[styles.homeGrid, isWide && styles.homeGridWide]}>
        <Surface style={styles.nextWorkoutCard}>
          <Text style={styles.cardIndex}>{activeSession ? 'RASCUNHO ATIVO' : 'PROXIMO TREINO'}</Text>
          <Text style={styles.workoutName}>{title}</Text>
          <Text style={styles.workoutMeta}>{meta}</Text>
          <View style={styles.exercisePreview}>
            <Metric label="EXERCICIOS" value={String(activeSession?.exercises.length ?? routine?.exerciseCount ?? 0).padStart(2, '0')} />
            <Metric label="SERIES" value={String(activeSession?.exercises.reduce((count, exercise) => count + exercise.sets.length, 0) ?? routine?.setCount ?? 0).padStart(2, '0')} />
            <Metric label="DADOS" value="LOCAL" />
          </View>
          {activeSession ? <Button label="Retomar treino" onPress={onResumeWorkout} /> : null}
          {!activeSession && hasRoutine ? <Button label={isStarting ? 'Iniciando...' : 'Iniciar treino'} loading={isStarting} onPress={startWorkout} /> : null}
          {!activeSession && !hasRoutine ? <Button label="Criar ficha" onPress={() => onNavigate('fichas')} /> : null}
        </Surface>
        <View style={styles.summaryColumn}>
          <Surface style={styles.summaryCard}>
            <Text style={styles.cardIndex}>PERSISTENCIA</Text>
            <Text style={styles.summaryValue}>OK</Text>
            <Text style={styles.summaryLabel}>SQLite neste dispositivo</Text>
          </Surface>
          <Surface style={styles.summaryCard}>
            <Text style={styles.cardIndex}>SINCRONIZACAO</Text>
            <Text style={styles.summaryValue}>LOCAL</Text>
            <Text style={styles.summaryLabel}>fila pronta para conexao</Text>
          </Surface>
        </View>
      </View>
      <SectionTitle action="Ver fichas" onPress={() => onNavigate('fichas')} title="Seu treino" />
      <Text style={styles.note}>As fichas e sessoes sao gravadas antes de qualquer sincronizacao com a internet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' }, homeGrid: { gap: spacing.md, marginBottom: 42 }, homeGridWide: { flexDirection: 'row' },
  nextWorkoutCard: { flex: 1.7, justifyContent: 'space-between', minHeight: 330, minWidth: 0, padding: spacing.lg },
  cardIndex: { ...typography.overline, color: colors.accent }, workoutName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 27, fontWeight: '700', letterSpacing: -1, marginTop: 34 },
  workoutMeta: { ...typography.label, color: colors.textMuted, marginTop: spacing.xs },
  exercisePreview: { borderBottomWidth: 1, borderColor: colors.border, borderTopWidth: 1, flexDirection: 'row', marginVertical: 28 },
  summaryColumn: { flex: 1, gap: spacing.md, minWidth: 0 }, summaryCard: { flex: 1, minHeight: 150, padding: 20 },
  summaryValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 25, fontWeight: '700', letterSpacing: -1, marginTop: 18 },
  summaryLabel: { ...typography.caption, color: colors.textMuted, marginTop: 3 }, note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
});
