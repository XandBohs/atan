import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  colors,
  fontFamilies,
  Metric,
  SectionTitle,
  spacing,
  Surface,
  typography,
} from '../design-system';

export function ProfileScreen({ isWide, onLogout }: { isWide: boolean; onLogout: () => Promise<void> }) {
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await onLogout();
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.profileHeader, isWide && styles.profileHeaderWide]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>AD</Text></View>
        <View style={styles.profileIdentity}>
          <Text style={styles.kicker}>PERFIL DE DEMONSTRAÇÃO</Text>
          <Text style={styles.profileName}>Administrador</Text>
          <Text style={styles.profileEmail}>admin@admin</Text>
        </View>
        <Button
          compact
          label={showSettings ? 'Fechar configurações' : 'Configurações'}
          onPress={() => setShowSettings((value) => !value)}
          variant="outline"
        />
      </View>

      {showSettings ? (
        <Surface style={styles.settingsPanel}>
          <Text style={styles.cardIndex}>CONFIGURAÇÕES</Text>
          <SettingRow label="Unidade de peso" value="Quilogramas (kg)" />
          <SettingRow label="Privacidade do perfil" value="Privado" />
          <SettingRow label="Sincronização" value="Ativa" />
          <Text style={styles.settingsNote}>
            Estas preferências representam o comportamento planejado para o MVP.
          </Text>
        </Surface>
      ) : (
        <>
          <Surface style={[styles.profileStats, isWide && styles.profileStatsWide]}>
            <Metric label="TREINOS" value="32" />
            <Metric label="TEMPO TOTAL" value="29H 18" />
            <Metric label="DESDE" value="MAI 2026" />
          </Surface>

          <SectionTitle title="Conquistas" />
          <View style={[styles.achievementGrid, isWide && styles.achievementGridWide]}>
            <Achievement exercise="Supino reto" label="MAIOR CARGA" value="80 kg" />
            <Achievement exercise="Agachamento livre" label="MELHOR SÉRIE" value="720 kg" />
          </View>
          <Text style={styles.disclaimer}>
            Conquistas de demonstração calculadas conforme as regras do MVP.
          </Text>
        </>
      )}

      <Button
        label={isLoggingOut ? 'Saindo...' : 'Sair da conta'}
        loading={isLoggingOut}
        onPress={logout}
        style={styles.logoutButton}
        variant="danger"
      />
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function Achievement({ exercise, label, value }: { exercise: string; label: string; value: string }) {
  return (
    <Surface style={styles.achievementCard}>
      <Text style={styles.cardIndex}>{label}</Text>
      <Text style={styles.achievementValue}>{value}</Text>
      <Text style={styles.achievementExercise}>{exercise}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  profileHeader: { gap: 18, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 28, marginBottom: 28 },
  profileHeaderWide: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  avatarText: { color: colors.onAccent, fontFamily: fontFamilies.mono, fontSize: 24, fontWeight: '700' },
  profileIdentity: { flex: 1 },
  kicker: { ...typography.caption, color: colors.accent, letterSpacing: 1.2, marginBottom: spacing.sm },
  profileName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 25, fontWeight: '700', letterSpacing: -0.8 },
  profileEmail: { ...typography.label, color: colors.textMuted, marginTop: 6 },
  profileStats: { paddingHorizontal: 20, marginBottom: 30 },
  profileStatsWide: { flexDirection: 'row' },
  achievementGrid: { gap: spacing.sm, marginTop: 14 },
  achievementGridWide: { flexDirection: 'row' },
  achievementCard: { flex: 1, minHeight: 150, justifyContent: 'space-between', padding: 20 },
  cardIndex: { ...typography.overline, color: colors.accent },
  achievementValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 30, fontWeight: '700', letterSpacing: -1 },
  achievementExercise: { ...typography.caption, color: colors.textMuted },
  settingsPanel: { padding: 22, marginBottom: spacing.lg },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: { ...typography.label, flex: 1, color: colors.text },
  settingValue: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  settingsNote: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: 18 },
  disclaimer: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: spacing.md },
  logoutButton: { marginTop: 30 },
});

