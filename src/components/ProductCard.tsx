import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../context/CartContext';
import { getCategoryById } from '../data/categories';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { colors, layout, radius, shadows, spacing } from '../theme';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  /** `rail` is the fixed-width card used in horizontal sections; `grid` fills its column. */
  variant?: 'rail' | 'grid';
  style?: StyleProp<ViewStyle>;
}

/**
 * The workhorse card. Cart state is read from context here rather than passed down,
 * so a screen can render a list of products without owning any cart logic.
 */
function ProductCardComponent({ product, onPress, variant = 'rail', style }: ProductCardProps) {
  const { getQuantity, addItem, decrementItem } = useCart();
  const quantity = getQuantity(product.id);

  const handlePress = useCallback(() => onPress(product), [onPress, product]);
  const handleAdd = useCallback(() => addItem(product), [addItem, product]);
  const handleRemove = useCallback(() => decrementItem(product.id), [decrementItem, product.id]);

  const tint = getCategoryById(product.categoryId)?.tint ?? colors.surfaceMuted;
  const imageSize =
    variant === 'rail' ? layout.productImageHeight : layout.productGridImageHeight;

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.975}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.quantity}, ${formatPrice(product.price)}`}
      style={[
        styles.card,
        variant === 'rail' ? { width: layout.productCardWidth } : styles.gridCard,
        style,
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: tint }]}>
        <ProductImage
          uri={product.image}
          emoji={product.emoji}
          size={imageSize}
          tint={tint}
          radiusToken="sm"
          recyclingKey={product.id}
          style={styles.image}
        />

        {product.discount ? (
          <View style={styles.discountBadge}>
            <AppText variant="caption" style={styles.discountText}>
              {product.discount}%
            </AppText>
            <AppText variant="caption" style={styles.discountText}>
              OFF
            </AppText>
          </View>
        ) : null}

        {!product.inStock ? (
          <View style={styles.stockOverlay}>
            <AppText variant="captionStrong" color="textInverse">
              Out of stock
            </AppText>
          </View>
        ) : null}

        {/*
          The add control sits on the image rather than beside the price. A stepper is
          nearly twice the width of the collapsed pill, and on a ~140pt card that growth
          would otherwise crush the price into an ellipsis.
        */}
        <QuantitySelector
          quantity={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          disabled={!product.inStock}
          productName={product.name}
          style={styles.addControl}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.etaRow}>
          <Ionicons name="flash" size={10} color={colors.textSecondary} />
          <AppText variant="caption" color="textSecondary" style={styles.etaText}>
            {product.deliveryEta}
          </AppText>
        </View>

        <AppText variant="bodySmall" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>

        <AppText
          variant="caption"
          color="textTertiary"
          numberOfLines={1}
          style={styles.quantity}
        >
          {product.quantity}
        </AppText>

        <View style={styles.priceRow}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {formatPrice(product.price)}
          </AppText>
          {product.originalPrice ? (
            <AppText
              variant="caption"
              color="textTertiary"
              numberOfLines={1}
              style={styles.strikePrice}
            >
              {formatPrice(product.originalPrice)}
            </AppText>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * Re-renders only when this product's own cart quantity changes. Without this, adding one
 * item re-renders every card in every rail on the home screen.
 */
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
    // Leaves room for the add control to sit clear of the product image.
    paddingBottom: spacing.xxl,
  },
  addControl: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    ...shadows.soft,
  },
  image: { borderRadius: radius.sm },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 3,
    alignItems: 'center',
  },
  discountText: {
    color: colors.textInverse,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
  },
  stockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16,18,25,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.sm },
  etaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  etaText: { marginLeft: 3, fontWeight: '600' },
  name: { fontWeight: '600', minHeight: 36 },
  quantity: { marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm },
  strikePrice: { textDecorationLine: 'line-through', marginLeft: spacing.sm },
});
