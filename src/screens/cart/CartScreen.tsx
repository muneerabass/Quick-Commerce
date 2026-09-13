import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
  AppText,
  Button,
  CartItemRow,
  CartSummary,
  EmptyState,
  PressableScale,
} from '../../components';
import { FREE_DELIVERY_THRESHOLD, useCart } from '../../context/CartContext';
import { CartItem } from '../../types';
import { formatPrice, pluralize } from '../../utils/format';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

/** Progress toward the free-delivery threshold — a nudge, not a nag. */
function FreeDeliveryBar({ subtotal, remaining }: { subtotal: number; remaining: number }) {
  const progress = Math.min(subtotal / FREE_DELIVERY_THRESHOLD, 1);
  const unlocked = remaining === 0;

  return (
    <View style={[styles.deliveryCard, unlocked && styles.deliveryCardUnlocked]}>
      <View style={styles.deliveryCopy}>
        <Ionicons
          name={unlocked ? 'checkmark-circle' : 'bicycle'}
          size={17}
          color={unlocked ? colors.success : colors.primary}
        />
        <AppText variant="bodySmall" style={styles.deliveryText}>
          {unlocked
            ? 'Free delivery unlocked on this order'
            : `Add ${formatPrice(remaining)} more for free delivery`}
        </AppText>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: unlocked ? colors.success : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function CartScreen() {
  const navigation = useNavigation<Navigation>();
  const { items, totals, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);

  const goToHome = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Home' }),
    [navigation],
  );

  const handleClear = useCallback(() => {
    Alert.alert('Empty your cart?', 'This removes every item you have added.', [
      { text: 'Keep items', style: 'cancel' },
      { text: 'Empty cart', style: 'destructive', onPress: clearCart },
    ]);
  }, [clearCart]);

  /** Checkout is intentionally a stub in Phase 1 — payment lands in Phase 2. */
  const handleCheckout = useCallback(() => {
    setIsPlacing(true);
    setTimeout(() => {
      setIsPlacing(false);
      Alert.alert(
        'Checkout is coming soon',
        'Address selection and payment arrive in the next release. Your cart has been kept.',
        [{ text: 'Got it' }],
      );
    }, 700);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => <CartItemRow item={item} />,
    [],
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <AppText variant="heading1">Your cart</AppText>
        </View>

        <View style={styles.emptyWrap}>
          <EmptyState
            emoji="🛒"
            title="Your cart is empty"
            message="Add some essentials and we'll have them at your door in ten minutes."
            actionLabel="Start shopping"
            onActionPress={goToHome}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="heading1">Your cart</AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.headerSub}>
            {pluralize(totals.itemCount, 'item')} · arriving in 10 mins
          </AppText>
        </View>

        <PressableScale
          onPress={handleClear}
          scaleTo={0.94}
          haptic="none"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Empty cart"
          style={styles.clearButton}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <AppText variant="captionStrong" color="error" style={styles.clearLabel}>
            Empty
          </AppText>
        </PressableScale>
      </View>

      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <FreeDeliveryBar
            subtotal={totals.subtotal}
            remaining={totals.amountToFreeDelivery}
          />
        }
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={
          <View style={styles.footerBlock}>
            <CartSummary totals={totals} />

            <View style={styles.noteCard}>
              <Ionicons name="information-circle-outline" size={17} color={colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={styles.noteText}>
                Delivering to Home · Dharampeth, Nagpur. Address selection arrives with checkout.
              </AppText>
            </View>
          </View>
        }
        // Rows re-flow smoothly when an item is removed mid-list.
        itemLayoutAnimation={LinearTransition.duration(220)}
      />

      {/* Sits directly above the tab bar, which already carries the home-indicator inset. */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutTotal}>
          <AppText variant="caption" color="textTertiary">
            To pay
          </AppText>
          <AppText variant="heading3">{formatPrice(totals.total)}</AppText>
        </View>

        <Button
          label="Proceed to checkout"
          onPress={handleCheckout}
          loading={isPlacing}
          icon="arrow-forward"
          iconPosition="right"
          fullWidth={false}
          style={styles.checkoutButton}
          accessibilityHint="Checkout is not available yet in this release"
        />
      </View>
    </SafeAreaView>
  );
}

const ItemSeparator = () => <View style={styles.itemSeparator} />;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  headerCopy: { flex: 1 },
  headerSub: { marginTop: spacing.xs },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.errorSoft,
  },
  clearLabel: { marginLeft: spacing.xs },
  emptyWrap: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  listContent: { paddingTop: spacing.lg, paddingBottom: 190 },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 84,
  },
  deliveryCard: {
    marginHorizontal: layout.gutter,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  deliveryCardUnlocked: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(18,160,92,0.25)',
  },
  deliveryCopy: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  deliveryText: { marginLeft: spacing.sm, flex: 1, fontWeight: '600' },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(16,18,25,0.08)',
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: radius.pill },
  footerBlock: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: { marginLeft: spacing.sm, flex: 1, lineHeight: 16 },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.md,
    ...shadows.floating,
  },
  checkoutTotal: { flex: 1 },
  checkoutButton: { paddingHorizontal: spacing.xl },
});
