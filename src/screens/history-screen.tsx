import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, Metric, ScreenHeading, SectionTitle, spacing, Surface, typography } from '../design-system';
import type { HistoryEntry } from '../data/offline-store';

export function HistoryScreen({ isWide, sessions }: { isWide: boolean; sessions: HistoryEntry[] }) {
  const totalVolume = sessions.reduce((total, session) => total + session.volumeKg, 0);
  const totalSeconds = sessions.reduce((total, session) => total + (session.durationSeconds ?? 0), 0);

  return (
    <View style={styles.screen}>
      <ScreenHeading kicker="HISTORICO LOCAL">Consistencia{`\n`}em numeros.</ScreenHeading>

      <Surface style={[styles.historySummary, isWide && styles.historySummaryWide]}>
        <Metric label="TREINOS" value={String(sessions.length).padStart(2, '0')} />
        <Metric label="TEMPO" value={formatDuration(totalSeconds)} />
        <Metric label="VOLUME" value={`${formatVolume(totalVolume)} KG`} />
      </Surface>

      <SectionTitle title="Treinos concluidos" />
      {!sessions.length ? <Text style={styles.empty}>Conclua uma sessao para registrar seu primeiro treino.</Text> : null}
      <View style={styles.list}>
        {sessions.map((session) => (
          <View key={session.id} style={[styles.historyRow, isWide && styles.historyRowWide]}>
            <Text style={styles.historyDate}>{formatDate(session.startedAt)}</Text>
            <View style={styles.historyMain}>
              <Text style={styles.historyName}>{session.routineName}</Text>
              <Text style={styles.historyMeta}>{formatDuration(session.durationSeconds ?? 0)} - {session.confirmedSets} series confirmadas</Text>
            </View>
            <View style={styles.historyVolumeWrap}>
              <Text style={styles.historyVolume}>{formatVolume(session.volumeKg)} KG</Text>
              <Text style={styles.historyVolumeLabel}>VOLUME</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}H ${String(minutes).padStart(2, '0')}` : `${minutes} MIN`;
}

function formatVolume(volume: number) {
  return Math.round(volume).toLocaleString('pt-BR');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value)).replace('.', '').toUpperCase();
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  historySummary: { marginBottom: spacing.xl, paddingHorizontal: 20 },
  historySummaryWide: { flexDirection: 'row' },
  list: { width: '100%' },
  empty: { ...typography.caption, color: colors.textMuted, marginTop: spacing.md },
  historyRow: { borderBottomColor: colors.border, borderBottomWidth: 1, gap: 14, paddingVertical: 18 },
  historyRowWide: { alignItems: 'center', flexDirection: 'row', minHeight: 82 },
  historyDate: { ...typography.caption, color: colors.accent, width: 58 },
  historyMain: { flex: 1 },
  historyName: { ...typography.body, color: colors.text, fontWeight: '700' },
  historyMeta: { ...typography.overline, color: colors.textMuted, marginTop: 5 },
  historyVolumeWrap: { minWidth: 120 },
  historyVolume: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 12, fontWeight: '700' },
  historyVolumeLabel: { ...typography.overline, color: colors.textMuted, fontSize: 8, marginTop: spacing.xxs },
});
