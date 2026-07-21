import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, BottomNavigation, SideNavigation } from './src/components/app-navigation';
import { colors, sizes, spacing } from './src/design-system';
import type { AppTab } from './src/navigation/tabs';
import { useSectionNavigation } from './src/navigation/use-section-navigation';
import { HistoryScreen, HomeScreen, LoginScreen, ProfileScreen, RoutinesScreen } from './src/screens';

const SESSION_KEY = '@ata:demo-session';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { width } = useWindowDimensions();
  const isWide = width >= sizes.breakpointWide;
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('inicio');
  const { animatedStyle, navigateTo, panHandlers } = useSectionNavigation({
    activeTab,
    isWide,
    setActiveTab,
    width,
  });

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((value) => setIsAuthenticated(value === 'authenticated'))
      .finally(() => setIsLoading(false));
  }, []);

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
        <ActivityIndicator color={colors.accent} />
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
        {isWide ? <SideNavigation activeTab={activeTab} onChange={navigateTo} /> : null}

        <Animated.View
          {...(!isWide ? panHandlers : {})}
          style={[styles.mainArea, !isWide && animatedStyle]}
        >
          <AppHeader activeTab={activeTab} />
          <ScrollView contentContainerStyle={styles.content}>
            {activeTab === 'inicio' ? <HomeScreen isWide={isWide} onNavigate={navigateTo} /> : null}
            {activeTab === 'fichas' ? <RoutinesScreen isWide={isWide} /> : null}
            {activeTab === 'historico' ? <HistoryScreen isWide={isWide} /> : null}
            {activeTab === 'perfil' ? <ProfileScreen isWide={isWide} onLogout={handleLogout} /> : null}
          </ScrollView>
        </Animated.View>

        {!isWide ? <BottomNavigation activeTab={activeTab} onChange={navigateTo} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  appShell: { flex: 1, overflow: 'hidden', backgroundColor: colors.background },
  appShellWide: { flexDirection: 'row' },
  mainArea: { flex: 1, minWidth: 0 },
  content: {
    flexGrow: 1,
    maxWidth: sizes.contentMaxWidth,
    alignSelf: 'stretch',
    padding: spacing.lg,
    paddingBottom: spacing.section,
  },
});
