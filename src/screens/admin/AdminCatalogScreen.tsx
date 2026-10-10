import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, Button, EmptyState, PressableScale, ProductImage } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { AdminProduct } from '../../types';
import { formatPrice } from '../../utils/price';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

export function AdminCatalogScreen() {
  const navigation = useNavigation<Navigation>();
  const { products } = useAdmin();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const renderItem = useCallback(
    ({ item }: { item: AdminProduct }) => (
      <PressableScale
        onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
        scaleTo={0.985}
        haptic="none"
        style={styles.row}
      >
        <ProductImage uri={item.image_url} fallbackText={item.name} size={52} radiusToken="sm" />
        <View style={styles.copy}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {item.name}
          </AppText>
          <AppText variant="caption" color="textTertiary" numberOfLines={1}>
            {formatPrice(item.price)}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </PressableScale>
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminScreenHeader title="Catalog" subtitle="Create and edit products." />

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

      <Button
        label="Add new product"
        onPress={() => navigation.navigate('ProductForm', undefined)}
        icon="add"
        iconPosition="left"
        style={styles.addButton}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="No products" message="Create your first product to see it here." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  addButton: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.huge },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  copy: { flex: 1, marginHorizontal: spacing.md },
});
