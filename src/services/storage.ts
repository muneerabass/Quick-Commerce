import AsyncStorage from '@react-native-async-storage/async-storage';

/** Namespaced so a future multi-tenant/staging build cannot collide. */
const PREFIX = '@zipp/';

export const StorageKeys = {
  authUser: `${PREFIX}auth_user`,
  authToken: `${PREFIX}auth_token`,
  authRefreshToken: `${PREFIX}auth_refresh_token`,
  recentSearches: `${PREFIX}recent_searches`,
  activeStoreId: `${PREFIX}active_store_id`,
  adminActiveStoreId: `${PREFIX}admin_active_store_id`,
} as const;

/**
 * Thin typed wrapper over AsyncStorage. Every read is defensive: a corrupt or
 * partially-written value must never crash the app on launch.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage failures are non-fatal — the app stays usable for this session.
    }
  },

  async remove(...keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch {
      // no-op
    }
  },
};
