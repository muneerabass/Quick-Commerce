import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from '../../components';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { validateName } from '../../utils/validation';
import { spacing } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Name'>;

export function NameScreen(_: Props) {
  const { updateProfile } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await updateProfile(name.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your name. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, updateProfile]);

  return (
    <AuthLayout
      title="What should we call you?"
      subtitle="This is how we'll address you across the app."
    >
      <Input
        ref={inputRef}
        label="Your name"
        placeholder="e.g. Muneer Abbas"
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
        maxLength={120}
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (error) setError(undefined);
        }}
        onSubmitEditing={handleSubmit}
        error={error}
      />
      <Button label="Continue" onPress={handleSubmit} loading={submitting} style={styles.submit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.xxl },
});
