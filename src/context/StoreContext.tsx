import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { nearby } from '../services/catalogService';
import { storage, StorageKeys } from '../services/storage';
import { useUserLocation } from '../hooks/useUserLocation';
import { NearbyStore, Product, Store } from '../types';

interface StoreContextValue {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  stores: Store[];
  activeStore: Store | null;
  products: Product[];
  selectStore: (storeId: string) => void;
  refresh: () => Promise<void>;
  /** Lookup a product by id across the active store's catalog. */
  getProductById: (productId: string) => Product | undefined;
  /** True when the user denied / errored out on location. */
  isFallbackLocation: boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function flatten(nearbyStores: NearbyStore[], storeId: string | null): Product[] {
  const entry = nearbyStores.find((s) => s.store.id === storeId);
  if (!entry) return [];
  return entry.products.map((p) => ({ ...p, store_id: entry.store.id }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const location = useUserLocation();
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore the last-chosen store id, if any, before the first fetch resolves.
  useEffect(() => {
    (async () => {
      const saved = await storage.get<string>(StorageKeys.activeStoreId);
      if (saved) setActiveStoreId(saved);
    })();
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (location.status === 'loading') return;
      if (silent) setIsRefreshing(true); else setIsLoading(true);
      setError(null);
      try {
        const list = await nearby({
          latitude: location.latitude,
          longitude: location.longitude,
          radiusKm: 25,
        });
        setNearbyStores(list);
        setActiveStoreId((prev) => {
          if (prev && list.some((s) => s.store.id === prev)) return prev;
          return list[0]?.store.id ?? null;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load stores.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [location.latitude, location.longitude, location.status],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const selectStore = useCallback((storeId: string) => {
    setActiveStoreId(storeId);
    void storage.set(StorageKeys.activeStoreId, storeId);
  }, []);

  const products = useMemo(() => flatten(nearbyStores, activeStoreId), [activeStoreId, nearbyStores]);

  const value = useMemo<StoreContextValue>(
    () => ({
      isLoading,
      isRefreshing,
      error,
      stores: nearbyStores.map((s) => s.store),
      activeStore: nearbyStores.find((s) => s.store.id === activeStoreId)?.store ?? null,
      products,
      selectStore,
      refresh: () => load(true),
      getProductById: (productId) => products.find((p) => p.id === productId),
      isFallbackLocation: location.isFallback,
    }),
    [activeStoreId, error, isLoading, isRefreshing, load, location.isFallback, nearbyStores, products, selectStore],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>.');
  return ctx;
}
