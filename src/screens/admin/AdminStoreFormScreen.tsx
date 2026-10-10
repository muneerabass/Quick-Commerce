import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppText, Button, Input, PressableScale } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { colors, layout, radius, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'StoreForm'>;

interface FormState {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

const EMPTY: FormState = { name: '', address: '', latitude: '', longitude: '', isActive: true };

export function AdminStoreFormScreen({ navigation, route }: Props) {
  const editingId = route.params?.storeId;
  const { stores, saveStore } = useAdmin();
  const existing = editingId ? stores.find((s) => s.id === editingId) : undefined;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      address: existing.address,
      latitude: existing.latitude != null ? String(existing.latitude) : '',
      longitude: existing.longitude != null ? String(existing.longitude) : '',
      isActive: existing.is_active,
    });
  }, [existing]);

  const handleLocate = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setForm((prev) => ({
        ...prev,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }));
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.address.trim() || !form.latitude.trim() || !form.longitude.trim()) {
      Alert.alert('Missing fields', 'Name, address, latitude and longitude are required.');
      return;
    }
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert('Invalid coordinates', 'Latitude and longitude must be numbers.');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveStore(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: lat,
          longitude: lng,
          is_active: form.isActive,
        },
        existing?.id,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save store', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [existing?.id, form, navigation, saveStore]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AppText variant="heading2" style={styles.title}>
          {existing ? 'Edit store' : 'Add store'}
        </AppText>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Input label="Address" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
          <Input label="Latitude" value={form.latitude} onChangeText={(v) => setForm({ ...form, latitude: v })} keyboardType="decimal-pad" />
          <Input label="Longitude" value={form.longitude} onChangeText={(v) => setForm({ ...form, longitude: v })} keyboardType="decimal-pad" />

          <PressableScale onPress={handleLocate} scaleTo={0.98} haptic="none" style={styles.locateButton}>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <AppText variant="button" color="primary" style={styles.locateLabel}>
              {isLocating ? 'Fetching…' : 'Use my current location'}
            </AppText>
          </PressableScale>

          <PressableScale
            onPress={() => setForm({ ...form, isActive: !form.isActive })}
            scaleTo={0.98}
            haptic="none"
            style={[styles.toggle, form.isActive && styles.toggleActive]}
          >
            <Ionicons name={form.isActive ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={form.isActive ? colors.primary : colors.textSecondary} />
            <AppText variant="button" color={form.isActive ? 'primary' : 'textSecondary'} style={styles.toggleLabel}>
              Active
            </AppText>
          </PressableScale>

          <Button label={existing ? 'Save changes' : 'Create store'} onPress={handleSubmit} loading={isSubmitting} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.gutter, paddingVertical: spacing.lg },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    marginVertical: spacing.md,
  },
  locateLabel: { marginLeft: spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    marginBottom: spacing.lg,
  },
  toggleActive: { backgroundColor: colors.primarySoft },
  toggleLabel: { marginLeft: spacing.sm },
  submit: { marginTop: spacing.md },
});
