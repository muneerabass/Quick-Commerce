import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Input, PressableScale } from '../../components';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { digitsOnly, validatePhone } from '../../utils/validation';
import { colors, radius, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, isSubmitting } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  /** Errors only appear after the first submit, so typing never feels scolded. */
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = useCallback(
    (value: string) => {
      const next = digitsOnly(value);
      setPhone(next);
      if (hasSubmitted) setError(validatePhone(next));
    },
    [hasSubmitted],
  );

  const handleSubmit = useCallback(async () => {
    setHasSubmitted(true);

    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setError(undefined);
    try {
      // Phase 2 inserts requestOtp() -> OTP screen -> verifyOtp() between these lines.
      await login(phone);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign you in. Please try again.');
    }
  }, [login, phone]);

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Get groceries and daily essentials delivered to your doorstep in minutes."
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" color="textSecondary">
            New to Zipp?
          </AppText>
          <PressableScale
            onPress={() => navigation.navigate('Signup')}
            scaleTo={0.94}
            haptic="none"
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Create a new account"
            style={styles.footerLink}
          >
            <AppText variant="bodyStrong" color="primary">
              Create an account
            </AppText>
          </PressableScale>
        </View>
      }
    >
      <Input
        ref={inputRef}
        label="Mobile number"
        prefix="+91"
        placeholder="00000 00000"
        keyboardType="number-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="done"
        maxLength={10}
        value={phone}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        error={error}
        hint="We'll send a verification code to this number"
        autoFocus
      />

      <Button
        label="Continue"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submit}
        accessibilityHint="Signs you in and opens the home screen"
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText variant="caption" color="textTertiary" style={styles.dividerText}>
          OR
        </AppText>
        <View style={styles.dividerLine} />
      </View>

      <PressableScale
        onPress={() => setError('Google sign-in arrives in the next release.')}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        style={styles.socialButton}
      >
        <Ionicons name="logo-google" size={19} color={colors.text} />
        <AppText variant="button" style={styles.socialLabel}>
          Continue with Google
        </AppText>
      </PressableScale>

      <AppText variant="caption" color="textTertiary" center style={styles.terms}>
        By continuing you agree to our{' '}
        <AppText variant="caption" color="textSecondary" style={styles.termsLink}>
          Terms of Service
        </AppText>{' '}
        and{' '}
        <AppText variant="caption" color="textSecondary" style={styles.termsLink}>
          Privacy Policy
        </AppText>
        .
      </AppText>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xxl },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xxl },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
  dividerText: { marginHorizontal: spacing.md, letterSpacing: 1 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  socialLabel: { marginLeft: spacing.md },
  terms: { marginTop: spacing.xxl, lineHeight: 17 },
  termsLink: { fontWeight: '700', textDecorationLine: 'underline' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerLink: { marginLeft: spacing.sm, paddingVertical: spacing.sm },
});
