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
import { demoHistory } from '../data/demo-data';

export function HistoryScreen({ isWide }: { isWide: boolean }) {
  return (
    <View style={styles.screen}>
      <ScreenHeading kicker="JULHO DE 2026">
        Consistência{`\n`}em números.
      </ScreenHeading>

      <Surface style={[styles.historySummary, isWide && styles.historySummaryWide]}>
        <Metric label="TREINOS" value="08" />
        <Metric label="TEMPO" value="7H 42" />
        <Metric label="VOLUME" value="61.830 KG" />
      </Surface>

      <SectionTitle title="Treinos concluídos" />
      <View style={styles.list}>
        {demoHistory.map((workout) => (
          <View key={workout.date} style={[styles.historyRow, isWide && styles.historyRowWide]}>
            <Text style={styles.historyDate}>{workout.date}</Text>
            <View style={styles.historyMain}>
              <Text style={styles.historyName}>{workout.routine}</Text>
              <Text style={styles.historyMeta}>{workout.duration} · {workout.sets}</Text>
            </View>
            <View style={styles.historyVolumeWrap}>
              <Text style={styles.historyVolume}>{workout.volume}</Text>
              <Text style={styles.historyVolumeLabel}>VOLUME</Text>
            </View>
            <Button compact label="Detalhes" variant="text" />
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>
        Dados de demonstração. Apenas séries confirmadas compõem volume e recordes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  historySummary: { paddingHorizontal: 20, marginBottom: spacing.xl },
  historySummaryWide: { flexDirection: 'row' },
  list: { width: '100%' },
  historyRow: { gap: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 18 },
  historyRowWide: { minHeight: 82, flexDirection: 'row', alignItems: 'center' },
  historyDate: { ...typography.caption, color: colors.accent, width: 58 },
  historyMain: { flex: 1 },
  historyName: { ...typography.body, color: colors.text, fontWeight: '700' },
  historyMeta: { ...typography.overline, color: colors.textMuted, marginTop: 5 },
  historyVolumeWrap: { minWidth: 120 },
  historyVolume: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 12, fontWeight: '700' },
  historyVolumeLabel: { ...typography.overline, color: colors.textMuted, fontSize: 8, marginTop: spacing.xxs },
  disclaimer: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: spacing.md },
});

