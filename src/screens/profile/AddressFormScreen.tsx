import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AppText, Button, Input, PressableScale } from '../../components';
import * as addressService from '../../services/addressService';
import { addressPickerBus } from '../../services/addressPickerBus';
import { Address } from '../../types';
import { colors, layout, radius, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'AddressForm'>;

interface FormState {
  label: string;
  recipient_name: string;
  phone: string; // 10-digit local, formatted to +91 on submit
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  delivery_instructions: string;
}

const EMPTY: FormState = {
  label: 'Home',
  recipient_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  latitude: null,
  longitude: null,
  delivery_instructions: '',
};

function toForm(address: Address): FormState {
  return {
    label: address.label,
    recipient_name: address.recipient_name,
    phone: address.phone.replace(/^\+91/, ''),
    address_line1: address.address_line1,
    address_line2: address.address_line2 ?? '',
    landmark: address.landmark ?? '',
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    delivery_instructions: address.delivery_instructions ?? '',
  };
}

export function AddressFormScreen({ navigation, route }: Props) {
  const editingId = route.params?.addressId;
  const selectMode = route.params?.selectMode ?? false;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [isLoading, setIsLoading] = useState(!!editingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const list = await addressService.listAddresses();
        const existing = list.find((a) => a.id === editingId);
        if (existing) setForm(toForm(existing));
      } catch (error) {
        Alert.alert('Could not load address', error instanceof Error ? error.message : 'Try again.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [editingId]);

  // Pick up whatever the map picker left for us whenever this screen regains focus.
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      const picked = addressPickerBus.consume();
      if (!picked) return;
      setForm((prev) => ({
        ...prev,
        latitude: picked.latitude,
        longitude: picked.longitude,
        address_line1: picked.address_line1 ?? prev.address_line1,
        city: picked.city ?? prev.city,
        state: picked.state ?? prev.state,
        pincode: picked.pincode ?? prev.pincode,
      }));
    });
    return unsub;
  }, [navigation]);

  const handleLocate = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Grant location access to pin this address on the map.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setForm((prev) => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    } catch (error) {
      Alert.alert('Could not get location', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.address_line1.trim()) {
      Alert.alert('Missing fields', 'Please fill in name, phone, and address line 1.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      Alert.alert('Invalid phone', 'Phone must be 10 digits.');
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      Alert.alert('Missing fields', 'Please fill in city, state, and pincode.');
      return;
    }
    const payload = {
      label: form.label.trim() || 'Home',
      recipient_name: form.recipient_name.trim(),
      phone: `+91${form.phone}`,
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      delivery_instructions: form.delivery_instructions.trim() || null,
      // A new address created from the home location selector becomes the
      // address the shopper is choosing for this session.
      is_default: selectMode && !editingId,
    };
    setIsSubmitting(true);
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, payload);
      } else {
        await addressService.createAddress(payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save address', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, form, navigation]);

  if (isLoading) {
    return <SafeAreaView style={styles.screen} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AppText variant="heading2" style={styles.title}>
          {editingId ? 'Edit address' : 'Add address'}
        </AppText>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.labelRow}>
            {(['Home', 'Work', 'Other'] as const).map((option) => (
              <PressableScale
                key={option}
                onPress={() => setField('label', option)}
                scaleTo={0.96}
                haptic="none"
                style={[styles.labelChip, form.label === option && styles.labelChipActive]}
              >
                <AppText variant="button" color={form.label === option ? 'primary' : 'textSecondary'}>
                  {option}
                </AppText>
              </PressableScale>
            ))}
          </View>

          <Input label="Recipient name" value={form.recipient_name} onChangeText={(v) => setField('recipient_name', v)} placeholder="e.g. Muneer Abbas" />
          <Input label="Phone" prefix="+91" value={form.phone} onChangeText={(v) => setField('phone', v.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" maxLength={10} />
          <Input label="Address line 1" value={form.address_line1} onChangeText={(v) => setField('address_line1', v)} placeholder="House / flat / street" />
          <Input label="Address line 2" value={form.address_line2} onChangeText={(v) => setField('address_line2', v)} placeholder="Area / sector" />
          <Input label="Landmark" value={form.landmark} onChangeText={(v) => setField('landmark', v)} placeholder="Nearby reference (optional)" />
          <Input label="City" value={form.city} onChangeText={(v) => setField('city', v)} />
          <Input label="State" value={form.state} onChangeText={(v) => setField('state', v)} />
          <Input label="Pincode" value={form.pincode} onChangeText={(v) => setField('pincode', v.replace(/\D/g, '').slice(0, 10))} keyboardType="number-pad" maxLength={10} />
          <Input label="Delivery instructions" value={form.delivery_instructions} onChangeText={(v) => setField('delivery_instructions', v)} placeholder="Leave at the door, call on arrival…" />

          <PressableScale
            onPress={() => navigation.navigate('AddressMapPicker', {
              initialLatitude: form.latitude ?? undefined,
              initialLongitude: form.longitude ?? undefined,
            })}
            scaleTo={0.98}
            haptic="none"
            style={styles.locateButton}
          >
            <Ionicons name="map" size={18} color={colors.primary} />
            <AppText variant="button" color="primary" style={styles.locateLabel}>
              {form.latitude && form.longitude
                ? `Pinned at ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`
                : 'Pick location on map'}
            </AppText>
          </PressableScale>

          <PressableScale onPress={handleLocate} scaleTo={0.98} haptic="none" style={styles.locateButtonGhost}>
            <Ionicons name="locate" size={16} color={colors.textSecondary} />
            <AppText variant="caption" color="textSecondary" style={styles.locateLabel}>
              {isLocating ? 'Fetching location…' : 'Use my current location'}
            </AppText>
          </PressableScale>

          <Button label={editingId ? 'Save changes' : 'Add address'} onPress={handleSubmit} loading={isSubmitting} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
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
  labelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  labelChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    alignItems: 'center',
  },
  labelChipActive: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginTop: spacing.lg,
  },
  locateButtonGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  locateLabel: { marginLeft: spacing.sm },
  submit: { marginTop: spacing.md },
});
