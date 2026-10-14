import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { nearby } from '../services/catalogService';
import { listAddresses } from '../services/addressService';
import { storage, StorageKeys } from '../services/storage';
import { useUserLocation } from '../hooks/useUserLocation';
import { Address, NearbyStore, Product, Store } from '../types';

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
  /** Push a new delivery address so nearby stores re-fetch around it. */
  setDeliveryAddress: (address: Address | null) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function flatten(nearbyStores: NearbyStore[], storeId: string | null): Product[] {
  const entry = nearbyStores.find((s) => s.store.id === storeId);
  if (!entry) return [];
  return entry.products.map((p) => ({ ...p, store_id: entry.store.id }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const gps = useUserLocation();
  // Delivery address coords take priority over GPS for the nearby query.
  const [deliveryAddress, setDeliveryAddressState] = useState<Address | null>(null);
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

  // Load the default delivery address on mount so the nearby query is address-based.
  useEffect(() => {
    (async () => {
      try {
        const addresses = await listAddresses();
        const def = addresses.find((a) => a.is_default) ?? addresses[0] ?? null;
        setDeliveryAddressState(def);
      } catch {
        // No addresses yet — fall back to GPS silently.
      }
    })();
  }, []);

  // Resolved coords: prefer delivery address lat/lng, fall back to GPS.
  const queryLat = (deliveryAddress?.latitude != null ? deliveryAddress.latitude : null) ?? gps.latitude;
  const queryLng = (deliveryAddress?.longitude != null ? deliveryAddress.longitude : null) ?? gps.longitude;
  const locationReady = deliveryAddress != null || gps.status !== 'loading';

  const load = useCallback(
    async (silent = false) => {
      if (!locationReady) return;
      if (silent) setIsRefreshing(true); else setIsLoading(true);
      setError(null);
      try {
        const list = await nearby({
          latitude: queryLat,
          longitude: queryLng,
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
    [locationReady, queryLat, queryLng],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const selectStore = useCallback((storeId: string) => {
    setActiveStoreId(storeId);
    void storage.set(StorageKeys.activeStoreId, storeId);
  }, []);

  const setDeliveryAddress = useCallback((address: Address | null) => {
    setDeliveryAddressState(address);
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
      isFallbackLocation: gps.isFallback && deliveryAddress == null,
      setDeliveryAddress,
    }),
    [activeStoreId, deliveryAddress, error, gps.isFallback, isLoading, isRefreshing, load, nearbyStores, products, selectStore, setDeliveryAddress],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>.');
  return ctx;
}
