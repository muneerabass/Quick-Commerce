import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { ProductImage } from './ProductImage';
import { Category } from '../types';
import { colors, layout, radius, spacing } from '../theme';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  /** `rail` is the compact home-screen tile; `grid` is the taller Categories-tab card. */
  variant?: 'rail' | 'grid';
  style?: StyleProp<ViewStyle>;
}

export const CategoryCard = React.memo(function CategoryCard({
  category,
  onPress,
  variant = 'rail',
  style,
}: CategoryCardProps) {
  const handlePress = useCallback(() => onPress(category), [onPress, category]);

  const isRail = variant === 'rail';
  const tileWidth = isRail ? layout.categoryTileWidth : layout.categoryGridWidth;
  const imageSize = isRail ? tileWidth * 0.7 : tileWidth * 0.56;

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.94}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category, ${category.itemCount} items`}
      style={[{ width: tileWidth }, style]}
    >
      <View
        style={[
          styles.tile,
          { backgroundColor: category.tint },
          isRail ? styles.tileRail : styles.tileGrid,
        ]}
      >
        <ProductImage
          uri={category.image}
          emoji={category.emoji}
          size={imageSize}
          tint={category.tint}
          radiusToken="sm"
          recyclingKey={category.id}
        />
      </View>

      <AppText
        variant="caption"
        numberOfLines={2}
        center
        style={[styles.label, isRail ? styles.labelRail : styles.labelGrid]}
      >
        {category.name}
      </AppText>

      {!isRail ? (
        <AppText variant="caption" color="textTertiary" center>
          {category.itemCount} items
        </AppText>
      ) : null}
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileRail: { aspectRatio: 1 },
  tileGrid: { aspectRatio: 1.05, borderRadius: radius.lg },
  label: { fontWeight: '600', color: colors.text },
  labelRail: { marginTop: spacing.sm, minHeight: 30 },
  // Two-line reservation keeps grid rows aligned when a name wraps.
  labelGrid: { marginTop: spacing.sm, marginBottom: 2, minHeight: 32 },
});
