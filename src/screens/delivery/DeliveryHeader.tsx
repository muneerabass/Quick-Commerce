import React, { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, PressableScale } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { colors, layout, radius, spacing } from '../../theme';

interface DeliveryHeaderProps {
  title: string;
  subtitle?: string;
}

export function DeliveryHeader({ title, subtitle }: DeliveryHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert('Log out?', 'You can sign back in any time.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  }, [logout]);

  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <AppText variant="caption" color="textTertiary">
          {title}
        </AppText>
        <AppText variant="heading2" numberOfLines={1}>
          {subtitle ?? user?.name ?? user?.phone ?? 'Delivery partner'}
        </AppText>
      </View>
      <PressableScale onPress={handleLogout} scaleTo={0.94} haptic="none" style={styles.logoutBtn} accessibilityLabel="Log out">
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
  },
  copy: { flex: 1, paddingRight: spacing.md },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
