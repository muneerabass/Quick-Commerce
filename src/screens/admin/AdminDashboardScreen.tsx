import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AdminScreenHeader,
  AdminStatCard,
  AppText,
  Button,
  PressableScale,
  StatusPill,
} from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadows, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

export function AdminDashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const {
    stores,
    activeStore,
    products,
    categories,
    lowStockProducts,
    outOfStockProducts,
    isHydrated,
    isRefreshing,
    refresh,
    selectStore,
  } = useAdmin();

  const showStorePicker = useCallback(() => {
    if (stores.length === 0) return;
    const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }[] = stores.map((store) => ({
      text: store.name,
      onPress: () => selectStore(store.id),
    }));
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Select active store', undefined, buttons);
  }, [selectStore, stores]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminScreenHeader title={`Hi ${user?.name ?? 'admin'}`} subtitle="Running the Quick-Commerce back office." />

        <PressableScale onPress={showStorePicker} scaleTo={0.985} haptic="none" style={styles.storeCard}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          <View style={styles.storeCopy}>
            <AppText variant="captionStrong">ACTIVE STORE</AppText>
            <AppText variant="bodyStrong">
              {activeStore?.name ?? (stores.length === 0 ? 'No stores yet — create one' : 'Pick a store')}
            </AppText>
          </View>
          <AppText variant="button" color="primary">
            Change
          </AppText>
        </PressableScale>

        <View style={styles.statsRow}>
          <AdminStatCard label="Products" value={products.length} icon="cube-outline" />
          <AdminStatCard label="Categories" value={categories.length} icon="grid-outline" tone="success" />
        </View>
        <View style={[styles.statsRow, styles.statsSecondRow]}>
          <AdminStatCard label="Low stock" value={lowStockProducts.length} icon="alert-circle-outline" tone="warning" />
          <AdminStatCard label="Out of stock" value={outOfStockProducts.length} icon="close-circle-outline" tone="error" />
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="heading3">Quick actions</AppText>
        </View>
        <View style={styles.actionsCard}>
          <PressableScale style={styles.actionRow} onPress={() => navigation.navigate('ProductForm', undefined)}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <AppText variant="bodyStrong">Add a product</AppText>
              <AppText variant="caption" color="textSecondary">Create a new catalogue item</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
          <View style={styles.rowDivider} />
          <PressableScale style={styles.actionRow} onPress={() => navigation.navigate('Stores')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="storefront-outline" size={20} color={colors.success} />
            </View>
            <View style={styles.actionCopy}>
              <AppText variant="bodyStrong">Manage stores</AppText>
              <AppText variant="caption" color="textSecondary">Create new stores or toggle active</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
          <View style={styles.rowDivider} />
          <PressableScale style={styles.actionRow} onPress={() => navigation.navigate('DeliveryUsers')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FBF0E0' }]}>
              <Ionicons name="bicycle-outline" size={20} color={colors.warning} />
            </View>
            <View style={styles.actionCopy}>
              <AppText variant="bodyStrong">Delivery riders</AppText>
              <AppText variant="caption" color="textSecondary">Invite and assign to stores</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="heading3">Needs attention</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Update stock before the next delivery run.
            </AppText>
          </View>
          <AppText variant="buttonSmall" color="primary">
            {lowStockProducts.length + outOfStockProducts.length} items
          </AppText>
        </View>
        <View style={styles.alertCard}>
          {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map((product, index, list) => {
            const quantity = product.quantity ?? 0;
            return (
              <React.Fragment key={product.id}>
                <View style={styles.stockRow}>
                  <View style={styles.stockDot}>
                    <Ionicons name={quantity === 0 ? 'close' : 'warning-outline'} size={16} color={quantity === 0 ? colors.error : colors.warning} />
                  </View>
                  <View style={styles.stockCopy}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {product.name}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {quantity} units remaining
                    </AppText>
                  </View>
                  <StatusPill status={quantity === 0 ? 'out-of-stock' : 'low-stock'} />
                </View>
                {index < list.length - 1 ? <View style={styles.rowDivider} /> : null}
              </React.Fragment>
            );
          })}
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <View style={styles.stockRow}>
              <AppText color="textSecondary">All products are stocked and ready.</AppText>
            </View>
          ) : null}
        </View>

        <Button label="View full inventory" variant="secondary" size="md" onPress={() => navigation.navigate('AdminTabs', { screen: 'Inventory' })} style={styles.inventoryButton} />
        <Button label="Refresh" variant="ghost" size="md" onPress={() => void refresh()} loading={isRefreshing} style={styles.refreshButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.huge },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  storeCopy: { flex: 1, marginHorizontal: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statsSecondRow: { marginTop: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxxl, marginBottom: spacing.md },
  actionsCard: { paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  actionRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  actionCopy: { flex: 1 },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  alertCard: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  stockRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center' },
  stockDot: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  stockCopy: { flex: 1, paddingRight: spacing.sm },
  inventoryButton: { marginTop: spacing.lg },
  refreshButton: { marginTop: spacing.sm },
});
