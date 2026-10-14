import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { Order } from '../types';
import { formatPrice } from '../utils/price';
import { colors, radius, shadows, spacing } from '../theme';

interface DeliveryOrderCardProps {
  order: Order;
  index?: number;
  onPress?: () => void;
  /** Action area rendered at the bottom of the card (buttons, status). */
  footer?: React.ReactNode;
}

export function DeliveryOrderCard({ order, index = 0, onPress, footer }: DeliveryOrderCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(200).delay(Math.min(index, 8) * 45)}>
      <PressableScale onPress={onPress} scaleTo={onPress ? 0.985 : 1} haptic="none" style={styles.card} disabled={!onPress}>
        <View style={styles.cardHeader}>
          <AppText variant="bodyStrong">Order #{order.id.slice(0, 8)}</AppText>
          <AppText variant="bodyStrong" color="primary">
            {formatPrice(order.total_amount)}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
          <AppText variant="bodySmall" color="textSecondary" style={styles.metaText} numberOfLines={1}>
            {order.recipient_name}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
          <AppText variant="bodySmall" color="textSecondary" style={styles.metaText} numberOfLines={2}>
            {order.address_line1}, {order.city}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="cube-outline" size={14} color={colors.textTertiary} />
          <AppText variant="caption" color="textTertiary" style={styles.metaText}>
            {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </AppText>
        </View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 3 },
  metaText: { flex: 1 },
  footer: { marginTop: spacing.md },
});
