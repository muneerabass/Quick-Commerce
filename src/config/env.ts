import { Platform } from 'react-native';

const DEFAULT_HOST = Platform.select({
  // Android emulator cannot reach host machine via localhost.
  android: 'http://10.0.2.2:3000/api/v1',
  // iOS simulator shares the host loopback.
  ios: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST!;

/** Enable dev-only affordances (e.g., auto-fetching last OTP). */
export const IS_DEV = false;
