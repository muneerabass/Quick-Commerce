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
import { AppText } from '../components';
import { useDelivery } from '../context/DeliveryContext';
import { colors, radius, shadows, spacing } from '../theme';
import type { DeliveryTabParamList } from './types';

type TabName = keyof DeliveryTabParamList;

const ICONS: Record<TabName, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Available: { active: 'cube', inactive: 'cube-outline' },
  Active: { active: 'bicycle', inactive: 'bicycle-outline' },
  History: { active: 'checkmark-done-circle', inactive: 'checkmark-done-circle-outline' },
};

interface TabItemProps {
  name: TabName;
  label: string;
  isFocused: boolean;
  showDot: boolean;
  onPress: () => void;
}

function TabItem({ name, label, isFocused, showDot, onPress }: TabItemProps) {
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
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tab}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons
          name={isFocused ? ICONS[name].active : ICONS[name].inactive}
          size={23}
          color={isFocused ? colors.primary : colors.textTertiary}
        />
        {showDot ? <View style={styles.dot} /> : null}
      </Animated.View>
      <Animated.View style={labelStyle}>
        <AppText variant="caption" style={[styles.label, { color: isFocused ? colors.primary : colors.textTertiary }]}>
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

export function DeliveryTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { hasActiveOrder } = useDelivery();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const name = route.name as TabName;
        const label = (options.title ?? route.name) as string;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TabItem
            key={route.key}
            name={name}
            label={label}
            isFocused={isFocused}
            showDot={name === 'Active' && hasActiveOrder}
            onPress={onPress}
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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs, minHeight: 54 },
  indicator: { position: 'absolute', top: 0, width: 26, height: 3, borderRadius: radius.pill, backgroundColor: colors.primary },
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  dot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  label: { fontWeight: '600' },
});
