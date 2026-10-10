import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, EmptyState, PressableScale } from '../../components';
import { useAuth } from '../../context/AuthContext';
import * as deliveryService from '../../services/deliveryService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { DeliveryStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<DeliveryStackParamList>;

const POLL_INTERVAL_MS = 20_000;

export function DeliveryHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true); else setIsLoading(true);
    try {
      setOrders(await deliveryService.listPendingOrders());
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      void load(true);
      if (!timer.current) {
        timer.current = setInterval(() => void load(true), POLL_INTERVAL_MS);
      }
    });
    const unsubBlur = navigation.addListener('blur', () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    });
    return () => {
      unsub();
      unsubBlur();
    };
  }, [load, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out?', 'You can sign back in any time.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color="textTertiary">
            RIDER
          </AppText>
          <AppText variant="heading2">{user?.name ?? user?.phone ?? 'Delivery partner'}</AppText>
        </View>
        <PressableScale onPress={handleLogout} scaleTo={0.94} haptic="none" style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
        </PressableScale>
      </View>

      <View style={styles.summaryCard}>
        <AppText variant="captionStrong" color="textTertiary">
          PENDING ORDERS
        </AppText>
        <AppText variant="heading1">{orders.length}</AppText>
        <AppText variant="caption" color="textTertiary">
          Pull to refresh or tap an order to begin.
        </AppText>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState emoji="📦" title="No pending orders" message="New orders at your stores will appear here." />
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => navigation.navigate('DeliveryOrderDetails', { orderId: item.id })}
              scaleTo={0.985}
              haptic="none"
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <AppText variant="bodyStrong">Order #{item.id.slice(0, 8)}</AppText>
                <AppText variant="bodyStrong" color="primary">
                  {formatPrice(item.total_amount)}
                </AppText>
              </View>
              <AppText variant="bodySmall" color="textSecondary" style={styles.lines} numberOfLines={2}>
                {item.recipient_name} · {item.address_line1}, {item.city}
              </AppText>
              <AppText variant="caption" color="textTertiary" style={styles.lines}>
                {item.items.length} item{item.items.length === 1 ? '' : 's'} · {new Date(item.created_at).toLocaleTimeString()}
              </AppText>
              <Button
                label="Open"
                variant="secondary"
                size="sm"
                onPress={() => navigation.navigate('DeliveryOrderDetails', { orderId: item.id })}
                style={styles.openButton}
              />
            </PressableScale>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: layout.gutter,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  loader: { marginTop: spacing.xxxl },
  listContent: { paddingHorizontal: layout.gutter, paddingBottom: spacing.huge },
  card: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  lines: { marginTop: 2 },
  openButton: { marginTop: spacing.md, alignSelf: 'flex-start' },
});
