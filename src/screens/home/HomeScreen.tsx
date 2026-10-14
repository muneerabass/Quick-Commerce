import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  AppText,
  CategoryCard,
  DeliveryBanner,
  ErrorState,
  HomeSkeleton,
  LocationHeader,
  ProductSection,
  SearchBar,
  SectionHeader,
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import * as addressService from '../../services/addressService';
import { Address, CategoryRef, Product } from '../../types';
import { lookForCategory } from '../../data/categoryLooks';
import { colors, gradients, layout, spacing } from '../../theme';
import { API_BASE_URL } from '../../config/env';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

const SEARCH_HINTS = ['milk', 'bananas', 'bread', 'eggs', 'cold drinks', 'juices'];

function initialsFor(name?: string | null): string {
  if (!name) return 'ZU';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'ZU';
}

interface Rail {
  id: string;
  title: string;
  categoryId: string | null;
  categoryName: string;
  products: Product[];
}

/** Group products by category_id to render as rails + categories list. */
function buildRails(products: Product[]): { rails: Rail[]; categories: CategoryRef[] } {
  const byCategory = new Map<string | null, Product[]>();
  products.forEach((product) => {
    const key = product.category_id ?? null;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(product);
  });
  const rails: Rail[] = [];
  const categories: CategoryRef[] = [];
  for (const [categoryId, items] of byCategory.entries()) {
    const name = items[0]?.description && categoryId
      ? // Backend doesn't surface category name — infer from the look lookup if we can
        humanizeCategoryId(categoryId, items)
      : categoryId
        ? humanizeCategoryId(categoryId, items)
        : 'Everything else';
    const look = lookForCategory(name);
    categories.push({ id: categoryId, name, emoji: look.emoji, tint: look.tint, productCount: items.length });
    rails.push({ id: categoryId ?? 'none', title: name, categoryId, categoryName: name, products: items.slice(0, 10) });
  }
  return { rails, categories };
}

// Backend doesn't expose category names via any endpoint; use the first few product
// names as a human-readable fallback until a /categories endpoint exists.
function humanizeCategoryId(categoryId: string, items: Product[]): string {
  // Prefer a canonical name if the first product's name hints at it.
  if (items.length === 0) return 'Category';
  // Use a best-effort "category" if we don't know anything — this falls back to
  // showing the group as a short id-tag.
  return `Category · ${categoryId.slice(0, 6)}`;
}

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isLoading, isRefreshing, error, products, refresh, setDeliveryAddress } = useStore();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void addressService
        .listAddresses()
        .then((addresses) => {
          if (!cancelled) {
            const addr = addresses.find((a) => a.is_default) ?? addresses[0] ?? null;
            setDefaultAddress(addr);
            setDeliveryAddress(addr);
          }
        })
        .catch(() => {
          // Address loading should never block the catalogue from rendering.
        });

      return () => {
        cancelled = true;
      };
    }, [setDeliveryAddress]),
  );

  const { rails, categories } = useMemo(() => buildRails(products), [products]);

  const goToSearch = useCallback(() => navigation.navigate('Search'), [navigation]);

  const goToProduct = useCallback(
    (product: Product) => navigation.navigate('ProductDetails', { productId: product.id }),
    [navigation],
  );

  const goToCategory = useCallback(
    (category: CategoryRef) => navigation.navigate('CategoryProducts', { categoryId: category.id }),
    [navigation],
  );

  const goToCategoriesTab = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Categories' }),
    [navigation],
  );

  const goToProfile = useCallback(
    () => navigation.navigate('Tabs', { screen: 'Profile' }),
    [navigation],
  );

  const goToAddressSelection = useCallback(
    () => navigation.navigate('AddressList', { selectMode: true }),
    [navigation],
  );

  const addressDetail = defaultAddress
    ? [defaultAddress.address_line1, defaultAddress.address_line2, defaultAddress.city, defaultAddress.pincode]
        .filter(Boolean)
        .join(', ')
    : 'Choose a delivery address';

  const renderSection = useCallback<ListRenderItem<Rail>>(
    ({ item }) => (
      <ProductSection
        title={item.title}
        products={item.products}
        onProductPress={goToProduct}
        onSeeAllPress={() => navigation.navigate('CategoryProducts', { categoryId: item.categoryId })}
      />
    ),
    [goToProduct, navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <DeliveryBanner style={styles.banner} />
        {categories.length > 0 ? (
          <View style={styles.categoriesBlock}>
            <SectionHeader
              title="Shop by category"
              actionLabel="See all"
              onActionPress={goToCategoriesTab}
            />
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id ?? 'none'}
              renderItem={({ item }) => (
                <CategoryCard category={item} onPress={goToCategory} variant="rail" />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              ItemSeparatorComponent={CategorySeparator}
              initialNumToRender={6}
              removeClippedSubviews
            />
          </View>
        ) : null}
      </View>
    ),
    [categories, goToCategoriesTab, goToCategory],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <LocationHeader
          etaLabel="Delivery in 10 mins"
          addressLabel={defaultAddress ? 'Delivering to' : 'Choose location'}
          addressDetail={addressDetail}
          initials={initialsFor(user?.name)}
          onAddressPress={goToAddressSelection}
          onAvatarPress={goToProfile}
          style={styles.locationHeader}
        />

        <SearchBar onPress={goToSearch} rotatingHints={SEARCH_HINTS} />
      </LinearGradient>

      {isLoading ? (
        <HomeSkeleton />
      ) : error ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.errorScroll}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        >
          <ErrorState message={error} onRetry={refresh} />
          <View style={styles.debugBox}>
            <AppText variant="captionStrong" color="textTertiary">DEBUG — pull down to retry</AppText>
            <AppText variant="caption" color="textTertiary" style={styles.debugLine}>API: {API_BASE_URL}</AppText>
            <AppText variant="caption" color="textTertiary" style={styles.debugLine}>Error: {error}</AppText>
          </View>
        </ScrollView>
      ) : rails.length === 0 ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.errorScroll}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        >
          <ErrorState message="No stores delivering to this location yet." onRetry={refresh} />
          <View style={styles.debugBox}>
            <AppText variant="captionStrong" color="textTertiary">DEBUG — pull down to retry</AppText>
            <AppText variant="caption" color="textTertiary" style={styles.debugLine}>API: {API_BASE_URL}</AppText>
          </View>
        </ScrollView>
      ) : (
        <Animated.View entering={FadeIn.duration(240)} style={styles.flex}>
          <FlatList
            data={rails}
            keyExtractor={(item) => item.id}
            renderItem={renderSection}
            ListHeaderComponent={listHeader}
            ListFooterComponent={ListFooter}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={5}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        </Animated.View>
      )}
    </View>
  );
}

const CategorySeparator = () => <View style={{ width: spacing.md }} />;

const ListFooter = () => (
  <View style={styles.footer}>
    <View style={styles.footerRule} />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.lg,
  },
  locationHeader: { marginBottom: spacing.lg },
  listHeader: { paddingTop: spacing.xl },
  banner: { marginBottom: spacing.xxl },
  categoriesBlock: { marginBottom: spacing.xxl },
  categoryList: { paddingHorizontal: layout.gutter },
  listContent: { paddingBottom: spacing.xxl },
  errorState: { flex: 1 },
  errorScroll: { flexGrow: 1 },
  debugBox: { marginHorizontal: layout.gutter, marginBottom: spacing.xl, padding: spacing.md, backgroundColor: colors.canvas, borderRadius: 8 },
  debugLine: { marginTop: spacing.xs },
  footer: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl },
  footerRule: { height: 1, backgroundColor: colors.border },
});
