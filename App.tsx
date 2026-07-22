import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './utils/supabase/client';
import { AppHeader, BottomNavigation, SideNavigation } from './src/components/app-navigation';
import {
  completeWorkoutSession,
  createRoutine,
  getActiveWorkoutSession,
  getWorkoutSession,
  initializeOfflineStore,
  listExercises,
  listHistory,
  listRoutines,
  prepareOfflineStoreForUser,
  saveWorkoutDraft,
  startWorkoutSession,
  updateWorkoutSet,
  type CreateRoutineInput,
  type Exercise,
  type HistoryEntry,
  type RoutineSummary,
  type UpdateWorkoutSetInput,
  type WorkoutSession,
} from './src/data/offline-store';
import { colors, sizes, spacing } from './src/design-system';
import type { AppTab } from './src/navigation/tabs';
import { useSectionNavigation } from './src/navigation/use-section-navigation';
import { HistoryScreen, HomeScreen, LoginScreen, ProfileScreen, RoutinesScreen, WorkoutScreen } from './src/screens';

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
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('inicio');
  const [routines, setRoutines] = useState<RoutineSummary[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false);
  const { animatedStyle, navigateTo, panHandlers } = useSectionNavigation({
    activeTab,
    isWide,
    setActiveTab,
    width,
  });

  useEffect(() => {
    let isMounted = true;

    async function syncSession(nextSession: Session | null) {
      if (!isMounted) return;
      setSession(nextSession);
      if (nextSession?.user.id) {
        await prepareOfflineStoreForUser(nextSession.user.id);
        await refreshLocalData();
      }
    }

    async function initialize() {
      await initializeOfflineStore();
      const { data } = await supabase.auth.getSession();
      await syncSession(data.session);
      if (isMounted) setIsLoading(false);
    }

    void initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshLocalData() {
    const [nextRoutines, nextExercises, nextHistory, nextActiveWorkout] = await Promise.all([
      listRoutines(), listExercises(), listHistory(), getActiveWorkoutSession(),
    ]);
    setRoutines(nextRoutines);
    setExercises(nextExercises);
    setHistory(nextHistory);
    setActiveWorkout(nextActiveWorkout);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setActiveTab('inicio');
    setActiveWorkout(null);
    setIsWorkoutOpen(false);
  }

  async function handleCreateRoutine(input: CreateRoutineInput) {
    await createRoutine(input);
    await refreshLocalData();
  }

  async function handleStartWorkout() {
    const routine = routines[0];
    if (!routine) return;
    const sessionId = await startWorkoutSession(routine.id);
    const session = await getWorkoutSession(sessionId);
    setActiveWorkout(session);
    setIsWorkoutOpen(true);
  }

  async function handleSaveWorkoutSet(setId: string, input: UpdateWorkoutSetInput) {
    await updateWorkoutSet(setId, input);
    if (activeWorkout) setActiveWorkout(await getWorkoutSession(activeWorkout.id));
  }

  async function handleCompleteWorkout() {
    if (!activeWorkout) return;
    await completeWorkoutSession(activeWorkout.id);
    await refreshLocalData();
    setActiveWorkout(null);
    setIsWorkoutOpen(false);
    setActiveTab('historico');
  }

  async function handleSaveWorkoutDraft() {
    if (!activeWorkout) return;
    await saveWorkoutDraft(activeWorkout.id);
    await refreshLocalData();
    setIsWorkoutOpen(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <LoginScreen isWide={isWide} />;
  }

  if (activeWorkout && isWorkoutOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.workoutShell}>
          <WorkoutScreen
            isWide={isWide}
            onClose={handleSaveWorkoutDraft}
            onComplete={handleCompleteWorkout}
            onSaveSet={handleSaveWorkoutSet}
            session={activeWorkout}
          />
        </View>
      </SafeAreaView>
    );
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
            {activeTab === 'inicio' ? (
              <HomeScreen
                activeSession={activeWorkout}
                isWide={isWide}
                onNavigate={navigateTo}
                onResumeWorkout={() => setIsWorkoutOpen(true)}
                onStartWorkout={handleStartWorkout}
                routine={routines[0] ?? null}
              />
            ) : null}
            {activeTab === 'fichas' ? <RoutinesScreen exercises={exercises} isWide={isWide} onCreateRoutine={handleCreateRoutine} routines={routines} /> : null}
            {activeTab === 'historico' ? <HistoryScreen isWide={isWide} sessions={history} /> : null}
            {activeTab === 'perfil' ? <ProfileScreen email={session.user.email ?? ''} isWide={isWide} onLogout={handleLogout} /> : null}
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
  workoutShell: { flex: 1, maxWidth: sizes.contentMaxWidth, alignSelf: 'center', width: '100%', padding: spacing.lg },
  content: {
    flexGrow: 1,
    maxWidth: sizes.contentMaxWidth,
    alignSelf: 'stretch',
    padding: spacing.lg,
    paddingBottom: spacing.section,
  },
});
