import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
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
import { useCatalog, HomeFeed } from '../../hooks/useCatalog';
import { Category, Product } from '../../types';
import { colors, gradients, layout, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

type FeedSection = HomeFeed['sections'][number];

const SEARCH_HINTS = ['milk', 'bananas', 'bread', 'eggs', 'cold drinks', 'ice cream'];

function initialsFor(name?: string | null): string {
  if (!name) return 'ZU';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'ZU';
}

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, isRefreshing, error, refresh, retry } = useCatalog();

  const goToSearch = useCallback(() => navigation.navigate('Search'), [navigation]);

  const goToProduct = useCallback(
    (product: Product) => navigation.navigate('ProductDetails', { productId: product.id }),
    [navigation],
  );

  const goToCategory = useCallback(
    (category: Category) => navigation.navigate('CategoryProducts', { categoryId: category.id }),
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

  const renderSection = useCallback<ListRenderItem<FeedSection>>(
    ({ item }) => (
      <ProductSection
        title={item.title}
        subtitle={item.subtitle}
        products={item.products}
        onProductPress={goToProduct}
        onSeeAllPress={
          // "See all" opens the category the rail is drawn from.
          item.products[0]
            ? () =>
                navigation.navigate('CategoryProducts', {
                  categoryId: item.products[0].categoryId,
                })
            : undefined
        }
      />
    ),
    [goToProduct, navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <DeliveryBanner style={styles.banner} />

        <View style={styles.categoriesBlock}>
          <SectionHeader
            title="Shop by category"
            actionLabel="See all"
            onActionPress={goToCategoriesTab}
          />
          <FlatList
            data={data?.categories ?? []}
            keyExtractor={(item) => item.id}
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
      </View>
    ),
    [data?.categories, goToCategoriesTab, goToCategory],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Brand header — pinned, so location and search stay reachable while browsing. */}
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <LocationHeader
          etaLabel="Delivery in 10 mins"
          addressLabel="Home"
          addressDetail="Dharampeth, Nagpur"
          initials={initialsFor(user?.name)}
          onAddressPress={goToProfile}
          onAvatarPress={goToProfile}
          style={styles.locationHeader}
        />

        <SearchBar onPress={goToSearch} rotatingHints={SEARCH_HINTS} />
      </LinearGradient>

      {isLoading ? (
        <HomeSkeleton />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={retry}
          style={styles.errorState}
        />
      ) : (
        <Animated.View entering={FadeIn.duration(240)} style={styles.flex}>
          <FlatList
            data={data?.sections ?? []}
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
  footer: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl },
  footerRule: { height: 1, backgroundColor: colors.border },
});
