import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while held. Larger elements need less. */
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'none';
}

/**
 * Wraps any tappable surface with the app's standard press feedback.
 * Used everywhere instead of raw `TouchableOpacity` so the whole app responds identically.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(scaleTo, { duration: 100, easing: Easing.out(Easing.quad) });
  }, [scale, scaleTo]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
  }, [scale]);

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (event) => {
      if (haptic !== 'none') {
        void Haptics.impactAsync(
          haptic === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        );
      }
      onPress?.(event);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
}
