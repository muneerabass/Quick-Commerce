import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

interface CartBadgeProps {
  count: number;
}

const POP_SPRING = { damping: 12, stiffness: 340, mass: 0.5 } as const;

/**
 * Count bubble on the cart tab. Pops on every change so an add registers even when the
 * user is looking at the product, not the tab bar.
 */
export const CartBadge = React.memo(function CartBadge({ count }: CartBadgeProps) {
  const scale = useSharedValue(count > 0 ? 1 : 0);
  const previous = useRef(count);

  useEffect(() => {
    if (count === 0) {
      scale.value = withTiming(0, { duration: 140 });
    } else if (previous.current === 0) {
      scale.value = withSpring(1, POP_SPRING);
    } else if (previous.current !== count) {
      // Already visible: a quick overshoot reads as "that registered".
      scale.value = withSequence(withSpring(1.22, POP_SPRING), withSpring(1, POP_SPRING));
    }
    previous.current = count;
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value === 0 ? 0 : 1,
  }));

  if (count === 0 && previous.current === 0) return null;

  return (
    <Animated.View
      style={[styles.badge, animatedStyle]}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      <View style={styles.inner}>
        <AppText variant="caption" style={styles.text}>
          {count > 99 ? '99+' : count}
        </AppText>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -11,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { paddingHorizontal: 3 },
  text: { color: colors.textInverse, fontSize: 10, lineHeight: 13, fontWeight: '800' },
});
