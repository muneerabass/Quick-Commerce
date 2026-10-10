import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, EmptyState, PressableScale } from '../../components';
import * as orderService from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

function statusColor(status: Order['status']): string {
  if (status === 'completed') return colors.success;
  if (status === 'accepted') return colors.primary;
  return colors.warning;
}

export function OrderListScreen() {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true); else setIsLoading(true);
    try {
      setOrders(await orderService.listOrders());
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => void load(false));
    return unsub;
  }, [load, navigation]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AppText variant="heading2" style={styles.title}>
          My orders
        </AppText>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState emoji="📦" title="No orders yet" message="Place your first order to see it here." />
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
              scaleTo={0.985}
              haptic="none"
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <AppText variant="bodyStrong">Order #{item.id.slice(0, 8)}</AppText>
                <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                  <AppText variant="caption" color="textInverse">
                    {item.status.toUpperCase()}
                  </AppText>
                </View>
              </View>
              <AppText variant="bodySmall" color="textSecondary" style={styles.sub}>
                {item.items.length} item{item.items.length === 1 ? '' : 's'} · {formatPrice(item.total_amount)}
              </AppText>
              <AppText variant="caption" color="textTertiary" style={styles.sub}>
                {new Date(item.created_at).toLocaleString()}
              </AppText>
            </PressableScale>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
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
  title: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl },
  card: { padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  sub: { marginTop: 2 },
});
