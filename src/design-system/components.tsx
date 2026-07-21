import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { colors, sizes, spacing, typography } from './tokens';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'text';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  compact?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  compact = false,
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        styles[`${variant}Button`],
        style,
        (pressed || isDisabled) && styles.pressed,
      ]}
      {...props}
    >
      <Text style={[styles.buttonLabel, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ScreenHeading({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <View style={styles.screenHeading}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.displayTitle}>{children}</Text>
    </View>
  );
}

export function Surface({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.surface, style]} {...props}>
      {children}
    </View>
  );
}

export const interactionStyles = StyleSheet.create({
  pressed: {
    opacity: 0.64,
    transform: [{ scale: 0.98 }],
  },
});

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  buttonCompact: { minHeight: sizes.compactControlHeight },
  primaryButton: { backgroundColor: colors.accent, borderColor: colors.accent },
  outlineButton: { backgroundColor: 'transparent', borderColor: colors.border },
  dangerButton: { backgroundColor: 'transparent', borderColor: colors.danger },
  textButton: { minHeight: 0, backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 0, paddingVertical: 10 },
  buttonLabel: { ...typography.body, fontWeight: '700' },
  primaryLabel: { color: colors.onAccent },
  outlineLabel: { color: colors.text, fontSize: 10 },
  dangerLabel: { color: colors.danger, fontSize: 11 },
  textLabel: { color: colors.accent, fontSize: 10 },
  pressed: interactionStyles.pressed,
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { ...typography.label, color: colors.text, letterSpacing: 0.8, marginBottom: spacing.xs },
  input: {
    minHeight: sizes.controlHeight,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: typography.bodyLarge.fontFamily,
    fontSize: typography.bodyLarge.fontSize,
    paddingHorizontal: 14,
    outlineStyle: 'none',
  } as object,
  metric: { flex: 1, minWidth: 0, paddingVertical: spacing.md, paddingRight: spacing.xs },
  metricValue: { ...typography.sectionTitle, color: colors.text, fontSize: 17 },
  metricLabel: { ...typography.overline, color: colors.textMuted, fontSize: 8, letterSpacing: 0.7, marginTop: 6 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  sectionTitle: { ...typography.bodyLarge, color: colors.text, fontWeight: '700' },
  sectionAction: { ...typography.caption, color: colors.accent },
  screenHeading: { marginBottom: 34 },
  kicker: { ...typography.caption, color: colors.accent, letterSpacing: 1.2, marginBottom: spacing.sm },
  displayTitle: { ...typography.display, color: colors.text },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});

