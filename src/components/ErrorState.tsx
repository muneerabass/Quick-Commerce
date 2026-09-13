import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing } from '../theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Shared failure surface. Phase 2 wires this to API errors; today it backs the error boundary. */
export const ErrorState = React.memo(function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this just now. Please try again.',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconRing}>
        <Ionicons name="cloud-offline-outline" size={34} color={colors.error} />
      </View>

      <AppText variant="heading3" center style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" center style={styles.message}>
        {message}
      </AppText>

      {onRetry ? (
        <Button
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          size="md"
          fullWidth={false}
          icon="refresh"
          style={styles.action}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  iconRing: {
    width: 74,
    height: 74,
    borderRadius: radius.pill,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { marginBottom: spacing.sm },
  message: { maxWidth: 280 },
  action: { marginTop: spacing.xl, paddingHorizontal: spacing.xxl },
});
