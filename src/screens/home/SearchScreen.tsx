import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AppText, EmptyState, PressableScale, ProductGrid } from '../../components';
import { popularSearches } from '../../data/sections';
import { searchProducts } from '../../data/products';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { Product } from '../../types';
import { pluralize } from '../../utils/format';
import { colors, layout, radius, spacing, typography } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Search'>;

/** Chips do double duty for recent and popular terms. */
function TermChip({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.95}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`Search for ${label}`}
      style={styles.chip}
    >
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <AppText variant="bodySmall" style={styles.chipLabel}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export function SearchScreen({ navigation, route }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const debouncedQuery = useDebouncedValue(query, 160);
  const { recent, addRecent, clearRecent } = useRecentSearches();

  const results = useMemo(() => searchProducts(debouncedQuery), [debouncedQuery]);
  const hasQuery = debouncedQuery.trim().length > 0;

  const goToProduct = useCallback(
    (product: Product) => {
      addRecent(debouncedQuery);
      navigation.navigate('ProductDetails', { productId: product.id });
    },
    [addRecent, debouncedQuery, navigation],
  );

  const applyTerm = useCallback(
    (term: string) => {
      setQuery(term);
      addRecent(term);
      inputRef.current?.focus();
    },
    [addRecent],
  );

  const handleSubmit = useCallback(() => addRecent(query), [addRecent, query]);

  const suggestions = (
    <Animated.View entering={FadeIn.duration(220)} style={styles.suggestions}>
      {recent.length > 0 ? (
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <AppText variant="heading3">Recent searches</AppText>
            <Pressable
              onPress={clearRecent}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear recent searches"
            >
              <AppText variant="captionStrong" color="primary">
                Clear
              </AppText>
            </Pressable>
          </View>
          <View style={styles.chipWrap}>
            {recent.map((term) => (
              <TermChip
                key={term}
                label={term}
                icon="time-outline"
                onPress={() => applyTerm(term)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <AppText variant="heading3">Popular right now</AppText>
        </View>
        <View style={styles.chipWrap}>
          {popularSearches.map((term) => (
            <TermChip
              key={term}
              label={term}
              icon="trending-up-outline"
              onPress={() => applyTerm(term)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.searchRow}>
        <PressableScale
          onPress={() => navigation.goBack()}
          scaleTo={0.9}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>

        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="Search for groceries and essentials"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.primary}
            style={styles.input}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search products"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!hasQuery ? (
        suggestions
      ) : results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title={`No results for "${debouncedQuery.trim()}"`}
          message="Check the spelling, or try a broader term like “milk” or “snacks”."
          actionLabel="Clear search"
          onActionPress={() => setQuery('')}
        />
      ) : (
        <Animated.View entering={FadeInDown.duration(240)} style={styles.results}>
          <AppText variant="bodySmall" color="textSecondary" style={styles.resultCount}>
            {pluralize(results.length, 'result')} for “{debouncedQuery.trim()}”
          </AppText>
          <ProductGrid products={results} onProductPress={goToProduct} />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginLeft: -spacing.sm,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    marginHorizontal: spacing.md,
    paddingVertical: 0,
  },
  suggestions: { paddingTop: spacing.xxl },
  block: { marginBottom: spacing.xxl },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.lg,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.gutter,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLabel: { marginLeft: spacing.sm, fontWeight: '500' },
  results: { flex: 1 },
  resultCount: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
