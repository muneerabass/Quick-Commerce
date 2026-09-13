import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../context/CartContext';
import { getCategoryById } from '../data/categories';
import { CartItem } from '../types';
import { formatPrice } from '../utils/format';
import { colors, spacing } from '../theme';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow = React.memo(function CartItemRow({ item }: CartItemRowProps) {
  const { addItem, decrementItem } = useCart();
  const { product, quantity } = item;

  const handleAdd = useCallback(() => addItem(product), [addItem, product]);
  const handleRemove = useCallback(() => decrementItem(product.id), [decrementItem, product.id]);

  const tint = getCategoryById(product.categoryId)?.tint ?? colors.surfaceMuted;
  const lineTotal = product.price * quantity;
  const lineOriginal = (product.originalPrice ?? product.price) * quantity;

  return (
    <View style={styles.row}>
      <ProductImage
        uri={product.image}
        emoji={product.emoji}
        size={56}
        tint={tint}
        radiusToken="sm"
        recyclingKey={product.id}
      />

      <View style={styles.details}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="caption" color="textTertiary" style={styles.quantity}>
          {product.quantity}
        </AppText>
      </View>

      <View style={styles.trailing}>
        <QuantitySelector
          quantity={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          productName={product.name}
        />

        <View style={styles.priceBlock}>
          <AppText variant="bodyStrong">{formatPrice(lineTotal)}</AppText>
          {lineOriginal > lineTotal ? (
            <AppText variant="caption" color="textTertiary" style={styles.strike}>
              {formatPrice(lineOriginal)}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  details: { flex: 1, marginHorizontal: spacing.md },
  name: { fontWeight: '600' },
  quantity: { marginTop: 2 },
  trailing: { alignItems: 'flex-end' },
  priceBlock: { alignItems: 'flex-end', marginTop: spacing.sm },
  strike: { textDecorationLine: 'line-through', marginTop: 1 },
});
