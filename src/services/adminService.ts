import { api } from './apiClient';
import { AdminProduct, Inventory, Store, User } from '../types';

export interface CategoryRow {
  id: string;
  name: string;
  created_at: string;
}

export async function listStores(): Promise<Store[]> {
  const response = await api.get<{ stores: Store[] }>('/admin/stores', { auth: true });
  return response.stores ?? [];
}

export async function listProducts(storeId?: string): Promise<AdminProduct[]> {
  // Products are strictly per-store; scope the list to the active store.
  const path = storeId ? `/admin/products?store_id=${encodeURIComponent(storeId)}` : '/admin/products';
  const response = await api.get<{ products: AdminProduct[] }>(path, { auth: true });
  return response.products ?? [];
}

export async function listInventory(storeId: string): Promise<Inventory[]> {
  const response = await api.get<{ inventory: Inventory[] }>(`/admin/stores/${storeId}/inventory`, { auth: true });
  return response.inventory ?? [];
}

export async function listCategories(): Promise<CategoryRow[]> {
  const response = await api.get<{ categories: CategoryRow[] }>('/admin/categories', { auth: true });
  return response.categories ?? [];
}

export interface StoreInput {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

export interface ProductInput {
  /** Required on create: the store this product belongs to. */
  store_id?: string;
  name: string;
  description?: string | null;
  /** Paise (minor units). */
  price: number;
  image_url?: string | null;
  /** All product image URLs (cover first). */
  images?: string[];
  category_id?: string | null;
  /** Initial stock for this product at its store (create only). */
  quantity?: number;
}

export async function createStore(input: StoreInput): Promise<Store> {
  return api.post<Store>('/admin/stores', input, { auth: true });
}

export async function updateStore(storeId: string, input: Partial<StoreInput>): Promise<Store> {
  return api.patch<Store>(`/admin/stores/${storeId}`, input, { auth: true });
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  return api.post<AdminProduct>('/admin/products', input, { auth: true });
}

export async function updateProduct(productId: string, input: Partial<ProductInput>): Promise<AdminProduct> {
  return api.patch<AdminProduct>(`/admin/products/${productId}`, input, { auth: true });
}

export async function setInventory(storeId: string, productId: string, quantity: number): Promise<Inventory> {
  return api.put<Inventory>(`/admin/stores/${storeId}/inventory/${productId}`, { quantity }, { auth: true });
}

export async function createDeliveryUser(phone: string, name?: string): Promise<User> {
  return api.post<User>('/admin/delivery-users', { phone, name: name ?? null }, { auth: true });
}

export async function assignDelivery(deliveryId: string, storeId: string): Promise<void> {
  await api.put<void>(`/admin/delivery-users/${deliveryId}/stores/${storeId}`, undefined, { auth: true });
}

export async function removeDeliveryAssignment(deliveryId: string, storeId: string): Promise<void> {
  await api.delete<void>(`/admin/delivery-users/${deliveryId}/stores/${storeId}`, { auth: true });
}
