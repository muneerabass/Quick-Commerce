import React, { forwardRef, useCallback, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, radius, spacing, typography } from '../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Inline, field-level message. Shown in place of an alert dialog. */
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Rendered inside the field on the left — used for the +91 country code. */
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  optional?: boolean;
}

/**
 * Text field with a focus ring, an inline error slot and an optional prefix.
 * Errors animate in rather than appearing instantly, which keeps forms calm.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, prefix, containerStyle, optional, onFocus, onBlur, ...rest },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (event) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    (event) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.primary
      : colors.borderStrong;

  return (
    <View style={containerStyle}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant="bodySmall" color="textSecondary" style={styles.label}>
            {label}
          </AppText>
          {optional ? (
            <AppText variant="caption" color="textTertiary">
              Optional
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.field,
          { borderColor },
          isFocused && !error ? styles.fieldFocused : null,
          error ? styles.fieldError : null,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={19}
            color={isFocused ? colors.primary : colors.textTertiary}
            style={styles.leftIcon}
          />
        ) : null}

        {prefix ? (
          <View style={styles.prefix}>
            <AppText variant="bodyStrong">{prefix}</AppText>
            <View style={styles.prefixDivider} />
          </View>
        ) : null}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          {...rest}
        />
      </View>

      {error ? (
        <Animated.View
          entering={FadeInDown.duration(160)}
          exiting={FadeOutUp.duration(120)}
          style={styles.messageRow}
        >
          <Ionicons name="alert-circle" size={13} color={colors.error} />
          <AppText variant="caption" color="error" style={styles.messageText}>
            {error}
          </AppText>
        </Animated.View>
      ) : hint ? (
        <AppText variant="caption" color="textTertiary" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
  },
  fieldFocused: { backgroundColor: colors.background },
  fieldError: { backgroundColor: colors.errorSoft },
  leftIcon: { marginRight: spacing.md },
  prefix: { flexDirection: 'row', alignItems: 'center' },
  prefixDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  messageText: { marginLeft: spacing.xs, flex: 1 },
  hint: { marginTop: spacing.sm },
});
