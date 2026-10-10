import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { CartLine } from '../types';
import { formatPrice } from '../utils/price';
import { colors, spacing } from '../theme';

interface CartItemRowProps {
  line: CartLine;
}

/**
 * Row-rendered against a server cart line. Looks up the live product in StoreContext
 * for its image + quantity-left, falling back to a plain row if the product is no
 * longer stocked in the active store.
 */
export const CartItemRow = React.memo(function CartItemRow({ line }: CartItemRowProps) {
  const { incrementLine, decrementLine } = useCart();
  const { getProductById } = useStore();
  const product = getProductById(line.product_id);

  const handleAdd = useCallback(() => incrementLine(line), [incrementLine, line]);
  const handleRemove = useCallback(() => decrementLine(line), [decrementLine, line]);

  return (
    <View style={styles.row}>
      <ProductImage
        uri={product?.image_url}
        fallbackText={line.product_name}
        size={56}
        tint={colors.surfaceMuted}
        radiusToken="sm"
        recyclingKey={line.id}
      />

      <View style={styles.details}>
        <AppText variant="bodySmall" numberOfLines={2} style={styles.name}>
          {line.product_name}
        </AppText>
        <AppText variant="caption" color="textTertiary" style={styles.unit}>
          {formatPrice(line.unit_price)} each
        </AppText>
      </View>

      <View style={styles.trailing}>
        <QuantitySelector
          quantity={line.quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          productName={line.product_name}
        />

        <View style={styles.priceBlock}>
          <AppText variant="bodyStrong">{formatPrice(line.line_total)}</AppText>
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
  unit: { marginTop: 2 },
  trailing: { alignItems: 'flex-end' },
  priceBlock: { alignItems: 'flex-end', marginTop: spacing.sm },
});
