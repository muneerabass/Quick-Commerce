import React from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, typography } from '../theme';
import type { TypographyVariant } from '../theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  /** Named palette entry — keeps ad-hoc hex values out of screens. */
  color?: keyof typeof colors;
  center?: boolean;
}

/**
 * The only text primitive in the app. Every size, weight and colour comes from the
 * theme, which is what keeps typography consistent across 12 screens.
 */
export const AppText = React.memo(function AppText({
  variant = 'body',
  color = 'text',
  center,
  style,
  ...rest
}: AppTextProps) {
  const composed: TextStyle[] = [
    typography[variant] as TextStyle,
    { color: colors[color] as string },
  ];
  if (center) composed.push(styles.center);

  return <RNText {...rest} style={[composed, style]} />;
});

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
