import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

interface ProductImageProps {
  /** Null / undefined falls back to a letter avatar on a tinted frame. */
  uri?: string | null;
  /** Shown as fallback when the uri is missing or fails to load. */
  fallbackText: string;
  size: number;
  tint?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
  radiusToken?: keyof typeof radius;
  recyclingKey?: string;
}

/**
 * Product imagery with a guaranteed-graceful failure mode.
 *
 * A quick-commerce grid full of grey boxes reads as broken, so a missing or failed
 * image falls back to a bold initial on a soft tint instead of an empty frame.
 */
export const ProductImage = React.memo(function ProductImage({
  uri,
  fallbackText,
  size,
  tint = colors.surfaceMuted,
  style,
  contentFit = 'cover',
  radiusToken = 'md',
  recyclingKey,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !uri || failed;

  const frame: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius[radiusToken],
    backgroundColor: tint,
  };

  if (showFallback) {
    const initial = (fallbackText || '•').trim().charAt(0).toUpperCase();
    return (
      <View style={[styles.fallback, frame, style]} accessibilityRole="image">
        <AppText style={{ fontSize: size * 0.38, lineHeight: size * 0.5, fontWeight: '800', color: colors.textSecondary }}>
          {initial}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.frame, frame, style]}>
      <Image
        source={{ uri: uri as string }}
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
  fallback: { alignItems: 'center', justifyContent: 'center' },
  frame: { overflow: 'hidden' },
});
