import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  EmptyState,
  FloatingCartBar,
  PressableScale,
  ProductGrid,
} from '../../components';
import { getCategoryById } from '../../data/categories';
import { getProductsByCategory } from '../../data/products';
import { Product } from '../../types';
import { pluralize } from '../../utils/format';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CategoryProducts'>;

type SortKey = 'relevance' | 'price-low' | 'price-high' | 'discount';

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'relevance', label: 'Popular' },
  { key: 'price-low', label: 'Price: low to high' },
  { key: 'price-high', label: 'Price: high to low' },
  { key: 'discount', label: 'Biggest savings' },
];

function sortProducts(items: Product[], key: SortKey): Product[] {
  const copy = [...items];
  switch (key) {
    case 'price-low':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-high':
      return copy.sort((a, b) => b.price - a.price);
    case 'discount':
      return copy.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    default:
      return copy.sort((a, b) => b.ratingCount - a.ratingCount);
  }
}

export function CategoryProductsScreen({ navigation, route }: Props) {
  const [sort, setSort] = useState<SortKey>('relevance');

  const category = getCategoryById(route.params.categoryId);
  const products = useMemo(
    () => sortProducts(getProductsByCategory(route.params.categoryId), sort),
    [route.params.categoryId, sort],
  );

  const goToProduct = useCallback(
    (product: Product) => navigation.navigate('ProductDetails', { productId: product.id }),
    [navigation],
  );

  const goToCart = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Cart' }),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <PressableScale
          onPress={() => navigation.goBack()}
          scaleTo={0.9}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>

        <View style={styles.headerCopy}>
          <AppText variant="heading3" numberOfLines={1}>
            {category?.name ?? 'Products'}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            {pluralize(products.length, 'item')}
          </AppText>
        </View>

        <PressableScale
          onPress={() => navigation.navigate('Search')}
          scaleTo={0.9}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Search products"
          style={styles.backButton}
        >
          <Ionicons name="search" size={21} color={colors.text} />
        </PressableScale>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
        style={styles.sortStrip}
      >
        {SORTS.map((option) => {
          const isActive = option.key === sort;
          return (
            <PressableScale
              key={option.key}
              onPress={() => setSort(option.key)}
              scaleTo={0.95}
              haptic="none"
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Sort by ${option.label}`}
              style={[styles.sortChip, isActive && styles.sortChipActive]}
            >
              <AppText
                variant="captionStrong"
                style={{ color: isActive ? colors.textInverse : colors.textSecondary }}
              >
                {option.label}
              </AppText>
            </PressableScale>
          );
        })}
      </ScrollView>

      <ProductGrid
        products={products}
        onProductPress={goToProduct}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <EmptyState
            compact
            emoji="🧺"
            title="Nothing here yet"
            message="We're restocking this aisle. Check back shortly."
            actionLabel="Browse categories"
            onActionPress={() => navigation.goBack()}
          />
        }
      />

      <FloatingCartBar onPress={goToCart} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, marginHorizontal: spacing.sm },
  sortStrip: { flexGrow: 0 },
  sortRow: {
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sortChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  gridContent: { paddingTop: spacing.sm, paddingBottom: spacing.huge + layout.floatingBarHeight },
});
