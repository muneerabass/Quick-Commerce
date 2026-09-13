import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, layout, radius, spacing } from '../theme';

interface DeliveryBannerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * The speed promise. Deliberately flat and quiet — the header above it already carries
 * the brand colour, so a second loud block here would fight it.
 */
export const DeliveryBanner = React.memo(function DeliveryBanner({ style }: DeliveryBannerProps) {
  return (
    <View style={[styles.card, style]} accessible accessibilityRole="summary">
      <View style={styles.iconRing}>
        <Ionicons name="flash" size={20} color={colors.primary} />
      </View>

      <View style={styles.copy}>
        <AppText variant="overline" color="primary">
          10 minute delivery
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          Fresh essentials at your doorstep, all day
        </AppText>
      </View>

      <View style={styles.riderMark}>
        <AppText style={styles.riderEmoji}>🛵</AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.gutter,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  iconRing: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, marginLeft: spacing.md },
  subtitle: { marginTop: 2 },
  riderMark: { marginLeft: spacing.sm },
  riderEmoji: { fontSize: 26, lineHeight: 32 },
});
