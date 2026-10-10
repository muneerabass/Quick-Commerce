import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, PressableScale } from '../../components';
import * as deliveryService from '../../services/deliveryService';
import * as orderService from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, layout, radius, spacing } from '../../theme';
import type { DeliveryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DeliveryStackParamList, 'DeliveryOrderDetails'>;

export function DeliveryOrderDetailsScreen({ navigation, route }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const load = useCallback(async () => {
    try {
      // Delivery users can read any order they're allowed to touch via /orders/:id.
      const next = await orderService.getOrder(route.params.orderId);
      setOrder(next);
    } catch {
      Alert.alert('Could not load order', 'The order may no longer be available.');
    } finally {
      setIsLoading(false);
    }
  }, [route.params.orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAccept = useCallback(async () => {
    setIsMutating(true);
    try {
      const next = await deliveryService.acceptOrder(route.params.orderId);
      setOrder(next);
    } catch (error) {
      Alert.alert('Could not accept', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsMutating(false);
    }
  }, [route.params.orderId]);

  const handleComplete = useCallback(async () => {
    Alert.alert('Mark delivered?', 'This also marks payment collected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark delivered',
        style: 'destructive',
        onPress: async () => {
          setIsMutating(true);
          try {
            const next = await deliveryService.completeOrder(route.params.orderId);
            setOrder(next);
          } catch (error) {
            Alert.alert('Could not complete', error instanceof Error ? error.message : 'Try again.');
          } finally {
            setIsMutating(false);
          }
        },
      },
    ]);
  }, [route.params.orderId]);

  const openMaps = useCallback(() => {
    if (!order) return;
    const query = order.latitude != null && order.longitude != null
      ? `${order.latitude},${order.longitude}`
      : encodeURIComponent(`${order.address_line1}, ${order.city}, ${order.state} ${order.pincode}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    void Linking.openURL(url);
  }, [order]);

  const callCustomer = useCallback(() => {
    if (!order) return;
    void Linking.openURL(`tel:${order.delivery_phone}`);
  }, [order]);

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const canAccept = order.status === 'pending';
  const canComplete = order.status === 'accepted';

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
            {order.status.toUpperCase()} · {new Date(order.created_at).toLocaleString()}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <AppText variant="captionStrong" color="textTertiary">
            CUSTOMER
          </AppText>
          <AppText variant="bodyStrong" style={styles.lines}>
            {order.recipient_name}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
            {order.delivery_phone}
          </AppText>
          <View style={styles.actions}>
            <Button label="Call" variant="secondary" size="sm" icon="call-outline" onPress={callCustomer} style={styles.actionBtn} />
            <Button label="Navigate" variant="secondary" size="sm" icon="navigate-outline" onPress={openMaps} style={styles.actionBtn} />
          </View>
        </View>

        <AppText variant="heading3" style={styles.sectionHeader}>
          Deliver to
        </AppText>
        <View style={styles.card}>
          <AppText variant="bodySmall" style={styles.lines}>
            {[order.address_line1, order.address_line2, order.landmark].filter(Boolean).join(', ')}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
            {order.city}, {order.state} · {order.pincode}
          </AppText>
          {order.delivery_instructions ? (
            <AppText variant="caption" color="textTertiary" style={styles.lines}>
              Note: {order.delivery_instructions}
            </AppText>
          ) : null}
        </View>

        <AppText variant="heading3" style={styles.sectionHeader}>
          Pickup
        </AppText>
        <View style={styles.card}>
          {order.items.map((item) => (
            <View key={item.product_id} style={styles.itemRow}>
              <View style={styles.flex}>
                <AppText variant="bodySmall" style={styles.lines}>
                  {item.product_name}
                </AppText>
                <AppText variant="caption" color="textTertiary">
                  × {item.quantity}
                </AppText>
              </View>
              <AppText variant="bodyStrong">{formatPrice(item.line_total)}</AppText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <AppText variant="bodyStrong">Collect on delivery</AppText>
            <AppText variant="bodyStrong" color="primary">
              {formatPrice(order.total_amount)}
            </AppText>
          </View>
        </View>

        {canAccept ? (
          <Button label="Accept order" onPress={handleAccept} loading={isMutating} style={styles.ctaButton} />
        ) : null}
        {canComplete ? (
          <Button label="Mark delivered" onPress={handleComplete} loading={isMutating} style={styles.ctaButton} />
        ) : null}
        {order.status === 'completed' ? (
          <View style={styles.doneCard}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <AppText variant="bodyStrong" color="success" style={styles.doneLabel}>
              Delivered — {order.completed_at ? new Date(order.completed_at).toLocaleTimeString() : ''}
            </AppText>
          </View>
        ) : null}
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
  card: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  lines: { marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  flex: { flex: 1, marginRight: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  ctaButton: { marginTop: spacing.lg },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  doneLabel: { marginLeft: spacing.sm },
});
