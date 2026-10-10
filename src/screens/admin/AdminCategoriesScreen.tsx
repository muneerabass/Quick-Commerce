import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, EmptyState, PressableScale } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { colors, layout, radius, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

/**
 * Read-only categories list. Backend has no POST /admin/categories yet; this screen
 * surfaces whatever /admin/categories returns so admins can see what IDs exist.
 */
export function AdminCategoriesScreen() {
  const navigation = useNavigation<Navigation>();
  const { categories } = useAdmin();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AdminScreenHeader title="Categories" subtitle="Read-only until a categories admin API ships." />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState emoji="📂" title="No categories" message="Seed categories via the backend to see them here." />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <AppText variant="bodyStrong">{item.name}</AppText>
            <AppText variant="caption" color="textTertiary">
              {item.id.slice(0, 8)}
            </AppText>
          </View>
        )}
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
  listContent: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg, paddingBottom: spacing.huge },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
