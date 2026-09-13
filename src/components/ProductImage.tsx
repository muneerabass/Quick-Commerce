import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

interface ProductImageProps {
  uri: string;
  /** Rendered on a tinted card if the remote image fails or is still unavailable. */
  emoji: string;
  size: number;
  /** Category tint used behind the emoji so the fallback still looks designed. */
  tint?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
  radiusToken?: keyof typeof radius;
  /** Passed to expo-image so recycled list rows do not flash the previous image. */
  recyclingKey?: string;
}

/**
 * Product imagery with a guaranteed-graceful failure mode.
 *
 * A quick-commerce grid full of grey boxes reads as broken, so a failed load falls back
 * to a large emoji on a soft tint rather than to an empty frame.
 */
export const ProductImage = React.memo(function ProductImage({
  uri,
  emoji,
  size,
  tint = colors.surfaceMuted,
  style,
  contentFit = 'cover',
  radiusToken = 'md',
  recyclingKey,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const frame: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius[radiusToken],
    backgroundColor: tint,
  };

  if (failed) {
    return (
      <View style={[styles.fallback, frame, style]} accessibilityRole="image">
        <AppText style={{ fontSize: size * 0.42, lineHeight: size * 0.52 }}>{emoji}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.frame, frame, style]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={220}
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        onError={() => setFailed(true)}
        accessible={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
