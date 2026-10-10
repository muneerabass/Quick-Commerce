import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components';
import { colors, radius, shadows, spacing } from '../theme';
import type { AdminTabParamList } from './types';

type AdminTab = keyof AdminTabParamList;

const ICONS: Record<AdminTab, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Inventory: { active: 'layers', inactive: 'layers-outline' },
  Catalog: { active: 'pricetags', inactive: 'pricetags-outline' },
  More: { active: 'menu', inactive: 'menu-outline' },
};

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const name = route.name as AdminTab;
        const focused = state.index === index;
        const label = (descriptors[route.key].options.title ?? route.name) as string;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={styles.tab}
          >
            <View style={[styles.indicator, focused ? styles.indicatorActive : null]} />
            <Ionicons name={focused ? ICONS[name].active : ICONS[name].inactive} size={22} color={focused ? colors.primary : colors.textTertiary} />
            <AppText variant="caption" color={focused ? 'primary' : 'textTertiary'} style={styles.label}>{label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.background, borderTopWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0, borderTopColor: colors.border, paddingTop: spacing.xs, paddingBottom: spacing.sm, ...shadows.tabBar },
  tab: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.md, position: 'relative' },
  indicator: { position: 'absolute', top: 0, width: 26, height: 3, borderRadius: radius.pill },
  indicatorActive: { backgroundColor: colors.primary },
  label: { marginTop: spacing.xs, fontWeight: '600' },
});
