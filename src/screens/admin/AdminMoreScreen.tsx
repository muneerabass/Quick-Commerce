import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, PressableScale } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadows, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

export function AdminMoreScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { activeStore } = useAdmin();

  const handleLogout = useCallback(() => {
    Alert.alert('Log out?', 'You can sign back in with the admin number any time.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false}>
        <AdminScreenHeader title="Settings" subtitle={activeStore ? `Signed in as ${user?.name ?? 'admin'} · ${activeStore.name}` : `Signed in as ${user?.name ?? 'admin'}`} />
        <View style={styles.card}>
          <PressableScale style={styles.row} onPress={() => navigation.navigate('Stores')} haptic="none">
            <Ionicons name="storefront-outline" size={20} color={colors.text} />
            <AppText variant="bodyStrong" style={styles.rowLabel}>
              Stores
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
          <View style={styles.divider} />
          <PressableScale style={styles.row} onPress={() => navigation.navigate('Categories')} haptic="none">
            <Ionicons name="grid-outline" size={20} color={colors.text} />
            <AppText variant="bodyStrong" style={styles.rowLabel}>
              Categories
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
          <View style={styles.divider} />
          <PressableScale style={styles.row} onPress={() => navigation.navigate('DeliveryUsers')} haptic="none">
            <Ionicons name="bicycle-outline" size={20} color={colors.text} />
            <AppText variant="bodyStrong" style={styles.rowLabel}>
              Delivery riders
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>
        </View>

        <PressableScale onPress={handleLogout} style={styles.logoutButton} haptic="none">
          <Ionicons name="log-out-outline" size={19} color={colors.error} />
          <AppText variant="button" color="error" style={styles.logoutLabel}>
            Log out
          </AppText>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg },
  card: { marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, ...shadows.soft, overflow: 'hidden' },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  rowLabel: { flex: 1, marginLeft: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.xxxl },
  logoutButton: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  logoutLabel: { marginLeft: spacing.sm },
});
