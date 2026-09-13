import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, radius, shadows, spacing } from '../theme';

interface SearchBarProps {
  /** When set, the bar is a button that navigates to the search screen. */
  onPress?: () => void;
  placeholder?: string;
  /** Placeholders that cycle, so the bar suggests what is actually searchable. */
  rotatingHints?: string[];
  style?: StyleProp<ViewStyle>;
}

const ROTATE_MS = 2600;

/**
 * The read-only search affordance used on Home. Tapping it pushes the real Search screen,
 * which keeps the home list from having to host a live text input.
 */
export const SearchBar = React.memo(function SearchBar({
  onPress,
  placeholder = 'Search for groceries and essentials',
  rotatingHints,
  style,
}: SearchBarProps) {
  const [hintIndex, setHintIndex] = useState(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const hints = useMemo(() => rotatingHints ?? [], [rotatingHints]);

  useEffect(() => {
    if (hints.length < 2) return;

    timer.current = setInterval(() => {
      // Slide the current hint up and out, then bring the next one in from below.
      opacity.value = withSequence(
        withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
      );
      translateY.value = withSequence(
        withTiming(-8, { duration: 180 }),
        withTiming(8, { duration: 0 }),
        withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }),
      );
      setTimeout(() => setHintIndex((i) => (i + 1) % hints.length), 190);
    }, ROTATE_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [hints.length, opacity, translateY]);

  const hintStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const label = hints.length > 0 ? `Search "${hints[hintIndex]}"` : placeholder;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel="Search for groceries and essentials"
      style={({ pressed }) => [styles.bar, pressed && styles.pressed, style]}
    >
      <Ionicons name="search" size={19} color={colors.text} />

      <View style={styles.hintWrap}>
        <Animated.View style={hintStyle}>
          <AppText variant="body" color="textSecondary" numberOfLines={1}>
            {label}
          </AppText>
        </Animated.View>
      </View>

      <View style={styles.divider} />
      <Ionicons name="mic-outline" size={19} color={colors.textSecondary} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...Platform.select({ ios: shadows.card, android: shadows.soft }),
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  hintWrap: { flex: 1, marginLeft: spacing.md, overflow: 'hidden' },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
