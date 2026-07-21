import { Platform } from 'react-native';

export const colors = {
  background: '#0B0C0A',
  surface: '#121310',
  surfaceRaised: '#191A16',
  border: '#30312D',
  text: '#F5F2EA',
  textMuted: '#9A9B94',
  accent: '#E34213',
  onAccent: '#0B0C0A',
  danger: '#FF3B30',
} as const;

export const fontFamilies = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }),
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 56,
} as const;

export const sizes = {
  breakpointWide: 860,
  contentMaxWidth: 1120,
  loginMaxWidth: 1180,
  headerHeight: 82,
  bottomNavigationHeight: 68,
  sideNavigationWidth: 228,
  controlHeight: 52,
  compactControlHeight: 42,
} as const;

export const typography = {
  overline: { fontFamily: fontFamilies.mono, fontSize: 9, letterSpacing: 1.1 },
  caption: { fontFamily: fontFamilies.mono, fontSize: 10 },
  label: { fontFamily: fontFamilies.mono, fontSize: 11 },
  body: { fontFamily: fontFamilies.mono, fontSize: 13 },
  bodyLarge: { fontFamily: fontFamilies.mono, fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontFamily: fontFamilies.mono, fontSize: 18, fontWeight: '700' as const },
  display: {
    fontFamily: fontFamilies.mono,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: -1.6,
  },
} as const;

export const motion = {
  enterDistanceRatio: 0.09,
  enterDistanceMax: 36,
  enterOpacity: 0.82,
  swipeDistanceRatio: 0.34,
  swipeThresholdRatio: 0.18,
  swipeThresholdMax: 72,
  swipeVelocity: 0.45,
  edgeResistance: 0.22,
  navigationSpring: {
    stiffness: 320,
    damping: 30,
    mass: 0.8,
  },
  returnSpring: {
    stiffness: 360,
    damping: 32,
    mass: 0.75,
  },
} as const;

