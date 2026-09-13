import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, CategoryCard, EmptyState, FloatingCartBar } from '../../components';
import { categories } from '../../data/categories';
import { Category } from '../../types';
import { colors, layout, radius, spacing, typography } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

export function CategoriesScreen() {
  const navigation = useNavigation<Navigation>();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [filter]);

  const goToCategory = useCallback(
    (category: Category) => navigation.navigate('CategoryProducts', { categoryId: category.id }),
    [navigation],
  );

  const goToCart = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Cart' }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Category; index: number }) => (
      // Staggered entrance, capped so later rows are not left waiting.
      <Animated.View entering={FadeInDown.duration(280).delay(Math.min(index, 8) * 35)}>
        <CategoryCard category={item} onPress={goToCategory} variant="grid" />
      </Animated.View>
    ),
    [goToCategory],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <AppText variant="heading1">Categories</AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          Everything you need, sorted into aisles
        </AppText>
      </View>

      <View style={styles.filterWrap}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter categories"
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          style={styles.filterInput}
          autoCorrect={false}
          accessibilityLabel="Filter categories"
        />
        {filter.length > 0 ? (
          <Pressable
            onPress={() => setFilter('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear filter"
          >
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={layout.categoryGridColumns}
        key={`cols-${layout.categoryGridColumns}`}
        columnWrapperStyle={styles.column}
        ItemSeparatorComponent={RowSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            compact
            emoji="🧺"
            title="Nothing here yet"
            message={`No category matches “${filter.trim()}”. Try a different word.`}
          />
        }
      />

      <FloatingCartBar onPress={goToCart} respectSafeArea={false} />
    </SafeAreaView>
  );
}

const RowSeparator = () => <View style={{ height: spacing.xl }} />;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  subtitle: { marginTop: spacing.xs },
  filterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    marginHorizontal: layout.gutter,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
  },
  filterInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    marginHorizontal: spacing.md,
    paddingVertical: 0,
  },
  column: { gap: spacing.md, justifyContent: 'flex-start' },
  listContent: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.huge + layout.floatingBarHeight,
  },
});
