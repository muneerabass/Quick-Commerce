import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './SectionHeader';
import { Product } from '../types';
import { layout, spacing } from '../theme';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onSeeAllPress?: () => void;
}

/**
 * A horizontal product rail.
 *
 * Uses a FlatList rather than a ScrollView so long rails stay virtualised, and pins the
 * item width via `getItemLayout` so scroll position maths never has to measure.
 */
export const ProductSection = React.memo(function ProductSection({
  title,
  subtitle,
  products,
  onProductPress,
  onSeeAllPress,
}: ProductSectionProps) {
  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductCard product={item} onPress={onProductPress} />,
    [onProductPress],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Product> | null | undefined, index: number) => ({
      length: ITEM_STRIDE,
      offset: ITEM_STRIDE * index,
      index,
    }),
    [],
  );

  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} subtitle={subtitle} onActionPress={onSeeAllPress} />

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
        decelerationRate="fast"
        snapToInterval={ITEM_STRIDE}
        snapToAlignment="start"
      />
    </View>
  );
});

const GAP = spacing.md;
const ITEM_STRIDE = layout.productCardWidth + GAP;

const Separator = () => <View style={{ width: GAP }} />;

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xxl },
  listContent: { paddingHorizontal: layout.gutter },
});
