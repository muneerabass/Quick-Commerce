import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Input, PressableScale } from '../../components';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import {
  digitsOnly,
  validateEmail,
  validateName,
  validatePhone,
} from '../../utils/validation';
import { spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

interface FormState {
  name: string;
  phone: string;
  email: string;
}

type FormErrors = Partial<Record<keyof FormState | 'form', string>>;

function validateAll(values: FormState): FormErrors {
  const errors: FormErrors = {};
  const name = validateName(values.name);
  const phone = validatePhone(values.phone);
  const email = validateEmail(values.email);

  if (name) errors.name = name;
  if (phone) errors.phone = phone;
  if (email) errors.email = email;
  return errors;
}

export function SignupScreen({ navigation }: Props) {
  const { signup, isSubmitting } = useAuth();

  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const [values, setValues] = useState<FormState>({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /** Re-validates live only after the first submit attempt. */
  const setField = useCallback(
    (field: keyof FormState, value: string) => {
      const next = { ...values, [field]: value };
      setValues(next);
      if (hasSubmitted) setErrors(validateAll(next));
    },
    [values, hasSubmitted],
  );

  const handleSubmit = useCallback(async () => {
    setHasSubmitted(true);

    const nextErrors = validateAll(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      await signup({
        name: values.name,
        phone: values.phone,
        email: values.email.trim() || undefined,
      });
    } catch (e) {
      setErrors({
        form: e instanceof Error ? e.message : 'We could not create your account. Try again.',
      });
    }
  }, [signup, values]);

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One quick setup and your essentials are ten minutes away."
      onBack={() => navigation.goBack()}
      footer={
        <View style={styles.footerRow}>
          <AppText variant="bodySmall" color="textSecondary">
            Already have an account?
          </AppText>
          <PressableScale
            onPress={() => navigation.goBack()}
            scaleTo={0.94}
            haptic="none"
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Log in to an existing account"
            style={styles.footerLink}
          >
            <AppText variant="bodyStrong" color="primary">
              Log in
            </AppText>
          </PressableScale>
        </View>
      }
    >
      <Input
        label="Full name"
        placeholder="Your name"
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
        returnKeyType="next"
        value={values.name}
        onChangeText={(v) => setField('name', v)}
        onSubmitEditing={() => phoneRef.current?.focus()}
        error={errors.name}
        containerStyle={styles.field}
      />

      <Input
        ref={phoneRef}
        label="Mobile number"
        prefix="+91"
        placeholder="00000 00000"
        keyboardType="number-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="next"
        maxLength={10}
        value={values.phone}
        onChangeText={(v) => setField('phone', digitsOnly(v))}
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.phone}
        containerStyle={styles.field}
      />

      <Input
        ref={emailRef}
        label="Email"
        optional
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="done"
        value={values.email}
        onChangeText={(v) => setField('email', v)}
        onSubmitEditing={handleSubmit}
        error={errors.email}
        hint="For order receipts and offers"
        containerStyle={styles.field}
      />

      {errors.form ? (
        <AppText variant="bodySmall" color="error" style={styles.formError}>
          {errors.form}
        </AppText>
      ) : null}

      <Button
        label="Create account"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submit}
        accessibilityHint="Creates your account and opens the home screen"
      />

      <AppText variant="caption" color="textTertiary" center style={styles.terms}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </AppText>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.xl },
  formError: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
  terms: { marginTop: spacing.xl, lineHeight: 17 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerLink: { marginLeft: spacing.sm, paddingVertical: spacing.sm },
});
