import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, interactionStyles, sizes, spacing, typography } from '../design-system';
import { appTabs, type AppTab } from '../navigation/tabs';

type NavigationProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function SideNavigation({ activeTab, onChange }: NavigationProps) {
  return (
    <View style={styles.sideNav}>
      <View style={styles.sideBrand}>
        <Image
          accessibilityLabel="Logo do Atã"
          resizeMode="contain"
          source={require('../../assets/branding/ata-logo-concept-v2.png')}
          style={styles.sideLogo}
        />
        <Text style={styles.sideBrandName}>ATÃ</Text>
      </View>
      <View style={styles.sideNavItems}>
        {appTabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={({ pressed }) => [
                styles.sideNavItem,
                active && styles.sideNavItemActive,
                pressed && interactionStyles.pressed,
              ]}
            >
              <Ionicons
                accessible={false}
                color={active ? colors.accent : colors.textMuted}
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

export function BottomNavigation({ activeTab, onChange }: NavigationProps) {
  return (
    <View style={styles.bottomNav}>
      {appTabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.bottomNavItem,
              active && styles.bottomNavItemActive,
              pressed && interactionStyles.pressed,
            ]}
          >
            <Ionicons
              accessible={false}
              color={active ? colors.accent : colors.textMuted}
              name={active ? tab.activeIcon : tab.icon}
              size={21}
            />
            <Text numberOfLines={1} style={[styles.bottomNavLabel, active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AppHeader({ activeTab }: { activeTab: AppTab }) {
  const current = appTabs.find((tab) => tab.id === activeTab)!;

  return (
    <View style={styles.appHeader}>
      <View style={styles.headerIdentity}>
        <Image
          accessibilityLabel="Logo do Atã"
          resizeMode="contain"
          source={require('../../assets/branding/ata-logo-concept-v2.png')}
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

const styles = StyleSheet.create({
  sideNav: {
    width: sizes.sideNavigationWidth,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
  },
  sideBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sideLogo: { width: 38, height: 38 },
  sideBrandName: { color: colors.text, fontFamily: fontFamilies.mono, fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  sideNavItems: { flex: 1, paddingTop: 36, gap: spacing.xxs },
  sideNavItem: {
    minHeight: sizes.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  sideNavItemActive: { backgroundColor: colors.surfaceRaised, borderLeftColor: colors.accent },
  navLabel: { ...typography.body, color: colors.textMuted },
  navLabelActive: { color: colors.text, fontWeight: '700' },
  sideVersion: { ...typography.overline, color: colors.textMuted, letterSpacing: 1 },
  bottomNav: {
    height: sizes.bottomNavigationHeight,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  bottomNavItemActive: { borderTopColor: colors.accent, backgroundColor: colors.surfaceRaised },
  bottomNavLabel: { ...typography.caption, color: colors.textMuted },
  appHeader: {
    minHeight: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerLogo: { width: 34, height: 34 },
  headerTitle: { ...typography.sectionTitle, color: colors.text },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  demoDot: { width: 6, height: 6, backgroundColor: colors.accent },
  demoPillText: { ...typography.overline, color: colors.textMuted, fontSize: 8, letterSpacing: 0.8 },
});

