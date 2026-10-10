import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { colors, spacing } from '../theme';

interface AdminScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
}

export function AdminScreenHeader({
  eyebrow = 'ZIPP ADMIN',
  title,
  subtitle,
  actionLabel,
  actionIcon = 'add',
  onAction,
}: AdminScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AppText variant="overline" color="primary">{eyebrow}</AppText>
        <AppText variant="heading1" style={styles.title}>{title}</AppText>
        {subtitle ? <AppText variant="bodySmall" color="textSecondary">{subtitle}</AppText> : null}
      </View>
      {onAction && actionLabel ? (
        <PressableScale
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
        >
          <Ionicons name={actionIcon} size={18} color={colors.primary} />
          <AppText variant="buttonSmall" color="primary" style={styles.actionLabel}>{actionLabel}</AppText>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xxl },
  copy: { flex: 1, paddingRight: spacing.md },
  title: { marginTop: spacing.xs, marginBottom: spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingLeft: spacing.sm },
  actionLabel: { marginLeft: spacing.xs },
});
