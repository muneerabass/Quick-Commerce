import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, shadows, spacing } from '../theme';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success' | 'warning' | 'error';
}

const TONES = {
  primary: { icon: colors.primary, background: colors.primarySoft },
  success: { icon: colors.success, background: colors.successSoft },
  warning: { icon: colors.warning, background: colors.warningSoft },
  error: { icon: colors.error, background: colors.errorSoft },
} as const;

export function AdminStatCard({ label, value, icon, tone = 'primary' }: AdminStatCardProps) {
  const palette = TONES[tone];
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={18} color={palette.icon} />
      </View>
      <AppText variant="heading2" style={styles.value}>{value}</AppText>
      <AppText variant="caption" color="textSecondary">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 116, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  icon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  value: { marginBottom: spacing.xs },
});
