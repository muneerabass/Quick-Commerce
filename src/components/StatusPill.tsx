import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type Status = 'in-stock' | 'low-stock' | 'out-of-stock' | 'active' | 'inactive';

const STATUS_COPY: Record<Status, { label: string; text: keyof typeof colors; background: keyof typeof colors }> = {
  'in-stock': { label: 'In stock', text: 'success', background: 'successSoft' },
  'low-stock': { label: 'Low stock', text: 'warning', background: 'warningSoft' },
  'out-of-stock': { label: 'Out of stock', text: 'error', background: 'errorSoft' },
  active: { label: 'Active', text: 'success', background: 'successSoft' },
  inactive: { label: 'Inactive', text: 'textSecondary', background: 'canvas' },
};

export function StatusPill({ status }: { status: Status }) {
  const copy = STATUS_COPY[status];
  return (
    <View style={[styles.pill, { backgroundColor: colors[copy.background] as string }]}>
      <View style={[styles.dot, { backgroundColor: colors[copy.text] as string }]} />
      <AppText variant="captionStrong" color={copy.text}>{copy.label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  dot: { width: 5, height: 5, borderRadius: radius.pill, marginRight: spacing.xs },
});
