import React, { useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type Size = 'sm' | 'md' | 'lg';

interface QuantitySelectorProps {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  size?: Size;
  disabled?: boolean;
  /** Copy for the collapsed state. */
  addLabel?: string;
  style?: StyleProp<ViewStyle>;
  productName?: string;
}

const METRICS: Record<Size, { height: number; collapsed: number; expanded: number; icon: number }> =
  {
    sm: { height: 30, collapsed: 62, expanded: 88, icon: 15 },
    md: { height: 34, collapsed: 72, expanded: 100, icon: 17 },
    lg: { height: 46, collapsed: 132, expanded: 132, icon: 20 },
  };

/** Settles quickly with a barely-perceptible overshoot — the width change should feel mechanical. */
const WIDTH_SPRING = { damping: 20, stiffness: 260, mass: 0.6 } as const;

/**
 * The add-to-cart control.
 *
 * Collapsed it is an outlined "ADD" pill; once the item is in the cart it widens into a
 * filled stepper. The width springs, the fill cross-fades, and the count slides — three
 * cheap cues that together make adding an item feel physical.
 */
export const QuantitySelector = React.memo(function QuantitySelector({
  quantity,
  onAdd,
  onRemove,
  size = 'sm',
  disabled = false,
  addLabel = 'ADD',
  style,
  productName,
}: QuantitySelectorProps) {
  const metrics = METRICS[size];
  const isActive = quantity > 0;

  // Drives width, fill colour and content opacity from a single 0→1 value.
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, WIDTH_SPRING);
  }, [isActive, progress]);

  const width = useDerivedValue(() =>
    metrics.collapsed + (metrics.expanded - metrics.collapsed) * progress.value,
  );

  const containerStyle = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.background, colors.primary],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.primaryBorder, colors.primary],
    ),
  }));

  const addStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 0 : 1, { duration: 120 }),
  }));

  const stepperStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 1 : 0, { duration: 140 }),
  }));

  const handleAdd = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd();
  };

  const handleRemove = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove();
  };

  if (disabled) {
    return (
      <View
        style={[
          styles.container,
          styles.disabled,
          { height: metrics.height, width: metrics.collapsed },
          style,
        ]}
      >
        <AppText variant="captionStrong" color="textTertiary">
          Sold out
        </AppText>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { height: metrics.height }, containerStyle, style]}>
      {/* Collapsed: the whole pill is the "add" target. */}
      {!isActive ? (
        <Pressable
          onPress={handleAdd}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={productName ? `Add ${productName} to cart` : 'Add to cart'}
        >
          <Animated.View style={[styles.center, StyleSheet.absoluteFill, addStyle]}>
            <AppText
              variant={size === 'lg' ? 'button' : 'captionStrong'}
              style={styles.addLabel}
            >
              {addLabel}
            </AppText>
          </Animated.View>
        </Pressable>
      ) : (
        <Animated.View style={[styles.stepper, stepperStyle]}>
          <Pressable
            onPress={handleRemove}
            hitSlop={8}
            style={styles.stepButton}
            accessibilityRole="button"
            accessibilityLabel={productName ? `Remove one ${productName}` : 'Decrease quantity'}
          >
            <Ionicons
              name={quantity === 1 ? 'trash-outline' : 'remove'}
              size={metrics.icon}
              color={colors.textInverse}
            />
          </Pressable>

          {/* Re-keyed so each new count animates in rather than swapping instantly. */}
          <View style={styles.countSlot} accessibilityLabel={`Quantity ${quantity}`}>
            <Animated.View key={quantity} entering={FadeIn.duration(140)} exiting={FadeOut.duration(90)}>
              <AppText
                variant={size === 'lg' ? 'button' : 'captionStrong'}
                style={styles.count}
              >
                {quantity}
              </AppText>
            </Animated.View>
          </View>

          <Pressable
            onPress={handleAdd}
            hitSlop={8}
            style={styles.stepButton}
            accessibilityRole="button"
            accessibilityLabel={productName ? `Add one more ${productName}` : 'Increase quantity'}
          >
            <Ionicons name="add" size={metrics.icon} color={colors.textInverse} />
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sm,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  addLabel: { color: colors.primary, letterSpacing: 0.4 },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  stepButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  countSlot: { minWidth: 18, alignItems: 'center', justifyContent: 'center' },
  count: { color: colors.textInverse },
  disabled: {
    backgroundColor: colors.canvas,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
