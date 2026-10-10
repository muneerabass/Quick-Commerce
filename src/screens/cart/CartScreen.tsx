import React, { useCallback, useEffect, useState } from 'react';
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
import { FREE_DELIVERY_THRESHOLD_PAISE, useCart } from '../../context/CartContext';
import * as addressService from '../../services/addressService';
import * as orderService from '../../services/orderService';
import { Address, CartLine } from '../../types';
import { pluralize } from '../../utils/format';
import { formatPrice } from '../../utils/price';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

function FreeDeliveryBar({ subtotal, remaining }: { subtotal: number; remaining: number }) {
  const progress = Math.min(subtotal / FREE_DELIVERY_THRESHOLD_PAISE, 1);
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
  const { items, totals, clearCart, refresh } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      void refresh();
      addressService.listAddresses().then(setAddresses).catch(() => setAddresses([]));
    });
    return unsub;
  }, [navigation, refresh]);

  const goToHome = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Home' }),
    [navigation],
  );

  const goToAddresses = useCallback(
    () => navigation.navigate('AddressList', undefined),
    [navigation],
  );

  const handleClear = useCallback(() => {
    Alert.alert('Empty your cart?', 'This removes every item you have added.', [
      { text: 'Keep items', style: 'cancel' },
      { text: 'Empty cart', style: 'destructive', onPress: () => void clearCart() },
    ]);
  }, [clearCart]);

  const handleCheckout = useCallback(async () => {
    if (!defaultAddress) {
      Alert.alert('Add a delivery address', 'Please add an address before placing an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add address', onPress: () => navigation.navigate('AddressForm', undefined) },
      ]);
      return;
    }
    setIsPlacing(true);
    try {
      const order = await orderService.createOrder(defaultAddress.id);
      await refresh();
      navigation.navigate('OrderDetails', { orderId: order.id });
    } catch (error) {
      Alert.alert('Could not place order', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsPlacing(false);
    }
  }, [defaultAddress, navigation, refresh]);

  const renderItem = useCallback(
    ({ item }: { item: CartLine }) => <CartItemRow line={item} />,
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
            message="Add some essentials and we'll have them at your door in minutes."
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <FreeDeliveryBar subtotal={totals.subtotal} remaining={totals.amountToFreeDelivery} />
        }
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={
          <View style={styles.footerBlock}>
            <CartSummary totals={totals} />

            <PressableScale onPress={goToAddresses} scaleTo={0.985} haptic="none" style={styles.addressCard}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <View style={styles.addressCopy}>
                <AppText variant="captionStrong">Delivering to</AppText>
                <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
                  {defaultAddress
                    ? `${defaultAddress.label} · ${defaultAddress.address_line1}, ${defaultAddress.city}`
                    : 'Add a delivery address to continue'}
                </AppText>
              </View>
              <AppText variant="button" color="primary">
                Change
              </AppText>
            </PressableScale>
          </View>
        }
        itemLayoutAnimation={LinearTransition.duration(220)}
      />

      <View style={styles.checkoutBar}>
        <View style={styles.checkoutTotal}>
          <AppText variant="caption" color="textTertiary">
            To pay
          </AppText>
          <AppText variant="heading3">{formatPrice(totals.total)}</AppText>
        </View>

        <Button
          label="Place order"
          onPress={handleCheckout}
          loading={isPlacing}
          icon="arrow-forward"
          iconPosition="right"
          fullWidth={false}
          style={styles.checkoutButton}
          accessibilityHint="Places the order with cash on delivery"
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
  itemSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 84 },
  deliveryCard: {
    marginHorizontal: layout.gutter,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  deliveryCardUnlocked: { backgroundColor: colors.successSoft, borderColor: 'rgba(18,160,92,0.25)' },
  deliveryCopy: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  deliveryText: { marginLeft: spacing.sm, flex: 1, fontWeight: '600' },
  track: { height: 5, borderRadius: radius.pill, backgroundColor: 'rgba(16,18,25,0.08)', overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: radius.pill },
  footerBlock: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressCopy: { flex: 1, marginHorizontal: spacing.md },
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
