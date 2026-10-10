import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, Button, EmptyState, PressableScale, StatusPill } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { Store } from '../../types';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

export function AdminStoresScreen() {
  const navigation = useNavigation<Navigation>();
  const { stores, activeStore, selectStore } = useAdmin();

  const renderItem = useCallback(
    ({ item }: { item: Store }) => (
      <View style={styles.row}>
        <View style={styles.copy}>
          <AppText variant="bodyStrong">{item.name}</AppText>
          <AppText variant="caption" color="textTertiary" numberOfLines={2}>
            {item.address}
          </AppText>
          {item.latitude != null && item.longitude != null ? (
            <AppText variant="caption" color="textTertiary">
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </AppText>
          ) : null}
        </View>
        <View style={styles.rowActions}>
          <StatusPill status={item.is_active ? 'active' : 'inactive'} />
          <Button
            label={activeStore?.id === item.id ? 'Active' : 'Select'}
            variant={activeStore?.id === item.id ? 'ghost' : 'secondary'}
            size="sm"
            onPress={() => selectStore(item.id)}
            disabled={activeStore?.id === item.id}
          />
          <Button
            label="Edit"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('StoreForm', { storeId: item.id })}
          />
        </View>
      </View>
    ),
    [activeStore?.id, navigation, selectStore],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AdminScreenHeader title="Stores" subtitle="Create and manage physical outlets." />
      </View>

      <Button
        label="Add new store"
        onPress={() => navigation.navigate('StoreForm', undefined)}
        icon="add"
        iconPosition="left"
        style={styles.addButton}
      />

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState emoji="🏬" title="No stores" message="Create the first store to start selling." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', paddingHorizontal: layout.gutter, paddingTop: spacing.lg, gap: spacing.md },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: { marginHorizontal: layout.gutter, marginTop: spacing.md },
  listContent: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg, paddingBottom: spacing.huge },
  row: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  copy: { marginBottom: spacing.md },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
});
