import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, PressableScale } from '../../components';
import * as orderService from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'OrderDetails'>;

const POLL_INTERVAL_MS = 10_000;

export function OrderDetailsScreen({ navigation, route }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const next = await orderService.getOrder(route.params.orderId);
      setOrder(next);
    } catch {
      // keep stale copy
    } finally {
      setIsLoading(false);
    }
  }, [route.params.orderId]);

  useEffect(() => {
    void fetchOrder();
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [fetchOrder]);

  // Poll while the order isn't terminal so the status refreshes without a pull.
  useEffect(() => {
    if (!order) return;
    if (order.status === 'completed') {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      return;
    }
    if (!pollTimer.current) {
      pollTimer.current = setInterval(() => void fetchOrder(), POLL_INTERVAL_MS);
    }
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [fetchOrder, order]);

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.titleBlock}>
          <AppText variant="heading2">Order #{order.id.slice(0, 8)}</AppText>
          <AppText variant="caption" color="textTertiary">
            {new Date(order.created_at).toLocaleString()}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <AppText variant="captionStrong" color="textTertiary">
            STATUS
          </AppText>
          <AppText variant="heading3" style={styles.statusValue}>
            {order.status === 'pending' ? 'Awaiting rider pickup' : order.status === 'accepted' ? 'Out for delivery' : 'Delivered'}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            Payment: {order.payment_method.toUpperCase()} · {order.payment_status}
          </AppText>
        </View>

        <AppText variant="heading3" style={styles.sectionHeader}>
          Delivering to
        </AppText>
        <View style={styles.card}>
          <AppText variant="bodySmall" style={styles.lines}>
            {order.recipient_name} · {order.delivery_phone}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
            {[order.address_line1, order.address_line2, order.landmark].filter(Boolean).join(', ')}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
            {order.city}, {order.state} · {order.pincode}
          </AppText>
        </View>

        <AppText variant="heading3" style={styles.sectionHeader}>
          Items
        </AppText>
        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.product_id} style={styles.itemRow}>
              <View style={styles.flex}>
                <AppText variant="bodySmall" style={styles.lines}>
                  {item.product_name}
                </AppText>
                <AppText variant="caption" color="textTertiary">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </AppText>
              </View>
              <AppText variant="bodyStrong">{formatPrice(item.line_total)}</AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <AppText variant="bodyStrong">Total</AppText>
            <AppText variant="bodyStrong">{formatPrice(order.total_amount)}</AppText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.gutter, paddingVertical: spacing.lg },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  titleBlock: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl },
  statusCard: {
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  statusValue: { marginTop: spacing.xs, marginBottom: spacing.xs },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  lines: { marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  flex: { flex: 1, marginRight: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
