import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, EmptyState, FloatingCartBar, PressableScale, ProductGrid } from '../../components';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { pluralize } from '../../utils/format';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<MainStackParamList>;
type ScreenRoute = RouteProp<MainStackParamList, 'CategoryProducts'>;

export function CategoryProductsScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<ScreenRoute>();
  const { products } = useStore();

  const list = useMemo(
    () => products.filter((p) => (params.categoryId ? p.category_id === params.categoryId : !p.category_id)),
    [params.categoryId, products],
  );

  const title = params.categoryId
    ? `Category · ${params.categoryId.slice(0, 6)}`
    : 'Everything else';

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goToProduct = useCallback(
    (product: Product) => navigation.navigate('ProductDetails', { productId: product.id }),
    [navigation],
  );
  const goToCart = useCallback(() => navigation.navigate('Tabs', { screen: 'Cart' }), [navigation]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={goBack} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.headerCopy}>
          <AppText variant="heading2">{title}</AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {pluralize(list.length, 'item')} available
          </AppText>
        </View>
      </View>

      <ProductGrid
        products={list}
        onProductPress={goToProduct}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <EmptyState emoji="🧺" title="No items here" message="This category is empty at the moment." />
        }
      />

      <FloatingCartBar onPress={goToCart} respectSafeArea={false} />
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
  headerCopy: { flex: 1 },
  gridContent: { paddingBottom: spacing.huge + layout.floatingBarHeight },
});
