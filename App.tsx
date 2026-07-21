import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const colors = {
  background: '#0B0C0A',
  surface: '#121310',
  line: '#30312D',
  text: '#F5F2EA',
  muted: '#9A9B94',
  urucum: '#E34213',
  onUrucum: '#0B0C0A',
};

const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.folioRow}>
          <Text style={styles.folio}>ATÃ</Text>
          <Text style={styles.folio}>FORÇA EM REGISTRO</Text>
        </View>

        <View style={[styles.hero, isWide ? styles.heroWide : styles.heroNarrow]}>
          <Image
            accessibilityLabel="Símbolo do Atã"
            resizeMode="contain"
            source={require('./assets/branding/ata-logo-concept-v2.png')}
            style={[styles.logo, isWide ? styles.logoWide : styles.logoNarrow]}
          />

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>TREINO · HISTÓRICO · EVOLUÇÃO</Text>
            <Text style={[styles.title, isWide ? styles.titleWide : styles.titleNarrow]}>
              Sua força,{`\n`}série por série.
            </Text>
            <Text style={styles.description}>
              Monte suas fichas, registre apenas o que realizou e acompanhe o
              volume de cada treino em qualquer dispositivo.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Criar conta</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Entrar</Text>
          </Pressable>
        </View>

        <View
          style={[styles.proofRow, isWide ? styles.proofRowWide : styles.proofRowNarrow]}
        >
          <View style={styles.proofItem}>
            <Text style={styles.proofNumber}>01</Text>
            <Text style={styles.proofText}>Uma conta para celular e web</Text>
          </View>
          <View style={styles.proofItem}>
            <Text style={styles.proofNumber}>02</Text>
            <Text style={styles.proofText}>Registro disponível mesmo offline</Text>
          </View>
          <View style={styles.proofItem}>
            <Text style={styles.proofNumber}>03</Text>
            <Text style={styles.proofText}>Recordes calculados por exercício</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  folioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  folio: {
    color: colors.muted,
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWide: {
    flexDirection: 'row',
    gap: 72,
    paddingVertical: 72,
  },
  heroNarrow: {
    flexDirection: 'column',
    gap: 24,
    paddingVertical: 40,
  },
  logo: {
  },
  logoWide: {
    width: 360,
    height: 360,
  },
  logoNarrow: {
    width: 230,
    height: 230,
  },
  copy: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 570,
  },
  eyebrow: {
    color: colors.urucum,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1.4,
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontFamily: mono,
    fontWeight: '700',
    letterSpacing: -2.4,
  },
  titleWide: {
    fontSize: 64,
    lineHeight: 68,
  },
  titleNarrow: {
    fontSize: 40,
    lineHeight: 44,
  },
  description: {
    color: colors.muted,
    fontFamily: mono,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 520,
    marginTop: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.urucum,
    borderWidth: 1,
    borderColor: colors.urucum,
  },
  primaryButtonText: {
    color: colors.onUrucum,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryButtonText: {
    color: colors.text,
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  proofRow: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.line,
  },
  proofRowWide: {
    flexDirection: 'row',
  },
  proofRowNarrow: {
    flexDirection: 'column',
  },
  proofItem: {
    flex: 1,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  proofNumber: {
    color: colors.urucum,
    fontFamily: mono,
    fontSize: 12,
  },
  proofText: {
    flex: 1,
    color: colors.text,
    fontFamily: mono,
    fontSize: 12,
    lineHeight: 18,
  },
});
