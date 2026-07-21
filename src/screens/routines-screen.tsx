import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  colors,
  fontFamilies,
  ScreenHeading,
  spacing,
  Surface,
  typography,
} from '../design-system';
import { demoRoutines } from '../data/demo-data';

export function RoutinesScreen({ isWide }: { isWide: boolean }) {
  return (
    <View style={styles.screen}>
      <View style={[styles.pageIntro, isWide && styles.pageIntroWide]}>
        <View style={styles.pageIntroCopy}>
          <ScreenHeading kicker="3 DE 4 FICHAS UTILIZADAS">
            Seus treinos,{`\n`}prontos para repetir.
          </ScreenHeading>
        </View>
        <Button compact label="Nova ficha" style={styles.compactButton} />
      </View>

      <View style={styles.list}>
        {demoRoutines.map((routine, index) => (
          <Surface key={routine.name} style={[styles.routineCard, isWide && styles.routineCardWide]}>
            <Text style={styles.routineNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.routineMain}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineFocus}>{routine.focus}</Text>
            </View>
            <View style={styles.routineStat}>
              <Text style={styles.routineStatValue}>{String(routine.exercises).padStart(2, '0')}</Text>
              <Text style={styles.routineStatLabel}>EXERCÍCIOS</Text>
            </View>
            {isWide ? <Text style={styles.routineUpdated}>EDITADA {routine.updated.toUpperCase()}</Text> : null}
            <Button compact label="Abrir" variant="outline" />
          </Surface>
        ))}
      </View>
      <Text style={styles.disclaimer}>Conteúdo de demonstração baseado nas fichas previstas para o MVP.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { width: '100%' },
  pageIntro: { gap: spacing.lg, marginBottom: 38 },
  pageIntroWide: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageIntroCopy: { flex: 1 },
  compactButton: { minWidth: 150, alignSelf: 'flex-start' },
  list: { width: '100%' },
  routineCard: { gap: spacing.md, padding: 18, marginBottom: 10 },
  routineCardWide: { minHeight: 106, flexDirection: 'row', alignItems: 'center' },
  routineNumber: { ...typography.label, color: colors.accent },
  routineMain: { flex: 1 },
  routineName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 17, fontWeight: '700' },
  routineFocus: { ...typography.caption, color: colors.textMuted, marginTop: 5 },
  routineStat: { minWidth: 90 },
  routineStatValue: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 16, fontWeight: '700' },
  routineStatLabel: { ...typography.overline, color: colors.textMuted, fontSize: 8, letterSpacing: 0.7, marginTop: spacing.xxs },
  routineUpdated: { width: 130, color: colors.textMuted, fontFamily: fontFamilies.mono, fontSize: 8 },
  disclaimer: { ...typography.overline, color: colors.textMuted, fontSize: 8, lineHeight: 14, marginTop: spacing.md },
});

