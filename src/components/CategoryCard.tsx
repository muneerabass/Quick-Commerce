import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { CategoryRef } from '../types';
import { colors, layout, radius, spacing } from '../theme';

interface CategoryCardProps {
  category: CategoryRef;
  onPress: (category: CategoryRef) => void;
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
  const emojiSize = isRail ? tileWidth * 0.45 : tileWidth * 0.4;

  return (
    <PressableScale
      onPress={handlePress}
      scaleTo={0.94}
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category, ${category.productCount} items`}
      style={[{ width: tileWidth }, style]}
    >
      <View
        style={[
          styles.tile,
          { backgroundColor: category.tint },
          isRail ? styles.tileRail : styles.tileGrid,
        ]}
      >
        <AppText style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.1 }}>
          {category.emoji}
        </AppText>
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
          {category.productCount} items
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
  labelGrid: { marginTop: spacing.sm, marginBottom: 2, minHeight: 32 },
});
