import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, EmptyState, PressableScale } from '../../components';
import * as addressService from '../../services/addressService';
import { Address } from '../../types';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;
type ScreenRoute = RouteProp<MainStackParamList, 'AddressList'>;

export function AddressListScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<ScreenRoute>();
  const selectMode = params?.selectMode ?? false;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setAddresses(await addressService.listAddresses());
    } catch (error) {
      Alert.alert('Could not load addresses', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      setIsLoading(true);
      void refresh();
    });
    return unsub;
  }, [navigation, refresh]);

  const handleSetDefault = useCallback(
    async (address: Address): Promise<boolean> => {
      setIsMutating(true);
      try {
        await addressService.setDefaultAddress(address.id);
        await refresh();
        return true;
      } catch (error) {
        Alert.alert('Could not set default', error instanceof Error ? error.message : 'Try again.');
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [refresh],
  );

  const handleDelete = useCallback(
    (address: Address) => {
      Alert.alert('Remove address?', `${address.label} — ${address.address_line1}`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsMutating(true);
            try {
              await addressService.deleteAddress(address.id);
              await refresh();
            } catch (error) {
              Alert.alert('Could not remove', error instanceof Error ? error.message : 'Try again.');
            } finally {
              setIsMutating(false);
            }
          },
        },
      ]);
    },
    [refresh],
  );

  const handlePick = useCallback(
    async (address: Address) => {
      if (selectMode) {
        if (await handleSetDefault(address)) navigation.goBack();
      } else {
        navigation.navigate('AddressForm', { addressId: address.id });
      }
    },
    [handleSetDefault, navigation, selectMode],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AppText variant="heading2" style={styles.title}>
          {selectMode ? 'Choose delivery address' : 'My addresses'}
        </AppText>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              emoji="📍"
              title="No saved addresses"
              message="Add your first delivery address to get started."
              actionLabel="Add address"
              onActionPress={() => navigation.navigate('AddressForm', { selectMode })}
            />
          }
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => handlePick(item)}
              scaleTo={0.985}
              haptic="none"
              style={[styles.card, item.is_default && styles.cardDefault]}
            >
              <View style={styles.cardHeader}>
                <AppText variant="bodyStrong">{item.label}</AppText>
                {item.is_default ? (
                  <View style={styles.defaultBadge}>
                    <AppText variant="caption" color="primary">
                      Default
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
                {item.recipient_name} · {item.phone}
              </AppText>
              <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
                {[item.address_line1, item.address_line2, item.landmark].filter(Boolean).join(', ')}
              </AppText>
              <AppText variant="bodySmall" color="textSecondary" style={styles.lines}>
                {item.city}, {item.state} · {item.pincode}
              </AppText>
              <View style={styles.cardActions}>
                {!item.is_default ? (
                  <Button
                    label="Set default"
                    variant="secondary"
                    onPress={() => handleSetDefault(item)}
                    loading={isMutating}
                    style={styles.actionButton}
                  />
                ) : null}
                <Button
                  label="Edit"
                  variant="secondary"
                  onPress={() => navigation.navigate('AddressForm', { addressId: item.id })}
                  style={styles.actionButton}
                />
                <Button
                  label="Remove"
                  variant="secondary"
                  onPress={() => handleDelete(item)}
                  style={styles.actionButton}
                />
              </View>
            </PressableScale>
          )}
        />
      )}

      <View style={styles.footer}>
        <Button label="Add new address" onPress={() => navigation.navigate('AddressForm', { selectMode })} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDefault: { borderColor: colors.primary },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  lines: { marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  actionButton: { flex: 1, minWidth: 100 },
  footer: {
    padding: layout.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
