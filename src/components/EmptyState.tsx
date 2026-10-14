import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing } from '../theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shown instead of the icon when a more expressive mark suits the screen. */
  emoji?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export const EmptyState = React.memo(function EmptyState({
  icon = 'cube-outline',
  emoji,
  title,
  message,
  actionLabel,
  onActionPress,
  style,
  compact = false,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.container, compact && styles.compact, style]}
    >
      <View style={[styles.iconRing, compact && styles.iconRingCompact]}>
        {emoji ? (
          <AppText style={compact ? styles.emojiCompact : styles.emoji}>{emoji}</AppText>
        ) : (
          <Ionicons name={icon} size={compact ? 30 : 40} color={colors.primary} />
        )}
      </View>

      <AppText variant={compact ? 'heading3' : 'heading2'} center style={styles.title}>
        {title}
      </AppText>

      <AppText variant="bodySmall" color="textSecondary" center style={styles.message}>
        {message}
      </AppText>

      {actionLabel && onActionPress ? (
        <Button
          label={actionLabel}
          onPress={onActionPress}
          size="md"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.huge,
  },
  compact: { paddingVertical: spacing.xxl },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconRingCompact: { width: 64, height: 64, marginBottom: spacing.lg },
  emoji: { fontSize: 40, lineHeight: 48 },
  emojiCompact: { fontSize: 30, lineHeight: 36 },
  title: { marginBottom: spacing.sm },
  message: { maxWidth: 300 },
  action: { marginTop: spacing.xl, paddingHorizontal: spacing.xxxl },
});
