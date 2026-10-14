import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, DeliveryOrderCard, EmptyState } from '../../components';
import { useDelivery } from '../../context/DeliveryContext';
import { colors, layout, radius, spacing } from '../../theme';
import type { DeliveryStackParamList, DeliveryTabParamList } from '../../navigation/types';
import { DeliveryHeader } from './DeliveryHeader';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<DeliveryTabParamList, 'History'>,
  NativeStackNavigationProp<DeliveryStackParamList>
>;

export function DeliveryHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { history, isHydrated, isRefreshing, refreshAll } = useDelivery();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <DeliveryHeader title="DELIVERY HISTORY" />

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} tintColor={colors.primary} />}
        ListEmptyComponent={
          isHydrated ? (
            <EmptyState emoji="✅" title="No deliveries yet" message="Completed orders will show up here." />
          ) : null
        }
        renderItem={({ item, index }) => (
          <DeliveryOrderCard
            order={item}
            index={index}
            onPress={() => navigation.navigate('DeliveryOrderDetails', { orderId: item.id })}
            footer={
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <AppText variant="caption" color="success" style={styles.doneText}>
                  Delivered · payment collected
                </AppText>
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
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.successSoft, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  doneText: { marginLeft: 2 },
});
