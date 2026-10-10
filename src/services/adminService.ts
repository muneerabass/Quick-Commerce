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

export async function listProducts(): Promise<AdminProduct[]> {
  const response = await api.get<{ products: AdminProduct[] }>('/admin/products', { auth: true });
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
  name: string;
  description?: string | null;
  /** Paise (minor units). */
  price: number;
  image_url?: string | null;
  category_id?: string | null;
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
