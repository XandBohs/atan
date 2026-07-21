import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  colors,
  fontFamilies,
  Metric,
  ScreenHeading,
  SectionTitle,
  spacing,
  Surface,
  typography,
} from '../design-system';
import type { AppTab } from '../navigation/tabs';

export function HomeScreen({ isWide, onNavigate }: { isWide: boolean; onNavigate: (tab: AppTab) => void }) {
  return (
    <View style={styles.screen}>
      <ScreenHeading kicker="TERÇA-FEIRA, 21 DE JULHO">
        Boa noite,{`\n`}atleta.
      </ScreenHeading>

      <View style={[styles.homeGrid, isWide && styles.homeGridWide]}>
        <Surface style={styles.nextWorkoutCard}>
          <Text style={styles.cardIndex}>PRÓXIMO TREINO / A</Text>
          <Text style={styles.workoutName}>Peito e tríceps</Text>
          <Text style={styles.workoutMeta}>6 exercícios · estimativa de 55 min</Text>
          <View style={styles.exercisePreview}>
            <Metric label="EXERCÍCIOS" value="06" />
            <Metric label="SÉRIES" value="18" />
            <Metric label="ÚLTIMO" value="18 JUL" />
          </View>
          <Button label="Iniciar treino" />
        </Surface>

        <View style={styles.summaryColumn}>
          <Surface style={styles.summaryCard}>
            <Text style={styles.cardIndex}>ESTA SEMANA</Text>
            <Text style={styles.summaryValue}>02</Text>
            <Text style={styles.summaryLabel}>treinos concluídos</Text>
            <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            <Text style={styles.summaryFootnote}>Meta de demonstração: 4 treinos</Text>
          </Surface>
          <Surface style={styles.summaryCard}>
            <Text style={styles.cardIndex}>VOLUME TOTAL</Text>
            <Text style={styles.summaryValue}>16.260</Text>
            <Text style={styles.summaryLabel}>kg movimentados</Text>
          </Surface>
        </View>
      </View>

      <SectionTitle action="Ver histórico" onPress={() => onNavigate('historico')} title="Atividade recente" />
      <View style={styles.activityRow}>
        <Text style={styles.activityDate}>18 JUL</Text>
        <View style={styles.activityMain}>
          <Text style={styles.activityTitle}>Treino A</Text>
          <Text style={styles.activityMeta}>52 min · 18 séries confirmadas</Text>
        </View>
        <Text style={styles.activityVolume}>6.840 kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  homeGrid: { gap: spacing.md, marginBottom: 42 },
  homeGridWide: { flexDirection: 'row' },
  nextWorkoutCard: { flex: 1.7, minWidth: 0, minHeight: 330, padding: spacing.lg, justifyContent: 'space-between' },
  cardIndex: { ...typography.overline, color: colors.accent },
  workoutName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 27, fontWeight: '700', letterSpacing: -1, marginTop: 34 },
  workoutMeta: { ...typography.label, color: colors.textMuted, marginTop: spacing.xs },
  exercisePreview: {
    flexDirection: 'row',
    marginVertical: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  summaryColumn: { flex: 1, minWidth: 0, gap: spacing.md },
  summaryCard: { flex: 1, minHeight: 150, padding: 20 },
  summaryValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 32, fontWeight: '700', letterSpacing: -1, marginTop: 18 },
  summaryLabel: { ...typography.caption, color: colors.textMuted, marginTop: 3 },
  progressTrack: { height: 4, backgroundColor: colors.border, marginTop: 18 },
  progressFill: { height: 4, width: '50%', backgroundColor: colors.accent },
  summaryFootnote: { ...typography.overline, color: colors.textMuted, fontSize: 8, marginTop: 9 },
  activityRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityDate: { ...typography.caption, color: colors.accent },
  activityMain: { flex: 1 },
  activityTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  activityMeta: { ...typography.overline, color: colors.textMuted, marginTop: 5 },
  activityVolume: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 12, fontWeight: '700' },
});

