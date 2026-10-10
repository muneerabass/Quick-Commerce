import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Input } from '../../components';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { digitsOnly, validatePhone } from '../../utils/validation';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { sendOtp, isSubmitting } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
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
    const e164 = `+91${phone}`;
    try {
      await sendOtp(e164);
      navigation.navigate('Otp', { phone: e164 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    }
  }, [navigation, phone, sendOtp]);

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Enter your mobile number to continue. We'll send a 4-digit code to verify."
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
        label="Send OTP"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submit}
        accessibilityHint="Sends a one-time code to verify your number"
      />

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
  terms: { marginTop: spacing.xxl, lineHeight: 17, color: colors.textTertiary },
  termsLink: { fontWeight: '700', textDecorationLine: 'underline' },
});
