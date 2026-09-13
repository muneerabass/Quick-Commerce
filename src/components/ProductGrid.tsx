import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { layout, spacing } from '../theme';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  contentContainerStyle?: object;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

/**
 * Two-column product grid shared by search results and category listings.
 * Kept as one component so both surfaces stay visually identical.
 */
export const ProductGrid = React.memo(function ProductGrid({
  products,
  onProductPress,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
}: ProductGridProps) {
  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <ProductCard
        product={item}
        onPress={onProductPress}
        variant="grid"
        style={styles.card}
      />
    ),
    [onProductPress],
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      columnWrapperStyle={styles.column}
      ItemSeparatorComponent={RowSeparator}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode="on-drag"
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      removeClippedSubviews
    />
  );
});

const RowSeparator = () => <View style={{ height: spacing.md }} />;

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl },
  column: { gap: spacing.md },
  card: { width: layout.productGridWidth, flex: 0 },
});
