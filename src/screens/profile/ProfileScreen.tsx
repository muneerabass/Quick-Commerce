import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, PressableScale } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { colors, layout, radius, spacing } from '../../theme';

interface RowItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption?: string;
  /** Phase 2 destinations. Until then each row explains what is coming. */
  comingSoon?: string;
}

interface Section {
  title: string;
  items: RowItem[];
}

const SECTIONS: Section[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'My profile', caption: 'Name, phone and email', comingSoon: 'Profile editing' },
      { icon: 'location-outline', label: 'My addresses', caption: 'Saved delivery locations', comingSoon: 'Address book' },
      { icon: 'heart-outline', label: 'Saved items', caption: 'Products you bookmarked', comingSoon: 'Wishlists' },
    ],
  },
  {
    title: 'Orders',
    items: [
      { icon: 'receipt-outline', label: 'My orders', caption: 'Track and reorder', comingSoon: 'Order history' },
      { icon: 'pricetags-outline', label: 'Offers & coupons', comingSoon: 'Coupons' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & support', comingSoon: 'Help centre' },
      { icon: 'chatbubble-ellipses-outline', label: 'Contact us', comingSoon: 'Support chat' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', comingSoon: 'Notification settings' },
      { icon: 'shield-checkmark-outline', label: 'Privacy policy', comingSoon: 'Privacy policy' },
      { icon: 'document-text-outline', label: 'Terms & conditions', comingSoon: 'Terms' },
    ],
  },
];

function initialsFor(name?: string | null): string {
  if (!name) return 'ZU';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'ZU';
}

function SettingsRow({ item, onPress }: { item: RowItem; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={styles.row}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={item.icon} size={19} color={colors.primary} />
      </View>

      <View style={styles.rowCopy}>
        <AppText variant="bodyStrong">{item.label}</AppText>
        {item.caption ? (
          <AppText variant="caption" color="textTertiary" style={styles.rowCaption}>
            {item.caption}
          </AppText>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
    </PressableScale>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { totals, clearCart } = useCart();

  const handleRowPress = useCallback((item: RowItem) => {
    Alert.alert(
      item.label,
      `${item.comingSoon ?? item.label} arrives in the next release.`,
      [{ text: 'Got it' }],
    );
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Log out of Zipp?', 'You can sign back in with the same number any time.', [
      { text: 'Stay logged in', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          // Clearing the cart on logout keeps the next account's session clean.
          clearCart();
          void logout();
        },
      },
    ]);
  }, [clearCart, logout]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.huge }]}
      >
        <AppText variant="heading1" style={styles.pageTitle}>
          Account
        </AppText>

        <Animated.View entering={FadeInDown.duration(300)} style={styles.identityCard}>
          <View style={styles.avatar}>
            <AppText variant="heading2" color="textInverse">
              {initialsFor(user?.name)}
            </AppText>
          </View>

          <View style={styles.identityCopy}>
            <AppText variant="heading3" numberOfLines={1}>
              {user?.name ?? 'Zipp shopper'}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              +91 {user?.phone ?? '—'}
            </AppText>
            {user?.email ? (
              <AppText variant="caption" color="textTertiary" numberOfLines={1}>
                {user.email}
              </AppText>
            ) : null}
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <AppText variant="heading3">{totals.itemCount}</AppText>
            <AppText variant="caption" color="textTertiary">
              In cart
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <AppText variant="heading3">0</AppText>
            <AppText variant="caption" color="textTertiary">
              Orders
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <AppText variant="heading3">₹0</AppText>
            <AppText variant="caption" color="textTertiary">
              Saved
            </AppText>
          </View>
        </View>

        {SECTIONS.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.duration(280).delay(60 + sectionIndex * 50)}
            style={styles.section}
          >
            <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
              {section.title}
            </AppText>

            <View style={styles.card}>
              {section.items.map((item, index) => (
                <View key={item.label}>
                  <SettingsRow item={item} onPress={() => handleRowPress(item)} />
                  {index < section.items.length - 1 ? <View style={styles.rowDivider} /> : null}
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        <PressableScale
          onPress={handleLogout}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={19} color={colors.error} />
          <AppText variant="button" color="error" style={styles.logoutLabel}>
            Log out
          </AppText>
        </PressableScale>

        <AppText variant="caption" color="textTertiary" center style={styles.version}>
          Zipp · Version 1.0.0 (Phase 1)
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg },
  pageTitle: { marginBottom: spacing.xl },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCopy: { flex: 1, marginLeft: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  section: { marginTop: spacing.xxl },
  sectionTitle: { marginBottom: spacing.md, marginLeft: spacing.xs },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, marginHorizontal: spacing.md },
  rowCaption: { marginTop: 1 },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 66 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    marginTop: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.errorSoft,
    backgroundColor: colors.errorSoft,
  },
  logoutLabel: { marginLeft: spacing.sm },
  version: { marginTop: spacing.xl },
});
