import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, fontFamilies, sizes, spacing, TextField, typography } from '../design-system';

const DEMO_EMAIL = 'admin@admin';
const DEMO_PASSWORD = 'admin123';

export function LoginScreen({ isWide, onLogin }: { isWide: boolean; onLogin: () => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError('');
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.folioRow}>
            <Text style={styles.folio}>ATÃ</Text>
            <Text style={styles.folio}>FORÇA EM REGISTRO</Text>
          </View>

          <View style={[styles.grid, isWide ? styles.gridWide : styles.gridNarrow]}>
            <View style={styles.brand}>
              <Image
                accessibilityLabel="Símbolo do Atã"
                resizeMode="contain"
                source={require('../../assets/branding/ata-logo-concept-v2.png')}
                style={[styles.logo, isWide ? styles.logoWide : styles.logoNarrow]}
              />
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>TREINO · HISTÓRICO · EVOLUÇÃO</Text>
                <Text style={[styles.title, isWide ? styles.titleWide : styles.titleNarrow]}>
                  Retome sua{`\n`}força.
                </Text>
                <Text style={styles.description}>
                  Acesse suas fichas, continue seus treinos e acompanhe cada avanço.
                </Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelIndex}>ACESSO / 01</Text>
              <Text style={styles.panelTitle}>Entrar</Text>
              <Text style={styles.panelDescription}>
                Use as credenciais de demonstração para navegar no aplicativo.
              </Text>

              <TextField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="E-mail"
                onChangeText={setEmail}
                placeholder="admin@admin"
                value={email}
              />
              <TextField
                label="Senha"
                onChangeText={setPassword}
                onSubmitEditing={submit}
                placeholder="Digite sua senha"
                secureTextEntry
                value={password}
              />

              {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

              <Button
                label={isSubmitting ? 'Entrando...' : 'Entrar'}
                loading={isSubmitting}
                onPress={submit}
              />

              <View style={styles.demoCredentials}>
                <Text style={styles.demoLabel}>ACESSO DE DEMONSTRAÇÃO</Text>
                <Text style={styles.demoValue}>admin@admin</Text>
                <Text style={styles.demoValue}>admin123</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  page: {
    flexGrow: 1,
    maxWidth: sizes.loginMaxWidth,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  folioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  folio: { ...typography.label, color: colors.textMuted, letterSpacing: 1.2 },
  grid: { flex: 1, alignItems: 'stretch', justifyContent: 'center' },
  gridWide: { flexDirection: 'row', gap: 64, paddingVertical: spacing.section },
  gridNarrow: { flexDirection: 'column', gap: spacing.xl, paddingVertical: spacing.xl },
  brand: { flex: 1, minWidth: 0, justifyContent: 'center' },
  logo: { alignSelf: 'flex-start' },
  logoWide: { width: 220, height: 220, marginBottom: spacing.xs },
  logoNarrow: { width: 116, height: 116, marginBottom: spacing.sm },
  copy: { maxWidth: 610 },
  eyebrow: { ...typography.body, color: colors.accent, fontSize: 12, letterSpacing: 1.4, marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: fontFamilies.mono, fontWeight: '700', letterSpacing: -2.4 },
  titleWide: { fontSize: 64, lineHeight: 68 },
  titleNarrow: { fontSize: 40, lineHeight: 44 },
  description: { ...typography.bodyLarge, color: colors.textMuted, maxWidth: 520, marginTop: 20 },
  panel: {
    flex: 1,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
  },
  panelIndex: { ...typography.label, color: colors.accent, letterSpacing: 1.2, marginBottom: 30 },
  panelTitle: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 30, fontWeight: '700', letterSpacing: -1, marginBottom: spacing.xs },
  panelDescription: { color: colors.textMuted, fontFamily: fontFamilies.mono, fontSize: 12, lineHeight: 19, marginBottom: 28 },
  errorText: { ...typography.label, color: colors.danger, lineHeight: 17, marginBottom: spacing.md },
  demoCredentials: { marginTop: spacing.lg, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border },
  demoLabel: { ...typography.overline, color: colors.textMuted, letterSpacing: 1.1, marginBottom: spacing.xs },
  demoValue: { ...typography.label, color: colors.text, lineHeight: 18 },
});

