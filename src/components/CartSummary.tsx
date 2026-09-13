import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { CartTotals, FREE_DELIVERY_THRESHOLD } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { colors, radius, spacing } from '../theme';

interface CartSummaryProps {
  totals: CartTotals;
}

function Row({
  label,
  value,
  strong,
  free,
  hint,
}: {
  label: string;
  value: string;
  strong?: boolean;
  free?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelBlock}>
        <AppText variant={strong ? 'bodyStrong' : 'bodySmall'} color={strong ? 'text' : 'textSecondary'}>
          {label}
        </AppText>
        {hint ? (
          <AppText variant="caption" color="textTertiary" style={styles.hint}>
            {hint}
          </AppText>
        ) : null}
      </View>

      <View style={styles.valueBlock}>
        {free ? (
          <AppText variant="caption" color="textTertiary" style={styles.strike}>
            {formatPrice(25)}
          </AppText>
        ) : null}
        <AppText
          variant={strong ? 'bodyStrong' : 'bodySmall'}
          color={free ? 'success' : strong ? 'text' : 'text'}
        >
          {free ? 'FREE' : value}
        </AppText>
      </View>
    </View>
  );
}

/** Bill breakdown. Fee logic lives in CartContext so this stays presentational. */
export const CartSummary = React.memo(function CartSummary({ totals }: CartSummaryProps) {
  return (
    <View style={styles.card}>
      <AppText variant="heading3" style={styles.heading}>
        Bill details
      </AppText>

      <Row label="Item total" value={formatPrice(totals.subtotal)} />
      <Row
        label="Delivery fee"
        value={formatPrice(totals.deliveryFee)}
        free={totals.deliveryFee === 0}
        hint={
          totals.amountToFreeDelivery > 0
            ? `Add ${formatPrice(totals.amountToFreeDelivery)} more to save it`
            : `Free above ${formatPrice(FREE_DELIVERY_THRESHOLD)}`
        }
      />
      <Row label="Handling charge" value={formatPrice(totals.handlingFee)} />

      <View style={styles.divider} />

      <Row label="To pay" value={formatPrice(totals.total)} strong />

      {totals.savings > 0 ? (
        <View style={styles.savingsPill}>
          <Ionicons name="pricetag" size={13} color={colors.success} />
          <AppText variant="captionStrong" color="success" style={styles.savingsText}>
            You saved {formatPrice(totals.savings)} on this order
          </AppText>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heading: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  labelBlock: { flex: 1, marginRight: spacing.lg },
  hint: { marginTop: 2 },
  valueBlock: { flexDirection: 'row', alignItems: 'center' },
  strike: { textDecorationLine: 'line-through', marginRight: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  savingsText: { marginLeft: spacing.sm, flex: 1 },
});
