import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, Button, EmptyState, PressableScale, StatusPill, StoreSwitcher } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { AdminProduct } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type Filter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

export function AdminInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { activeStore, products, lowStockLimit, setInventoryFor } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const qty = product.quantity ?? 0;
      if (filter === 'in-stock' && qty <= lowStockLimit) return false;
      if (filter === 'low-stock' && (qty === 0 || qty > lowStockLimit)) return false;
      if (filter === 'out-of-stock' && qty !== 0) return false;
      if (!query) return true;
      return product.name.toLowerCase().includes(query);
    });
  }, [filter, lowStockLimit, products, search]);

  const handleAdjust = useCallback(
    (product: AdminProduct, next: number) => {
      if (!activeStore) {
        Alert.alert('No store selected', 'Pick an active store from the dashboard first.');
        return;
      }
      const clamped = Math.max(0, next);
      void setInventoryFor(product.id, clamped);
    },
    [activeStore, setInventoryFor],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminProduct }) => {
      const qty = item.quantity ?? 0;
      const status = qty === 0 ? 'out-of-stock' : qty <= lowStockLimit ? 'low-stock' : 'in-stock';
      return (
        <View style={styles.row}>
          <View style={styles.rowHead}>
            <AppText variant="bodyStrong" style={styles.name} numberOfLines={1}>
              {item.name}
            </AppText>
            <StatusPill status={status} />
          </View>
          <View style={styles.rowMeta}>
            <AppText variant="caption" color="textTertiary" numberOfLines={1}>
              {formatPrice(item.price)}
            </AppText>
            <AppText variant="captionStrong" color={qty === 0 ? 'error' : qty <= lowStockLimit ? 'warning' : 'success'}>
              {qty} units
            </AppText>
          </View>
          <View style={styles.stepper}>
            <PressableScale onPress={() => handleAdjust(item, qty - 1)} scaleTo={0.94} haptic="none" style={styles.stepButton} accessibilityRole="button" accessibilityLabel={`Remove one from ${item.name}`}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </PressableScale>
            <AppText variant="bodyStrong">{qty}</AppText>
            <PressableScale onPress={() => handleAdjust(item, qty + 1)} scaleTo={0.94} haptic="none" style={styles.stepButton} accessibilityRole="button" accessibilityLabel={`Add one to ${item.name}`}>
              <Ionicons name="add" size={18} color={colors.text} />
            </PressableScale>
            <Button label="Restock" variant="secondary" size="sm" onPress={() => handleAdjust(item, Math.max(50, qty))} style={styles.restockButton} />
          </View>
        </View>
      );
    },
    [handleAdjust, lowStockLimit],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerPad}>
        <AdminScreenHeader
          title="Inventory"
          subtitle={activeStore ? `Managing ${activeStore.name}` : 'Pick an active store first'}
        />
      </View>

      <StoreSwitcher style={styles.switcher} />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filters}>
        {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as Filter[]).map((option) => (
          <PressableScale
            key={option}
            onPress={() => setFilter(option)}
            scaleTo={0.96}
            haptic="none"
            style={[styles.filterChip, filter === option && styles.filterChipActive]}
          >
            <AppText variant="caption" color={filter === option ? 'primary' : 'textSecondary'}>
              {option.replace(/-/g, ' ')}
            </AppText>
          </PressableScale>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState emoji="📦" title="No products" message="Create products from the Catalog tab." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerPad: { paddingHorizontal: spacing.lg },
  switcher: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
  },
  searchInput: { flex: 1, ...typography.body, fontSize: 15, color: colors.text, marginHorizontal: spacing.md, paddingVertical: 0 },
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.canvas, borderRadius: radius.pill },
  filterChipActive: { backgroundColor: colors.primarySoft },
  listContent: { paddingHorizontal: spacing.lg },
  row: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, ...shadows.soft },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, marginRight: spacing.md },
  rowMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  stepButton: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  restockButton: { marginLeft: 'auto' },
});
