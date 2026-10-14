import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppText, CartBadge } from '../components';
import { useCart } from '../context/CartContext';
import { colors, radius, shadows, spacing } from '../theme';
import type { MainTabParamList } from './types';

type TabName = keyof MainTabParamList;

const ICONS: Record<TabName, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Categories: { active: 'grid', inactive: 'grid-outline' },
  Cart: { active: 'cart', inactive: 'cart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

interface TabItemProps {
  name: TabName;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badgeCount: number;
}

function TabItem({ name, label, isFocused, onPress, onLongPress, badgeCount }: TabItemProps) {
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, { duration: 180, easing: Easing.out(Easing.quad) });
  }, [isFocused, focus]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focus.value, [0, 1], [1, 1.08]) },
      { translateY: interpolate(focus.value, [0, 1], [0, -1]) },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scaleX: interpolate(focus.value, [0, 1], [0.3, 1]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0.75, { duration: 160 }),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={
        name === 'Cart' && badgeCount > 0 ? `${label}, ${badgeCount} items` : label
      }
      style={styles.tab}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons
          name={isFocused ? ICONS[name].active : ICONS[name].inactive}
          size={23}
          color={isFocused ? colors.primary : colors.textTertiary}
        />
        {name === 'Cart' ? <CartBadge count={badgeCount} /> : null}
      </Animated.View>

      <Animated.View style={labelStyle}>
        <AppText
          variant="caption"
          style={[styles.label, { color: isFocused ? colors.primary : colors.textTertiary }]}
        >
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Custom tab bar.
 *
 * Replaces the default so the active state can animate (icon lift, colour, top indicator)
 * and so the cart badge can live inside the icon rather than floating over it.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { totals } = useCart();

  return (
    <View
      style={[
        styles.bar,
        // Devices without a home indicator still need breathing room under the labels.
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const name = route.name as TabName;
        const label = (options.title ?? route.name) as string;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name as never);
          }
        };

        const onLongPress = () =>
          navigation.emit({ type: 'tabLongPress', target: route.key });

        return (
          <TabItem
            key={route.key}
            name={name}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            badgeCount={totals.itemCount}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    ...shadows.tabBar,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Clears the active indicator pinned to the top of the tab.
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    minHeight: 54,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  label: { fontWeight: '600' },
});
