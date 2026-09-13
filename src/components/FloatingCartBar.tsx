import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { useCart } from '../context/CartContext';
import { formatPrice, pluralize } from '../utils/format';
import { colors, layout, radius, shadows, spacing } from '../theme';

interface FloatingCartBarProps {
  onPress: () => void;
  /** Screens inside the tab navigator sit above the tab bar and need no bottom inset. */
  respectSafeArea?: boolean;
}

/**
 * Persistent cart affordance on browse screens. Slides in the moment the cart stops being
 * empty, which is what lets the product grid stay free of a permanent footer.
 */
export const FloatingCartBar = React.memo(function FloatingCartBar({
  onPress,
  respectSafeArea = true,
}: FloatingCartBarProps) {
  const insets = useSafeAreaInsets();
  const { totals } = useCart();

  if (totals.itemCount === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(260).springify().damping(20)}
      exiting={FadeOutDown.duration(180)}
      style={[
        styles.wrap,
        { paddingBottom: respectSafeArea ? Math.max(insets.bottom, spacing.lg) : spacing.lg },
      ]}
      pointerEvents="box-none"
    >
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        haptic="medium"
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${pluralize(totals.itemCount, 'item')}, ${formatPrice(totals.total)}`}
        style={styles.bar}
      >
        <View style={styles.leading}>
          <View style={styles.countBubble}>
            <AppText variant="captionStrong" color="textInverse">
              {totals.itemCount}
            </AppText>
          </View>
          <View style={styles.copy}>
            <AppText variant="captionStrong" style={styles.itemsLabel}>
              {pluralize(totals.itemCount, 'item')}
            </AppText>
            <AppText variant="bodyStrong" color="textInverse">
              {formatPrice(totals.total)}
            </AppText>
          </View>
        </View>

        <View style={styles.trailing}>
          <AppText variant="button" color="textInverse">
            View cart
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
        </View>
      </PressableScale>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.gutter,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    ...shadows.floating,
  },
  leading: { flexDirection: 'row', alignItems: 'center' },
  countBubble: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { marginLeft: spacing.md },
  itemsLabel: { color: 'rgba(255,255,255,0.8)' },
  trailing: { flexDirection: 'row', alignItems: 'center' },
});
