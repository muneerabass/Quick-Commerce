import React, { useState } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { useAdmin } from '../context/AdminContext';
import { colors, radius, shadows, spacing } from '../theme';

interface StoreSwitcherProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Primary way to change the admin's active store. Showing it on Dashboard,
 * Inventory and Catalog means switching store is always one tap away — and
 * because products/stock are per-store, the lists below swap with it.
 */
export function StoreSwitcher({ style }: StoreSwitcherProps) {
  const { stores, activeStore, selectStore } = useAdmin();
  const [open, setOpen] = useState(false);

  const pick = (storeId: string) => {
    void Haptics.selectionAsync();
    selectStore(storeId);
    setOpen(false);
  };

  return (
    <>
      <PressableScale
        onPress={() => stores.length > 0 && setOpen(true)}
        scaleTo={0.985}
        haptic="none"
        style={[styles.card, style]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.copy}>
          <AppText variant="captionStrong" color="textSecondary">
            ACTIVE STORE
          </AppText>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {activeStore?.name ?? (stores.length === 0 ? 'No stores yet — create one' : 'Pick a store')}
          </AppText>
        </View>
        {stores.length > 0 ? (
          <View style={styles.changePill}>
            <AppText variant="buttonSmall" color="primary">
              Change
            </AppText>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </View>
        ) : null}
      </PressableScale>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdropPress} onPress={() => setOpen(false)}>
          <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={styles.backdrop} />
        </Pressable>
        <Animated.View
          entering={SlideInDown.duration(220)}
          exiting={SlideOutDown.duration(160)}
          style={styles.sheet}
        >
          <View style={styles.grabber} />
          <AppText variant="heading3" style={styles.sheetTitle}>
            Switch store
          </AppText>
          {stores.map((store) => {
            const isActive = store.id === activeStore?.id;
            return (
              <PressableScale
                key={store.id}
                onPress={() => pick(store.id)}
                scaleTo={0.98}
                haptic="none"
                style={[styles.row, isActive && styles.rowActive]}
              >
                <View style={styles.rowCopy}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {store.name}
                  </AppText>
                  <AppText variant="caption" color="textTertiary" numberOfLines={1}>
                    {store.address}
                  </AppText>
                </View>
                {isActive ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={colors.borderStrong} />
                )}
              </PressableScale>
            );
          })}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  changePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  backdropPress: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { flex: 1, backgroundColor: 'rgba(16,18,25,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    ...shadows.floating,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  sheetTitle: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.primarySoft },
  rowCopy: { flex: 1 },
});
