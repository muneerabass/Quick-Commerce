import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, PressableScale } from '../../components';
import { addressPickerBus, PickedLocation } from '../../services/addressPickerBus';
import { colors, layout, radius, shadows, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'AddressMapPicker'>;

const DEFAULT_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

/**
 * Blinkit-style drop-off picker. The map pans under a fixed centre pin; whatever
 * the centre is on confirm becomes the pick. We debounce reverse-geocoding so
 * every frame of panning doesn't hit the geocoder.
 */
export function AddressMapPickerScreen({ navigation, route }: Props) {
  const initialLat = route.params?.initialLatitude ?? DEFAULT_REGION.latitude;
  const initialLng = route.params?.initialLongitude ?? DEFAULT_REGION.longitude;

  const [region, setRegion] = useState<Region>({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [picked, setPicked] = useState<PickedLocation>({
    latitude: initialLat,
    longitude: initialLng,
  });
  const [isResolving, setIsResolving] = useState(false);
  const [addressLine, setAddressLine] = useState<string>('Move the map to pick a spot');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsResolving(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const hit = results[0];
      if (!hit) {
        setAddressLine('Dropped pin');
        setPicked({ latitude: lat, longitude: lng });
        return;
      }
      const line1 = [hit.name, hit.street].filter(Boolean).join(', ');
      const summary = [line1, hit.city, hit.region, hit.postalCode].filter(Boolean).join(' · ');
      setAddressLine(summary || 'Dropped pin');
      setPicked({
        latitude: lat,
        longitude: lng,
        address_line1: line1 || undefined,
        city: hit.city ?? undefined,
        state: hit.region ?? undefined,
        pincode: hit.postalCode ?? undefined,
      });
    } catch {
      setAddressLine('Dropped pin');
      setPicked({ latitude: lat, longitude: lng });
    } finally {
      setIsResolving(false);
    }
  }, []);

  useEffect(() => {
    void reverseGeocode(initialLat, initialLng);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [initialLat, initialLng, reverseGeocode]);

  const handleRegionChange = useCallback(
    (next: Region) => {
      setRegion(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void reverseGeocode(next.latitude, next.longitude);
      }, 350);
    },
    [reverseGeocode],
  );

  const handleUseMyLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const next: Region = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(next, 400);
  }, []);

  const handleConfirm = useCallback(() => {
    addressPickerBus.set(picked);
    navigation.goBack();
  }, [navigation, picked]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Fixed centre pin — stays put while the map pans beneath it. */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <View style={styles.pinShadow} />
        <Ionicons name="location" size={44} color={colors.primary} />
      </View>

      <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={[styles.circleButton, styles.back]}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </PressableScale>

      <PressableScale onPress={handleUseMyLocation} scaleTo={0.9} haptic="none" style={[styles.circleButton, styles.locate]}>
        <Ionicons name="locate" size={20} color={colors.primary} />
      </PressableScale>

      <View style={styles.sheet}>
        <AppText variant="captionStrong" color="textTertiary">
          DELIVERING TO
        </AppText>
        <View style={styles.sheetRow}>
          <AppText variant="bodyStrong" numberOfLines={2} style={styles.sheetAddress}>
            {addressLine}
          </AppText>
          {isResolving ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
        <AppText variant="caption" color="textTertiary" style={styles.sheetCoords}>
          {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
        </AppText>
        <Button label="Confirm location" onPress={handleConfirm} style={styles.confirm} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -44,
    alignItems: 'center',
    zIndex: 2,
  },
  pinShadow: {
    position: 'absolute',
    bottom: 4,
    width: 10,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  circleButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    zIndex: 3,
  },
  back: { top: spacing.lg + 44, left: layout.gutter },
  locate: { bottom: 240, right: layout.gutter },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: layout.gutter,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadows.floating,
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  sheetAddress: { flex: 1, marginRight: spacing.md },
  sheetCoords: { marginTop: spacing.xs },
  confirm: { marginTop: spacing.lg },
});
