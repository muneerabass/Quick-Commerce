import React, { useCallback } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AppText, Button, DeliveryOrderCard, EmptyState } from '../../components';
import { useDelivery } from '../../context/DeliveryContext';
import { colors, layout, spacing } from '../../theme';
import type { DeliveryStackParamList, DeliveryTabParamList } from '../../navigation/types';
import { DeliveryHeader } from './DeliveryHeader';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<DeliveryTabParamList, 'Active'>,
  NativeStackNavigationProp<DeliveryStackParamList>
>;

export function DeliveryActiveScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { active, isHydrated, isRefreshing, refreshAll, complete } = useDelivery();

  const handleComplete = useCallback(
    (orderId: string) => {
      Alert.alert('Mark delivered?', 'This also marks the cash-on-delivery payment as collected.', [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Delivered',
          onPress: async () => {
            const result = await complete(orderId);
            if (!result.ok) Alert.alert('Could not complete', result.message ?? 'Please try again.');
          },
        },
      ]);
    },
    [complete],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <DeliveryHeader title="ACTIVE DELIVERY" />

      <FlatList
        data={active}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} tintColor={colors.primary} />}
        ListEmptyComponent={
          isHydrated ? (
            <EmptyState
              emoji="🛵"
              title="No active delivery"
              message="Accept an order from the Available tab to start."
            />
          ) : null
        }
        renderItem={({ item, index }) => (
          <DeliveryOrderCard
            order={item}
            index={index}
            onPress={() => navigation.navigate('DeliveryOrderDetails', { orderId: item.id })}
            footer={
              <View style={styles.actions}>
                <Button
                  label="Details & navigate"
                  variant="secondary"
                  size="sm"
                  icon="navigate-outline"
                  onPress={() => navigation.navigate('DeliveryOrderDetails', { orderId: item.id })}
                  style={styles.action}
                />
                <Button
                  label="Mark delivered"
                  size="sm"
                  icon="checkmark-done"
                  onPress={() => handleComplete(item.id)}
                  style={styles.action}
                />
              </View>
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: layout.gutter, paddingTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
