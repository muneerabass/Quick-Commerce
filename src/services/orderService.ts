import { api } from './apiClient';
import { Order } from '../types';

export async function createOrder(addressId: string): Promise<Order> {
  return api.post<Order>('/orders', { address_id: addressId }, { auth: true });
}

export async function listOrders(): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>('/orders', { auth: true });
  return response.orders ?? [];
}

export async function getOrder(orderId: string): Promise<Order> {
  return api.get<Order>(`/orders/${orderId}`, { auth: true });
}
