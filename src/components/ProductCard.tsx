import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { formatPriceCompact } from '../utils/price';
import { colors, layout, radius, shadows, spacing } from '../theme';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  /** `rail` is the fixed-width card used in horizontal sections; `grid` fills its column. */
  variant?: 'rail' | 'grid';
  /** Soft background tint behind the image (per-category look). */
  tint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The workhorse card. Cart state is read from context here rather than passed down,
 * so a screen can render a list of products without owning any cart logic.
 */
function ProductCardComponent({ product, onPress, variant = 'rail', tint, style }: ProductCardProps) {
  const { getQuantity, addItem, decrementByProductId } = useCart();
  const quantity = getQuantity(product.id);
  const inStock = product.quantity > 0;

  const handlePress = useCallback(() => onPress(product), [onPress, product]);
  const handleAdd = useCallback(() => addItem(product), [addItem, product]);
  const handleRemove = useCallback(() => decrementByProductId(product.id), [decrementByProductId, product.id]);

  const resolvedTint = tint ?? colors.surfaceMuted;
  const imageSize = variant === 'rail' ? layout.productImageHeight : layout.productGridImageHeight;

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.975}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPriceCompact(product.price)}`}
      style={[
        styles.card,
        variant === 'rail' ? { width: layout.productCardWidth } : styles.gridCard,
        style,
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: resolvedTint }]}>
        <ProductImage
          uri={product.image_url}
          fallbackText={product.name}
          size={imageSize}
          tint={resolvedTint}
          radiusToken="sm"
          recyclingKey={product.id}
          style={styles.image}
        />

        {!inStock ? (
          <View style={styles.stockOverlay}>
            <AppText variant="captionStrong" color="textInverse">
              Out of stock
            </AppText>
          </View>
        ) : null}

        <QuantitySelector
          quantity={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          disabled={!inStock}
          productName={product.name}
          style={styles.addControl}
        />
      </View>

      <View style={styles.body}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>

        {product.description ? (
          <AppText variant="caption" color="textTertiary" numberOfLines={1} style={styles.description}>
            {product.description}
          </AppText>
        ) : null}

        <View style={styles.priceRow}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {formatPriceCompact(product.price)}
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

export const ProductCard = React.memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.soft,
  },
  gridCard: { flex: 1 },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  addControl: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    ...shadows.soft,
  },
  image: { borderRadius: radius.sm },
  stockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16,18,25,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.sm },
  name: { fontWeight: '600', minHeight: 36 },
  description: { marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
});
