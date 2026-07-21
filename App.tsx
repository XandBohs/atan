import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

const colors = {
  background: '#0B0C0A',
  surface: '#121310',
  surfaceRaised: '#191A16',
  line: '#30312D',
  text: '#F5F2EA',
  muted: '#9A9B94',
  urucum: '#E34213',
  onUrucum: '#0B0C0A',
  danger: '#FF3B30',
};

const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

const SESSION_KEY = '@ata:demo-session';
const DEMO_EMAIL = 'admin@admin';
const DEMO_PASSWORD = 'admin123';

type Tab = 'inicio' | 'fichas' | 'historico' | 'perfil';
type IconName = ComponentProps<typeof Ionicons>['name'];

const tabs: { id: Tab; label: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'inicio', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { id: 'fichas', label: 'Fichas', icon: 'clipboard-outline', activeIcon: 'clipboard' },
  { id: 'historico', label: 'Histórico', icon: 'time-outline', activeIcon: 'time' },
  { id: 'perfil', label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
];

const demoRoutines = [
  { name: 'Treino A', focus: 'Peito e tríceps', exercises: 6, updated: 'Hoje' },
  { name: 'Treino B', focus: 'Costas e bíceps', exercises: 7, updated: 'Ontem' },
  { name: 'Treino C', focus: 'Pernas', exercises: 8, updated: 'Há 3 dias' },
];

const demoHistory = [
  { date: '18 JUL', routine: 'Treino A', duration: '52 min', volume: '6.840 kg', sets: '18 séries' },
  { date: '16 JUL', routine: 'Treino C', duration: '1h 08', volume: '9.420 kg', sets: '24 séries' },
  { date: '14 JUL', routine: 'Treino B', duration: '58 min', volume: '7.210 kg', sets: '21 séries' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [reduceMotion, setReduceMotion] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;
  const sectionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((value) => setIsAuthenticated(value === 'authenticated'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  function navigateTo(tab: Tab) {
    if (tab === activeTab) return;

    if (isWide || reduceMotion) {
      slideX.stopAnimation();
      sectionOpacity.stopAnimation();
      slideX.setValue(0);
      sectionOpacity.setValue(1);
      setActiveTab(tab);
      return;
    }

    const currentIndex = tabs.findIndex((item) => item.id === activeTab);
    const nextIndex = tabs.findIndex((item) => item.id === tab);
    const direction = nextIndex > currentIndex ? 1 : -1;

    slideX.stopAnimation();
    sectionOpacity.stopAnimation();
    slideX.setValue(direction * Math.min(width * 0.09, 36));
    sectionOpacity.setValue(0.82);
    setActiveTab(tab);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          stiffness: 320,
          damping: 30,
          mass: 0.8,
          overshootClamping: true,
          restDisplacementThreshold: 0.2,
          restSpeedThreshold: 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(sectionOpacity, {
          toValue: 1,
          duration: 170,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  function returnSectionToRest() {
    if (reduceMotion) {
      slideX.setValue(0);
      sectionOpacity.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.spring(slideX, {
        toValue: 0,
        stiffness: 360,
        damping: 32,
        mass: 0.75,
        overshootClamping: true,
        useNativeDriver: true,
      }),
      Animated.timing(sectionOpacity, {
        toValue: 1,
        duration: 140,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }

  const sectionPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !isWide &&
      gesture.numberActiveTouches === 1 &&
      Math.abs(gesture.dx) > 10 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      !isWide &&
      gesture.numberActiveTouches === 1 &&
      Math.abs(gesture.dx) > 10 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onPanResponderGrant: () => {
      slideX.stopAnimation();
      sectionOpacity.stopAnimation();
    },
    onPanResponderMove: (_, gesture) => {
      if (gesture.numberActiveTouches !== 1 || reduceMotion) return;

      const currentIndex = tabs.findIndex((item) => item.id === activeTab);
      const isPastFirst = currentIndex === 0 && gesture.dx > 0;
      const isPastLast = currentIndex === tabs.length - 1 && gesture.dx < 0;
      const resistance = isPastFirst || isPastLast ? 0.22 : 1;
      const maxTravel = width * 0.34;
      const travel = Math.max(-maxTravel, Math.min(maxTravel, gesture.dx * resistance));

      slideX.setValue(travel);
      sectionOpacity.setValue(1 - Math.min(Math.abs(travel) / maxTravel, 1) * 0.14);
    },
    onPanResponderRelease: (_, gesture) => {
      const currentIndex = tabs.findIndex((item) => item.id === activeTab);
      const threshold = Math.min(width * 0.18, 72);
      const isFastSwipe = Math.abs(gesture.vx) > 0.45;
      const shouldNavigate = Math.abs(gesture.dx) > threshold || isFastSwipe;
      const directionValue = isFastSwipe ? gesture.vx : gesture.dx;
      const targetIndex = currentIndex + (directionValue < 0 ? 1 : -1);

      if (shouldNavigate && targetIndex >= 0 && targetIndex < tabs.length) {
        navigateTo(tabs[targetIndex].id);
        return;
      }

      returnSectionToRest();
    },
    onPanResponderTerminate: returnSectionToRest,
    onPanResponderTerminationRequest: () => false,
  });

  async function handleLogin() {
    await AsyncStorage.setItem(SESSION_KEY, 'authenticated');
    setIsAuthenticated(true);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setActiveTab('inicio');
    setIsAuthenticated(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.urucum} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen isWide={isWide} onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={[styles.appShell, isWide && styles.appShellWide]}>
        {isWide && (
          <SideNavigation activeTab={activeTab} onChange={navigateTo} />
        )}

        <Animated.View
          {...(!isWide ? sectionPanResponder.panHandlers : {})}
          style={[
            styles.mainArea,
            !isWide && {
              opacity: sectionOpacity,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <AppHeader activeTab={activeTab} />
          <ScrollView contentContainerStyle={styles.content}>
            {activeTab === 'inicio' && <HomeScreen isWide={isWide} onNavigate={setActiveTab} />}
            {activeTab === 'fichas' && <RoutinesScreen isWide={isWide} />}
            {activeTab === 'historico' && <HistoryScreen isWide={isWide} />}
            {activeTab === 'perfil' && <ProfileScreen isWide={isWide} onLogout={handleLogout} />}
          </ScrollView>
        </Animated.View>

        {!isWide && (
          <BottomNavigation activeTab={activeTab} onChange={navigateTo} />
        )}
      </View>
    </SafeAreaView>
  );
}

function LoginScreen({ isWide, onLogin }: { isWide: boolean; onLogin: () => Promise<void> }) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.loginKeyboard}
      >
        <ScrollView contentContainerStyle={styles.loginPage} keyboardShouldPersistTaps="handled">
          <View style={styles.folioRow}>
            <Text style={styles.folio}>ATÃ</Text>
            <Text style={styles.folio}>FORÇA EM REGISTRO</Text>
          </View>

          <View style={[styles.loginGrid, isWide ? styles.loginGridWide : styles.loginGridNarrow]}>
            <View style={styles.loginBrand}>
              <Image
                accessibilityLabel="Símbolo do Atã"
                resizeMode="contain"
                source={require('./assets/branding/ata-logo-concept-v2.png')}
                style={[styles.loginLogo, isWide ? styles.loginLogoWide : styles.loginLogoNarrow]}
              />
              <View style={styles.loginCopy}>
                <Text style={styles.eyebrow}>TREINO · HISTÓRICO · EVOLUÇÃO</Text>
                <Text style={[styles.loginTitle, isWide ? styles.loginTitleWide : styles.loginTitleNarrow]}>
                  Retome sua{`\n`}força.
                </Text>
                <Text style={styles.description}>
                  Acesse suas fichas, continue seus treinos e acompanhe cada avanço.
                </Text>
              </View>
            </View>

            <View style={styles.loginPanel}>
              <Text style={styles.panelIndex}>ACESSO / 01</Text>
              <Text style={styles.panelTitle}>Entrar</Text>
              <Text style={styles.panelDescription}>Use as credenciais de demonstração para navegar no aplicativo.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <TextInput
                  accessibilityLabel="E-mail"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="admin@admin"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={email}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Senha</Text>
                <TextInput
                  accessibilityLabel="Senha"
                  onChangeText={setPassword}
                  onSubmitEditing={submit}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>

              {error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={submit}
                style={({ pressed }) => [styles.primaryButton, (pressed || isSubmitting) && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
              </Pressable>

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

function SideNavigation({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <View style={styles.sideNav}>
      <View style={styles.sideBrand}>
        <Image source={require('./assets/branding/ata-logo-concept-v2.png')} style={styles.sideLogo} />
        <Text style={styles.sideBrandName}>ATÃ</Text>
      </View>
      <View style={styles.sideNavItems}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={({ pressed }) => [styles.sideNavItem, active && styles.sideNavItemActive, pressed && styles.pressed]}
            >
              <Ionicons
                accessible={false}
                color={active ? colors.urucum : colors.muted}
                name={active ? tab.activeIcon : tab.icon}
                size={19}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.sideVersion}>MVP / 0.1</Text>
    </View>
  );
}

function BottomNavigation({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.bottomNavItem, active && styles.bottomNavItemActive, pressed && styles.pressed]}
          >
            <Ionicons
              accessible={false}
              color={active ? colors.urucum : colors.muted}
              name={active ? tab.activeIcon : tab.icon}
              size={21}
            />
            <Text numberOfLines={1} style={[styles.bottomNavLabel, active && styles.navLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AppHeader({ activeTab }: { activeTab: Tab }) {
  const current = tabs.find((tab) => tab.id === activeTab)!;
  return (
    <View style={styles.appHeader}>
      <View style={styles.headerIdentity}>
        <Image
          accessibilityLabel="Logo do Atã"
          resizeMode="contain"
          source={require('./assets/branding/ata-logo-concept-v2.png')}
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>{current.label}</Text>
      </View>
      <View style={styles.demoPill}>
        <View style={styles.demoDot} />
        <Text style={styles.demoPillText}>DEMONSTRAÇÃO</Text>
      </View>
    </View>
  );
}

function HomeScreen({ isWide, onNavigate }: { isWide: boolean; onNavigate: (tab: Tab) => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeading}>
        <Text style={styles.kicker}>TERÇA-FEIRA, 21 DE JULHO</Text>
        <Text style={styles.displayTitle}>Boa noite,{`\n`}atleta.</Text>
      </View>

      <View style={[styles.homeGrid, isWide && styles.homeGridWide]}>
        <View style={styles.nextWorkoutCard}>
          <Text style={styles.cardIndex}>PRÓXIMO TREINO / A</Text>
          <Text style={styles.workoutName}>Peito e tríceps</Text>
          <Text style={styles.workoutMeta}>6 exercícios · estimativa de 55 min</Text>
          <View style={styles.exercisePreview}>
            <Metric label="EXERCÍCIOS" value="06" />
            <Metric label="SÉRIES" value="18" />
            <Metric label="ÚLTIMO" value="18 JUL" />
          </View>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Iniciar treino</Text>
          </Pressable>
        </View>

        <View style={styles.summaryColumn}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardIndex}>ESTA SEMANA</Text>
            <Text style={styles.summaryValue}>02</Text>
            <Text style={styles.summaryLabel}>treinos concluídos</Text>
            <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            <Text style={styles.summaryFootnote}>Meta de demonstração: 4 treinos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardIndex}>VOLUME TOTAL</Text>
            <Text style={styles.summaryValue}>16.260</Text>
            <Text style={styles.summaryLabel}>kg movimentados</Text>
          </View>
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

function RoutinesScreen({ isWide }: { isWide: boolean }) {
  return (
    <View style={styles.screen}>
      <View style={[styles.pageIntro, isWide && styles.pageIntroWide]}>
        <View style={styles.pageIntroCopy}>
          <Text style={styles.kicker}>3 DE 4 FICHAS UTILIZADAS</Text>
          <Text style={styles.displayTitle}>Seus treinos,{`\n`}prontos para repetir.</Text>
        </View>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, styles.compactButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Nova ficha</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {demoRoutines.map((routine, index) => (
          <View key={routine.name} style={[styles.routineCard, isWide && styles.routineCardWide]}>
            <Text style={styles.routineNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.routineMain}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineFocus}>{routine.focus}</Text>
            </View>
            <View style={styles.routineStat}>
              <Text style={styles.routineStatValue}>{String(routine.exercises).padStart(2, '0')}</Text>
              <Text style={styles.routineStatLabel}>EXERCÍCIOS</Text>
            </View>
            {isWide && <Text style={styles.routineUpdated}>EDITADA {routine.updated.toUpperCase()}</Text>}
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
              <Text style={styles.outlineButtonText}>Abrir</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>Conteúdo de demonstração baseado nas fichas previstas para o MVP.</Text>
    </View>
  );
}

function HistoryScreen({ isWide }: { isWide: boolean }) {
  return (
    <View style={styles.screen}>
      <View style={styles.sectionHeading}>
        <Text style={styles.kicker}>JULHO DE 2026</Text>
        <Text style={styles.displayTitle}>Consistência{`\n`}em números.</Text>
      </View>

      <View style={[styles.historySummary, isWide && styles.historySummaryWide]}>
        <Metric label="TREINOS" value="08" />
        <Metric label="TEMPO" value="7H 42" />
        <Metric label="VOLUME" value="61.830 KG" />
      </View>

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
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
              <Text style={styles.textButtonLabel}>Detalhes</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>Dados de demonstração. Apenas séries confirmadas compõem volume e recordes.</Text>
    </View>
  );
}

function ProfileScreen({ isWide, onLogout }: { isWide: boolean; onLogout: () => Promise<void> }) {
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
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowSettings((value) => !value)}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        >
          <Text style={styles.outlineButtonText}>{showSettings ? 'Fechar configurações' : 'Configurações'}</Text>
        </Pressable>
      </View>

      {showSettings ? (
        <View style={styles.settingsPanel}>
          <Text style={styles.cardIndex}>CONFIGURAÇÕES</Text>
          <SettingRow label="Unidade de peso" value="Quilogramas (kg)" />
          <SettingRow label="Privacidade do perfil" value="Privado" />
          <SettingRow label="Sincronização" value="Ativa" />
          <Text style={styles.settingsNote}>Estas preferências representam o comportamento planejado para o MVP.</Text>
        </View>
      ) : (
        <>
          <View style={[styles.profileStats, isWide && styles.profileStatsWide]}>
            <Metric label="TREINOS" value="32" />
            <Metric label="TEMPO TOTAL" value="29H 18" />
            <Metric label="DESDE" value="MAI 2026" />
          </View>

          <SectionTitle title="Conquistas" />
          <View style={[styles.achievementGrid, isWide && styles.achievementGridWide]}>
            <Achievement exercise="Supino reto" label="MAIOR CARGA" value="80 kg" />
            <Achievement exercise="Agachamento livre" label="MELHOR SÉRIE" value="720 kg" />
          </View>
          <Text style={styles.disclaimer}>Conquistas de demonstração calculadas conforme as regras do MVP.</Text>
        </>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={isLoggingOut}
        onPress={logout}
        style={({ pressed }) => [styles.logoutButton, (pressed || isLoggingOut) && styles.pressed]}
      >
        <Text style={styles.logoutButtonText}>{isLoggingOut ? 'Saindo...' : 'Sair da conta'}</Text>
      </Pressable>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
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
    <View style={styles.achievementCard}>
      <Text style={styles.cardIndex}>{label}</Text>
      <Text style={styles.achievementValue}>{value}</Text>
      <Text style={styles.achievementExercise}>{exercise}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loginKeyboard: { flex: 1 },
  loginPage: { flexGrow: 1, maxWidth: 1180, alignSelf: 'stretch', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  folioRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  folio: { color: colors.muted, fontFamily: mono, fontSize: 11, letterSpacing: 1.2 },
  loginGrid: { flex: 1, alignItems: 'stretch', justifyContent: 'center' },
  loginGridWide: { flexDirection: 'row', gap: 64, paddingVertical: 56 },
  loginGridNarrow: { flexDirection: 'column', gap: 32, paddingVertical: 32 },
  loginBrand: { flex: 1, minWidth: 0, justifyContent: 'center' },
  loginLogo: { alignSelf: 'flex-start' },
  loginLogoWide: { width: 220, height: 220, marginBottom: 8 },
  loginLogoNarrow: { width: 116, height: 116, marginBottom: 12 },
  loginCopy: { maxWidth: 610 },
  eyebrow: { color: colors.urucum, fontFamily: mono, fontSize: 12, letterSpacing: 1.4, marginBottom: 16 },
  loginTitle: { color: colors.text, fontFamily: mono, fontWeight: '700', letterSpacing: -2.4 },
  loginTitleWide: { fontSize: 64, lineHeight: 68 },
  loginTitleNarrow: { fontSize: 40, lineHeight: 44 },
  description: { color: colors.muted, fontFamily: mono, fontSize: 14, lineHeight: 22, maxWidth: 520, marginTop: 20 },
  loginPanel: { flex: 1, maxWidth: 460, width: '100%', alignSelf: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 28 },
  panelIndex: { color: colors.urucum, fontFamily: mono, fontSize: 11, letterSpacing: 1.2, marginBottom: 30 },
  panelTitle: { color: colors.text, fontFamily: mono, fontSize: 30, fontWeight: '700', letterSpacing: -1, marginBottom: 8 },
  panelDescription: { color: colors.muted, fontFamily: mono, fontSize: 12, lineHeight: 19, marginBottom: 28 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { color: colors.text, fontFamily: mono, fontSize: 11, letterSpacing: 0.8, marginBottom: 8 },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.background, color: colors.text, fontFamily: mono, fontSize: 14, paddingHorizontal: 14, outlineStyle: 'none' } as object,
  errorText: { color: colors.danger, fontFamily: mono, fontSize: 11, lineHeight: 17, marginBottom: 16 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.urucum, borderWidth: 1, borderColor: colors.urucum, paddingHorizontal: 20 },
  primaryButtonText: { color: colors.onUrucum, fontFamily: mono, fontSize: 13, fontWeight: '700' },
  demoCredentials: { marginTop: 24, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.line },
  demoLabel: { color: colors.muted, fontFamily: mono, fontSize: 9, letterSpacing: 1.1, marginBottom: 8 },
  demoValue: { color: colors.text, fontFamily: mono, fontSize: 11, lineHeight: 18 },
  pressed: { opacity: 0.64, transform: [{ scale: 0.98 }] },
  appShell: { flex: 1, overflow: 'hidden', backgroundColor: colors.background },
  appShellWide: { flexDirection: 'row' },
  sideNav: { width: 228, borderRightWidth: 1, borderRightColor: colors.line, backgroundColor: colors.surface, padding: 20 },
  sideBrand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.line },
  sideLogo: { width: 38, height: 38 },
  sideBrandName: { color: colors.text, fontFamily: mono, fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  sideNavItems: { flex: 1, paddingTop: 36, gap: 4 },
  sideNavItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, borderLeftWidth: 2, borderLeftColor: 'transparent' },
  sideNavItemActive: { backgroundColor: colors.surfaceRaised, borderLeftColor: colors.urucum },
  navLabel: { color: colors.muted, fontFamily: mono, fontSize: 13 },
  navLabelActive: { color: colors.text, fontWeight: '700' },
  sideVersion: { color: colors.muted, fontFamily: mono, fontSize: 9, letterSpacing: 1 },
  bottomNav: { height: 68, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  bottomNavItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, borderTopWidth: 2, borderTopColor: 'transparent' },
  bottomNavItemActive: { borderTopColor: colors.urucum, backgroundColor: colors.surfaceRaised },
  bottomNavLabel: { color: colors.muted, fontFamily: mono, fontSize: 10 },
  mainArea: { flex: 1, minWidth: 0 },
  appHeader: { minHeight: 82, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 24 },
  headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: { width: 34, height: 34 },
  headerTitle: { color: colors.text, fontFamily: mono, fontSize: 18, fontWeight: '700' },
  demoPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 7 },
  demoDot: { width: 6, height: 6, backgroundColor: colors.urucum },
  demoPillText: { color: colors.muted, fontFamily: mono, fontSize: 8, letterSpacing: 0.8 },
  content: { flexGrow: 1, maxWidth: 1120, alignSelf: 'stretch', padding: 24, paddingBottom: 56 },
  screen: { width: '100%' },
  sectionHeading: { marginBottom: 34 },
  kicker: { color: colors.urucum, fontFamily: mono, fontSize: 10, letterSpacing: 1.2, marginBottom: 12 },
  displayTitle: { color: colors.text, fontFamily: mono, fontSize: 36, lineHeight: 41, fontWeight: '700', letterSpacing: -1.6 },
  homeGrid: { gap: 16, marginBottom: 42 },
  homeGridWide: { flexDirection: 'row' },
  nextWorkoutCard: { flex: 1.7, minWidth: 0, minHeight: 330, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 24, justifyContent: 'space-between' },
  cardIndex: { color: colors.urucum, fontFamily: mono, fontSize: 9, letterSpacing: 1.1 },
  workoutName: { color: colors.text, fontFamily: mono, fontSize: 27, fontWeight: '700', letterSpacing: -1, marginTop: 34 },
  workoutMeta: { color: colors.muted, fontFamily: mono, fontSize: 11, marginTop: 8 },
  exercisePreview: { flexDirection: 'row', marginVertical: 28, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  metric: { flex: 1, minWidth: 0, paddingVertical: 16, paddingRight: 8 },
  metricValue: { color: colors.text, fontFamily: mono, fontSize: 17, fontWeight: '700' },
  metricLabel: { color: colors.muted, fontFamily: mono, fontSize: 8, letterSpacing: 0.7, marginTop: 6 },
  summaryColumn: { flex: 1, minWidth: 0, gap: 16 },
  summaryCard: { flex: 1, minHeight: 150, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 20 },
  summaryValue: { color: colors.text, fontFamily: mono, fontSize: 32, fontWeight: '700', letterSpacing: -1, marginTop: 18 },
  summaryLabel: { color: colors.muted, fontFamily: mono, fontSize: 10, marginTop: 3 },
  progressTrack: { height: 4, backgroundColor: colors.line, marginTop: 18 },
  progressFill: { height: 4, width: '50%', backgroundColor: colors.urucum },
  summaryFootnote: { color: colors.muted, fontFamily: mono, fontSize: 8, marginTop: 9 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: 12 },
  sectionTitle: { color: colors.text, fontFamily: mono, fontSize: 14, fontWeight: '700' },
  sectionAction: { color: colors.urucum, fontFamily: mono, fontSize: 10 },
  activityRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  activityDate: { color: colors.urucum, fontFamily: mono, fontSize: 10 },
  activityMain: { flex: 1 },
  activityTitle: { color: colors.text, fontFamily: mono, fontSize: 13, fontWeight: '700' },
  activityMeta: { color: colors.muted, fontFamily: mono, fontSize: 9, marginTop: 5 },
  activityVolume: { color: colors.text, fontFamily: mono, fontSize: 12, fontWeight: '700' },
  pageIntro: { gap: 24, marginBottom: 38 },
  pageIntroWide: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageIntroCopy: { flex: 1 },
  compactButton: { minWidth: 150, alignSelf: 'flex-start' },
  list: { width: '100%' },
  routineCard: { gap: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 10 },
  routineCardWide: { minHeight: 106, flexDirection: 'row', alignItems: 'center' },
  routineNumber: { color: colors.urucum, fontFamily: mono, fontSize: 11 },
  routineMain: { flex: 1 },
  routineName: { color: colors.text, fontFamily: mono, fontSize: 17, fontWeight: '700' },
  routineFocus: { color: colors.muted, fontFamily: mono, fontSize: 10, marginTop: 5 },
  routineStat: { minWidth: 90 },
  routineStatValue: { color: colors.text, fontFamily: mono, fontSize: 16, fontWeight: '700' },
  routineStatLabel: { color: colors.muted, fontFamily: mono, fontSize: 8, letterSpacing: 0.7, marginTop: 4 },
  routineUpdated: { width: 130, color: colors.muted, fontFamily: mono, fontSize: 8 },
  outlineButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 18 },
  outlineButtonText: { color: colors.text, fontFamily: mono, fontSize: 10, fontWeight: '700' },
  disclaimer: { color: colors.muted, fontFamily: mono, fontSize: 8, lineHeight: 14, marginTop: 16 },
  historySummary: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 20, marginBottom: 32 },
  historySummaryWide: { flexDirection: 'row' },
  historyRow: { gap: 14, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 18 },
  historyRowWide: { minHeight: 82, flexDirection: 'row', alignItems: 'center' },
  historyDate: { color: colors.urucum, fontFamily: mono, fontSize: 10, width: 58 },
  historyMain: { flex: 1 },
  historyName: { color: colors.text, fontFamily: mono, fontSize: 13, fontWeight: '700' },
  historyMeta: { color: colors.muted, fontFamily: mono, fontSize: 9, marginTop: 5 },
  historyVolumeWrap: { minWidth: 120 },
  historyVolume: { color: colors.text, fontFamily: mono, fontSize: 12, fontWeight: '700' },
  historyVolumeLabel: { color: colors.muted, fontFamily: mono, fontSize: 8, marginTop: 4 },
  textButton: { paddingVertical: 10 },
  textButtonLabel: { color: colors.urucum, fontFamily: mono, fontSize: 10 },
  profileHeader: { gap: 18, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 28, marginBottom: 28 },
  profileHeaderWide: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 82, height: 82, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.urucum },
  avatarText: { color: colors.onUrucum, fontFamily: mono, fontSize: 24, fontWeight: '700' },
  profileIdentity: { flex: 1 },
  profileName: { color: colors.text, fontFamily: mono, fontSize: 25, fontWeight: '700', letterSpacing: -0.8 },
  profileEmail: { color: colors.muted, fontFamily: mono, fontSize: 11, marginTop: 6 },
  profileStats: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 20, marginBottom: 30 },
  profileStatsWide: { flexDirection: 'row' },
  achievementGrid: { gap: 12, marginTop: 14 },
  achievementGridWide: { flexDirection: 'row' },
  achievementCard: { flex: 1, minHeight: 150, justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 20 },
  achievementValue: { color: colors.text, fontFamily: mono, fontSize: 30, fontWeight: '700', letterSpacing: -1 },
  achievementExercise: { color: colors.muted, fontFamily: mono, fontSize: 10 },
  settingsPanel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 22, marginBottom: 24 },
  settingRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  settingLabel: { flex: 1, color: colors.text, fontFamily: mono, fontSize: 11 },
  settingValue: { color: colors.muted, fontFamily: mono, fontSize: 10, textAlign: 'right' },
  settingsNote: { color: colors.muted, fontFamily: mono, fontSize: 8, lineHeight: 14, marginTop: 18 },
  logoutButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.danger, marginTop: 30 },
  logoutButtonText: { color: colors.danger, fontFamily: mono, fontSize: 11, fontWeight: '700' },
});
