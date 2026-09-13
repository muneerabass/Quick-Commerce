import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { colors, radius, shadows, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const HEIGHTS: Record<Size, number> = { lg: 54, md: 46, sm: 38 };

export const Button = React.memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = VARIANTS[variant];

  const iconNode = icon ? (
    <Ionicons
      name={icon}
      size={size === 'sm' ? 16 : 18}
      color={palette.content}
      style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
    />
  ) : null;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={0.975}
      haptic={variant === 'primary' ? 'medium' : 'light'}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        { height: HEIGHTS[size], backgroundColor: palette.background },
        palette.border ? { borderWidth: 1.5, borderColor: palette.border } : null,
        variant === 'primary' && !isDisabled ? shadows.soft : null,
        fullWidth ? styles.fullWidth : styles.autoWidth,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.content} size="small" />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' ? iconNode : null}
          <AppText
            variant={size === 'sm' ? 'buttonSmall' : 'button'}
            style={{ color: palette.content }}
            numberOfLines={1}
          >
            {label}
          </AppText>
          {iconPosition === 'right' ? iconNode : null}
        </View>
      )}
    </PressableScale>
  );
});

const VARIANTS: Record<Variant, { background: string; content: string; border?: string }> = {
  primary: { background: colors.primary, content: colors.textInverse },
  secondary: { background: colors.primarySoft, content: colors.primary, border: colors.primaryBorder },
  ghost: { background: colors.transparent, content: colors.text, border: colors.borderStrong },
  danger: { background: colors.errorSoft, content: colors.error },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  autoWidth: { alignSelf: 'flex-start' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  disabled: { opacity: 0.45 },
});
