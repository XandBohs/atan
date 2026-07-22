import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase/client';
import { Button, colors, fontFamilies, sizes, spacing, TextField, typography } from '../design-system';

export function LoginScreen({ isWide }: { isWide: boolean }) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    setError('');
    setMessage('');
    if (!normalizedEmail || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    if (mode === 'sign-up' && password.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError) setError(signInError.message);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: normalizedEmail, password });
        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          setMessage('Conta criada. Voce ja pode acessar o app.');
        } else {
          setMessage('Conta criada. A confirmacao de e-mail esta ativa neste projeto.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignUp = mode === 'sign-up';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.folioRow}>
            <Text style={styles.folio}>ATA</Text>
            <Text style={styles.folio}>FORCA EM REGISTRO</Text>
          </View>

          <View style={[styles.grid, isWide ? styles.gridWide : styles.gridNarrow]}>
            <View style={styles.brand}>
              <Image accessibilityLabel="Simbolo do Ata" resizeMode="contain" source={require('../../assets/branding/ata-logo-concept-v2.png')} style={[styles.logo, isWide ? styles.logoWide : styles.logoNarrow]} />
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>TREINO - HISTORICO - EVOLUCAO</Text>
                <Text style={[styles.title, isWide ? styles.titleWide : styles.titleNarrow]}>Retome sua{`\n`}forca.</Text>
                <Text style={styles.description}>Acesse suas fichas, continue seus treinos e acompanhe cada avanco.</Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelIndex}>{isSignUp ? 'CADASTRO / 01' : 'ACESSO / 01'}</Text>
              <Text style={styles.panelTitle}>{isSignUp ? 'Criar conta' : 'Entrar'}</Text>
              <Text style={styles.panelDescription}>
                {isSignUp ? 'Crie suas credenciais para salvar seus treinos.' : 'Use seu e-mail e senha para acessar seus dados.'}
              </Text>

              <TextField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="voce@exemplo.com" value={email} />
              <TextField autoComplete={isSignUp ? 'new-password' : 'current-password'} label="Senha" onChangeText={setPassword} onSubmitEditing={submit} placeholder={isSignUp ? 'Minimo de 6 caracteres' : 'Digite sua senha'} secureTextEntry value={password} />

              {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
              {message ? <Text accessibilityRole="alert" style={styles.successText}>{message}</Text> : null}

              <Button label={isSubmitting ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'} loading={isSubmitting} onPress={submit} />
              <Button
                label={isSignUp ? 'Ja tenho uma conta' : 'Criar uma conta'}
                onPress={() => { setMode(isSignUp ? 'sign-in' : 'sign-up'); setError(''); setMessage(''); }}
                style={styles.modeButton}
                variant="text"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, keyboard: { flex: 1 },
  page: { alignSelf: 'stretch', flexGrow: 1, maxWidth: sizes.loginMaxWidth, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  folioRow: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14 },
  folio: { ...typography.label, color: colors.textMuted, letterSpacing: 1.2 },
  grid: { alignItems: 'stretch', flex: 1, justifyContent: 'center' }, gridWide: { flexDirection: 'row', gap: 64, paddingVertical: spacing.section }, gridNarrow: { flexDirection: 'column', gap: spacing.xl, paddingVertical: spacing.xl },
  brand: { flex: 1, justifyContent: 'center', minWidth: 0 }, logo: { alignSelf: 'flex-start' }, logoWide: { height: 220, marginBottom: spacing.xs, width: 220 }, logoNarrow: { height: 116, marginBottom: spacing.sm, width: 116 },
  copy: { maxWidth: 610 }, eyebrow: { ...typography.body, color: colors.accent, fontSize: 12, letterSpacing: 1.4, marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: fontFamilies.mono, fontWeight: '700', letterSpacing: -2.4 }, titleWide: { fontSize: 64, lineHeight: 68 }, titleNarrow: { fontSize: 40, lineHeight: 44 }, description: { ...typography.bodyLarge, color: colors.textMuted, marginTop: 20, maxWidth: 520 },
  panel: { alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, flex: 1, justifyContent: 'center', maxWidth: 460, padding: 28, width: '100%' },
  panelIndex: { ...typography.label, color: colors.accent, letterSpacing: 1.2, marginBottom: 30 }, panelTitle: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 30, fontWeight: '700', letterSpacing: -1, marginBottom: spacing.xs }, panelDescription: { color: colors.textMuted, fontFamily: fontFamilies.mono, fontSize: 12, lineHeight: 19, marginBottom: 28 },
  errorText: { ...typography.label, color: colors.danger, lineHeight: 17, marginBottom: spacing.md }, successText: { ...typography.label, color: colors.accent, lineHeight: 17, marginBottom: spacing.md }, modeButton: { alignSelf: 'center', marginTop: spacing.md },
});
