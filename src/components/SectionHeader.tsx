import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { colors, layout, spacing } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader = React.memo(function SectionHeader({
  title,
  subtitle,
  actionLabel = 'See all',
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleBlock}>
        <AppText variant="heading3" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textTertiary" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {onActionPress ? (
        <PressableScale
          onPress={onActionPress}
          scaleTo={0.93}
          haptic="none"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          style={styles.action}
        >
          <AppText variant="captionStrong" color="primary">
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.md,
  },
  titleBlock: { flex: 1, marginRight: spacing.md },
  subtitle: { marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
});
