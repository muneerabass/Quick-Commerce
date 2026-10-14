import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from '../components';
import { colors, gradients, radius, spacing } from '../theme';

interface SplashScreenProps {
  /** Fires once the brand animation has finished; the root navigator waits on it. */
  onAnimationComplete: () => void;
}

const HOLD_MS = 1250;

/**
 * Brand moment on cold start.
 *
 * The mark scales in, the wordmark and tagline follow, and the whole thing reports
 * completion after ~1.25s. Auth restoration runs in parallel, so this is the floor on
 * launch time, not an addition to it.
 */
export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const markScale = useSharedValue(0.72);
  const markOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslate = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) });
    markScale.value = withSequence(
      withTiming(1.03, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
    );

    wordmarkOpacity.value = withDelay(220, withTiming(1, { duration: 300 }));
    wordmarkTranslate.value = withDelay(220, withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) }));

    taglineOpacity.value = withDelay(420, withTiming(1, { duration: 320 }));

    // Hand control back to the navigator once the hold elapses.
    const timer = setTimeout(onAnimationComplete, HOLD_MS);
    return () => clearTimeout(timer);
  }, [markOpacity, markScale, wordmarkOpacity, wordmarkTranslate, taglineOpacity, onAnimationComplete]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslate.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={gradients.splash}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <Animated.View style={[styles.mark, markStyle]}>
          <Ionicons name="flash" size={44} color={colors.primary} />
        </Animated.View>

        <Animated.View style={wordmarkStyle}>
          <AppText style={styles.wordmark}>zipp</AppText>
        </Animated.View>

        <Animated.View style={taglineStyle}>
          <AppText variant="bodySmall" center style={styles.tagline}>
            Groceries in 10 minutes
          </AppText>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, taglineStyle]}>
        <AppText variant="caption" center style={styles.footerText}>
          Fresh · Fast · Everyday
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: 92,
    height: 92,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  wordmark: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: colors.textInverse,
  },
  tagline: { color: 'rgba(255,255,255,0.78)', marginTop: spacing.sm, letterSpacing: 0.3 },
  footer: { paddingBottom: spacing.huge },
  footerText: { color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2 },
});
