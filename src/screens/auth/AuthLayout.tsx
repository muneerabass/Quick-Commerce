import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, PressableScale } from '../../components';
import { colors, radius, spacing } from '../../theme';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}

/**
 * Shared chrome for Login and Signup: keyboard avoidance, scrollable form area,
 * tap-to-dismiss, and the brand mark. Keeping this in one place is what stops the two
 * auth screens from drifting apart visually.
 */
export function AuthLayout({ title, subtitle, children, footer, onBack }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              {onBack ? (
                <PressableScale
                  onPress={onBack}
                  scaleTo={0.9}
                  haptic="none"
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={22} color={colors.text} />
                </PressableScale>
              ) : (
                <View style={styles.mark}>
                  <Ionicons name="flash" size={26} color={colors.textInverse} />
                </View>
              )}

              <Animated.View entering={FadeInDown.duration(360).delay(60)}>
                <AppText variant="display" style={styles.title}>
                  {title}
                </AppText>
                <AppText variant="body" color="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </AppText>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(360).delay(140)} style={styles.form}>
                {children}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    marginLeft: -spacing.xs,
  },
  title: { marginBottom: spacing.sm },
  subtitle: { maxWidth: 320 },
  form: { marginTop: spacing.xxxl },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
