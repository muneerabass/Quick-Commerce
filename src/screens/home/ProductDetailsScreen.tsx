import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AppText,
  EmptyState,
  PressableScale,
  ProductImage,
  ProductSection,
  QuantitySelector,
} from '../../components';
import { useCart } from '../../context/CartContext';
import { getCategoryById } from '../../data/categories';
import { getProductById, getProductsByCategory } from '../../data/products';
import { Product } from '../../types';
import { formatCount, formatPrice } from '../../utils/format';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetails'>;

const HIGHLIGHTS = [
  { icon: 'flash' as const, title: '10 min delivery', caption: 'From the store nearest you' },
  { icon: 'leaf' as const, title: 'Quality checked', caption: 'Sorted and packed same day' },
  { icon: 'refresh' as const, title: 'Easy returns', caption: 'Report an issue within 24 hrs' },
];

export function ProductDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getQuantity, addItem, decrementItem, totals } = useCart();

  const product = getProductById(route.params.productId);

  const related = useMemo(() => {
    if (!product) return [];
    return getProductsByCategory(product.categoryId)
      .filter((p) => p.id !== product.id)
      .slice(0, 10);
  }, [product]);

  const goToProduct = useCallback(
    (next: Product) => navigation.push('ProductDetails', { productId: next.id }),
    [navigation],
  );

  const goToCart = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Cart' }),
    [navigation],
  );

  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState
          emoji="🫥"
          title="Product not found"
          message="This item may no longer be available in your area."
          actionLabel="Go back"
          onActionPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const quantity = getQuantity(product.id);
  const tint = getCategoryById(product.categoryId)?.tint ?? colors.surfaceMuted;
  const categoryName = getCategoryById(product.categoryId)?.name ?? 'Groceries';

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Floating back control keeps the hero image edge-to-edge. */}
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
        <PressableScale
          onPress={() => navigation.goBack()}
          scaleTo={0.9}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.circleButton}
        >
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </PressableScale>

        <PressableScale
          onPress={goToCart}
          scaleTo={0.9}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel={`Open cart, ${totals.itemCount} items`}
          style={styles.circleButton}
        >
          <Ionicons name="cart-outline" size={21} color={colors.text} />
          {totals.itemCount > 0 ? <View style={styles.cartDot} /> : null}
        </PressableScale>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <View style={[styles.hero, { backgroundColor: tint, paddingTop: insets.top + 64 }]}>
          <ProductImage
            uri={product.image}
            emoji={product.emoji}
            size={Math.min(layout.screenWidth * 0.62, 260)}
            tint={tint}
            radiusToken="lg"
            contentFit="cover"
          />
        </View>

        <Animated.View entering={FadeInDown.duration(300)} style={styles.body}>
          <AppText variant="caption" color="primary" style={styles.category}>
            {categoryName.toUpperCase()}
          </AppText>

          <AppText variant="heading1" style={styles.name}>
            {product.name}
          </AppText>

          <AppText variant="bodySmall" color="textSecondary">
            {product.quantity}
          </AppText>

          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color={colors.textInverse} />
              <AppText variant="captionStrong" color="textInverse" style={styles.ratingText}>
                {product.rating.toFixed(1)}
              </AppText>
            </View>
            <AppText variant="caption" color="textTertiary" style={styles.ratingCount}>
              {formatCount(product.ratingCount)} ratings
            </AppText>

            <View style={styles.etaPill}>
              <Ionicons name="flash" size={11} color={colors.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={styles.etaText}>
                {product.deliveryEta}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <View style={styles.priceLine}>
                <AppText variant="heading1">{formatPrice(product.price)}</AppText>
                {product.originalPrice ? (
                  <AppText variant="body" color="textTertiary" style={styles.strike}>
                    {formatPrice(product.originalPrice)}
                  </AppText>
                ) : null}
              </View>
              <AppText variant="caption" color="textTertiary">
                Inclusive of all taxes
              </AppText>
            </View>

            {product.discount ? (
              <View style={styles.discountTag}>
                <AppText variant="captionStrong" color="textInverse">
                  {product.discount}% OFF
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <View key={item.title} style={styles.highlight}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={item.icon} size={16} color={colors.primary} />
                </View>
                <AppText variant="captionStrong" center style={styles.highlightTitle}>
                  {item.title}
                </AppText>
                <AppText variant="caption" color="textTertiary" center>
                  {item.caption}
                </AppText>
              </View>
            ))}
          </View>

          <AppText variant="heading3" style={styles.sectionTitle}>
            About this product
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.description}>
            {product.description}
          </AppText>
        </Animated.View>

        {related.length > 0 ? (
          <View style={styles.related}>
            <ProductSection
              title="You might also like"
              products={related}
              onProductPress={goToProduct}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky buy bar — the primary action stays reachable however far the user scrolls. */}
      <View style={[styles.buyBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.buyPrice}>
          <AppText variant="bodyStrong">{formatPrice(product.price)}</AppText>
          <AppText variant="caption" color="textTertiary">
            {product.quantity}
          </AppText>
        </View>

        <QuantitySelector
          quantity={quantity}
          onAdd={() => addItem(product)}
          onRemove={() => decrementItem(product.id)}
          size="lg"
          disabled={!product.inStock}
          addLabel="Add to cart"
          productName={product.name}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cartDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  content: { flexGrow: 1 },
  hero: { alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: layout.gutter, paddingTop: spacing.xl },
  category: { letterSpacing: 1, fontWeight: '800' },
  name: { marginTop: spacing.sm, marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  ratingText: { marginLeft: 3 },
  ratingCount: { marginLeft: spacing.sm },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: colors.canvas,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  etaText: { marginLeft: 3, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceBlock: { flex: 1 },
  priceLine: { flexDirection: 'row', alignItems: 'baseline' },
  strike: { textDecorationLine: 'line-through', marginLeft: spacing.md },
  discountTag: {
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  highlights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xxl,
  },
  highlight: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  highlightTitle: { marginBottom: 2 },
  sectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  description: { lineHeight: 22 },
  related: { marginTop: spacing.xxxl },
  buyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    ...shadows.floating,
  },
  buyPrice: { flex: 1 },
});
