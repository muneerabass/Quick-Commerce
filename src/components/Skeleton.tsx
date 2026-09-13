import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../theme';

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block. A gentle opacity pulse reads as "loading" without the
 * distraction of a sweeping shimmer.
 */
export function Skeleton({ width, height, borderRadius = radius.sm, style }: SkeletonProps) {
  const progress = useSharedValue(0.45);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius }, styles.block, animatedStyle, style]}
    />
  );
}

/** Groups skeleton blocks with consistent spacing. */
export function SkeletonGroup({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton },
});
