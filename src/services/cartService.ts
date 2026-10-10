import { api } from './apiClient';
import { Cart } from '../types';

export async function getCart(): Promise<Cart> {
  return api.get<Cart>('/cart', { auth: true });
}

export async function addCartItem(storeId: string, productId: string, quantity: number): Promise<Cart> {
  return api.post<Cart>('/cart/items', { store_id: storeId, product_id: productId, quantity }, { auth: true });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return api.patch<Cart>(`/cart/items/${itemId}`, { quantity }, { auth: true });
}

export async function deleteCartItem(itemId: string): Promise<Cart> {
  return api.delete<Cart>(`/cart/items/${itemId}`, { auth: true });
}

export async function clearCart(): Promise<void> {
  await api.delete<void>('/cart', { auth: true });
}
