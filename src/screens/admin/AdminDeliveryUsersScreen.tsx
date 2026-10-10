import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminScreenHeader, AppText, Button, Input, PressableScale } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { digitsOnly } from '../../utils/validation';
import { colors, layout, radius, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<AdminStackParamList>;

export function AdminDeliveryUsersScreen() {
  const navigation = useNavigation<Navigation>();
  const { activeStore, createDeliveryUser } = useAdmin();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!activeStore) {
      Alert.alert('No active store', 'Pick a store first from the dashboard.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid phone', 'Phone must be 10 digits.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createDeliveryUser(`+91${phone}`, name.trim() || undefined);
      setPhone('');
      setName('');
      Alert.alert('Rider added', `Linked to ${activeStore.name}.`);
    } catch (error) {
      Alert.alert('Could not add rider', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStore, createDeliveryUser, name, phone]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AdminScreenHeader title="Delivery riders" subtitle={activeStore ? `Will be assigned to ${activeStore.name}` : 'Pick an active store first'} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <AppText variant="heading3" style={styles.cardTitle}>
              Invite a rider
            </AppText>
            <Input
              label="Phone"
              prefix="+91"
              value={phone}
              onChangeText={(v) => setPhone(digitsOnly(v))}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Input label="Name (optional)" value={name} onChangeText={setName} autoCapitalize="words" />
            <Button
              label="Add rider"
              onPress={handleCreate}
              loading={isSubmitting}
              disabled={!activeStore}
              style={styles.submit}
            />
          </View>

          <AppText variant="caption" color="textTertiary" style={styles.hint}>
            The rider will be able to log in with the same phone via OTP. On first login they will
            land directly on the delivery screen.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', paddingHorizontal: layout.gutter, paddingTop: spacing.lg, gap: spacing.md },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg, paddingBottom: spacing.huge },
  card: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { marginBottom: spacing.md },
  submit: { marginTop: spacing.md },
  hint: { marginTop: spacing.lg, lineHeight: 18 },
});
