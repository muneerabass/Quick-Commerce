import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

/** Bengaluru fallback when the user denies location. */
const FALLBACK = { latitude: 12.9716, longitude: 77.5946 };

export type LocationStatus = 'loading' | 'granted' | 'fallback' | 'error';

export interface LocationState {
  latitude: number;
  longitude: number;
  status: LocationStatus;
  isFallback: boolean;
}

/**
 * Resolves the user's current location once per mount. On denial / failure
 * returns the fallback coords and marks `isFallback` so the UI can hint it.
 */
export function useUserLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: FALLBACK.latitude,
    longitude: FALLBACK.longitude,
    status: 'loading',
    isFallback: true,
  });

  useEffect(() => {
    let cancelled = false;
    // Simulators and devices with no GPS fix can leave `getCurrentPositionAsync`
    // hanging forever. Fall back to the city coords after 4 s so the catalog can load.
    const fallbackTimer = setTimeout(() => {
      if (cancelled) return;
      setState((prev) => (prev.status === 'loading' ? { ...FALLBACK, status: 'fallback', isFallback: true } : prev));
    }, 4000);

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          clearTimeout(fallbackTimer);
          setState({ ...FALLBACK, status: 'fallback', isFallback: true });
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        clearTimeout(fallbackTimer);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status: 'granted',
          isFallback: false,
        });
      } catch {
        if (!cancelled) {
          clearTimeout(fallbackTimer);
          setState({ ...FALLBACK, status: 'error', isFallback: true });
        }
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, []);

  return state;
}
