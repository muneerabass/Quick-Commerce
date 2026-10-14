import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as adminService from '../services/adminService';
import { CategoryRow } from '../services/adminService';
import { storage, StorageKeys } from '../services/storage';
import { AdminProduct, Inventory, Store } from '../types';

const LOW_STOCK_LIMIT = 8;

interface AdminContextValue {
  isHydrated: boolean;
  isRefreshing: boolean;
  stores: Store[];
  activeStore: Store | null;
  products: AdminProduct[];
  categories: CategoryRow[];
  /** Keyed by product_id for the active store. */
  inventory: Map<string, number>;
  lowStockLimit: number;
  lowStockProducts: AdminProduct[];
  outOfStockProducts: AdminProduct[];
  selectStore: (storeId: string) => void;
  refresh: () => Promise<void>;
  saveStore: (
    input: adminService.StoreInput,
    existingId?: string,
  ) => Promise<Store>;
  saveProduct: (
    input: adminService.ProductInput,
    existingId?: string,
  ) => Promise<AdminProduct>;
  setInventoryFor: (productId: string, quantity: number) => Promise<void>;
  createDeliveryUser: (phone: string, name?: string) => Promise<void>;
  assignDelivery: (deliveryId: string) => Promise<void>;
  removeDeliveryAssignment: (deliveryId: string) => Promise<void>;
  getProduct: (productId: string) => AdminProduct | undefined;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

/**
 * Attaches the live inventory count to each product for the currently selected store.
 * Products without a row in `inventory` are treated as 0-stock.
 */
function withQuantity(products: AdminProduct[], inventory: Inventory[]): AdminProduct[] {
  const map = new Map<string, number>();
  inventory.forEach((row) => map.set(row.product_id, row.quantity));
  return products.map((p) => ({ ...p, quantity: map.get(p.id) ?? 0 }));
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Products are strictly per-store, so items AND their stock load together for
  // the selected store. Switching store reloads both.
  const loadStoreData = useCallback(async (storeId: string | null) => {
    if (!storeId) {
      setInventory([]);
      setProducts([]);
      return;
    }
    const [productsList, inventoryList] = await Promise.all([
      adminService.listProducts(storeId).catch(() => [] as typeof products),
      adminService.listInventory(storeId).catch(() => [] as Inventory[]),
    ]);
    setProducts(productsList);
    setInventory(inventoryList);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [storesList, categoriesList, savedStoreId] = await Promise.all([
        adminService.listStores(),
        adminService.listCategories().catch(() => []),
        storage.get<string>(StorageKeys.adminActiveStoreId),
      ]);
      setStores(storesList);
      setCategories(categoriesList);
      const next = savedStoreId && storesList.some((s) => s.id === savedStoreId)
        ? savedStoreId
        : storesList[0]?.id ?? null;
      setActiveStoreId(next);
      await loadStoreData(next);
    } finally {
      setIsHydrated(true);
      setIsRefreshing(false);
    }
  }, [loadStoreData]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectStore = useCallback(
    (storeId: string) => {
      setActiveStoreId(storeId);
      void storage.set(StorageKeys.adminActiveStoreId, storeId);
      void loadStoreData(storeId);
    },
    [loadStoreData],
  );

  const saveStore = useCallback(
    async (input: adminService.StoreInput, existingId?: string) => {
      const store = existingId
        ? await adminService.updateStore(existingId, input)
        : await adminService.createStore(input);
      await refresh();
      return store;
    },
    [refresh],
  );

  const saveProduct = useCallback(
    async (input: adminService.ProductInput, existingId?: string) => {
      const product = existingId
        ? await adminService.updateProduct(existingId, input)
        : await adminService.createProduct({ ...input, store_id: activeStoreId ?? undefined });
      await loadStoreData(activeStoreId);
      return product;
    },
    [activeStoreId, loadStoreData],
  );

  const setInventoryFor = useCallback(
    async (productId: string, quantity: number) => {
      if (!activeStoreId) return;
      await adminService.setInventory(activeStoreId, productId, quantity);
      await loadStoreData(activeStoreId);
    },
    [activeStoreId, loadStoreData],
  );

  const createDeliveryUser = useCallback(
    async (phone: string, name?: string) => {
      const user = await adminService.createDeliveryUser(phone, name);
      if (activeStoreId) {
        await adminService.assignDelivery(user.id, activeStoreId);
      }
    },
    [activeStoreId],
  );

  const assignDelivery = useCallback(
    async (deliveryId: string) => {
      if (!activeStoreId) return;
      await adminService.assignDelivery(deliveryId, activeStoreId);
    },
    [activeStoreId],
  );

  const removeDeliveryAssignment = useCallback(
    async (deliveryId: string) => {
      if (!activeStoreId) return;
      await adminService.removeDeliveryAssignment(deliveryId, activeStoreId);
    },
    [activeStoreId],
  );

  const productsWithQty = useMemo(() => withQuantity(products, inventory), [products, inventory]);

  const value = useMemo<AdminContextValue>(() => {
    const lowStockProducts = productsWithQty.filter(
      (p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= LOW_STOCK_LIMIT,
    );
    const outOfStockProducts = productsWithQty.filter((p) => (p.quantity ?? 0) === 0);
    const inventoryMap = new Map<string, number>();
    inventory.forEach((row) => inventoryMap.set(row.product_id, row.quantity));
    return {
      isHydrated,
      isRefreshing,
      stores,
      activeStore: stores.find((s) => s.id === activeStoreId) ?? null,
      products: productsWithQty,
      categories,
      inventory: inventoryMap,
      lowStockLimit: LOW_STOCK_LIMIT,
      lowStockProducts,
      outOfStockProducts,
      selectStore,
      refresh,
      saveStore,
      saveProduct,
      setInventoryFor,
      createDeliveryUser,
      assignDelivery,
      removeDeliveryAssignment,
      getProduct: (productId) => productsWithQty.find((p) => p.id === productId),
    };
  }, [
    activeStoreId,
    assignDelivery,
    categories,
    createDeliveryUser,
    inventory,
    isHydrated,
    isRefreshing,
    productsWithQty,
    refresh,
    removeDeliveryAssignment,
    saveProduct,
    saveStore,
    selectStore,
    setInventoryFor,
    stores,
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>.');
  return context;
}
