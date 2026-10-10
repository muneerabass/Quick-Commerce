import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Input, PressableScale } from '../../components';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { getLastDevOtp } from '../../services/authService';
import { colors, spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import { IS_DEV } from '../../config/env';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const { verifyOtp, isSubmitting } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loadingDevOtp, setLoadingDevOtp] = useState(false);

  const handleChange = useCallback((value: string) => {
    const next = value.replace(/\D/g, '').slice(0, 4);
    setOtp(next);
    if (error) setError(undefined);
  }, [error]);

  const handleSubmit = useCallback(async () => {
    if (otp.length !== 4) {
      setError('Enter the 4-digit code we sent you.');
      return;
    }
    try {
      const user = await verifyOtp(phone, otp);
      if (!user.name) {
        navigation.navigate('Name');
      }
      // Otherwise RootNavigator switches stacks automatically.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed. Try again.');
    }
  }, [navigation, otp, phone, verifyOtp]);

  const handleAutoFill = useCallback(async () => {
    setLoadingDevOtp(true);
    try {
      const code = await getLastDevOtp(phone);
      if (code) {
        setOtp(code);
      } else {
        setError('No dev OTP found yet — resend first.');
      }
    } finally {
      setLoadingDevOtp(false);
    }
  }, [phone]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthLayout
      title="Verify your number"
      subtitle={`We sent a 4-digit code to ${phone}.`}
      onBack={() => navigation.goBack()}
    >
      <Input
        ref={inputRef}
        label="Verification code"
        placeholder="0000"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        returnKeyType="done"
        maxLength={4}
        value={otp}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        error={error}
        hint="The code is valid for 5 minutes"
      />

      <Button
        label="Verify"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submit}
        disabled={otp.length !== 4}
      />

      {IS_DEV ? (
        <PressableScale
          onPress={handleAutoFill}
          scaleTo={0.98}
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Autofill the dev OTP"
          style={styles.devButton}
        >
          <AppText variant="button" color="primary">
            {loadingDevOtp ? 'Fetching…' : 'Autofill dev OTP'}
          </AppText>
        </PressableScale>
      ) : null}

      <View style={styles.resendRow}>
        <AppText variant="bodySmall" color="textSecondary">
          Didn't receive it?
        </AppText>
        <PressableScale
          onPress={() => navigation.goBack()}
          scaleTo={0.94}
          haptic="none"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Change number or resend code"
          style={styles.resendLink}
        >
          <AppText variant="bodyStrong" color="primary">
            Change number
          </AppText>
        </PressableScale>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xxl },
  devButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: 12,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  resendLink: { marginLeft: spacing.sm, paddingVertical: spacing.sm },
});
