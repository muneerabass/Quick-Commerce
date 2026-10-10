import { api } from './apiClient';
import { Order } from '../types';

export async function listPendingOrders(): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>('/delivery/orders', { auth: true });
  return response.orders ?? [];
}

export async function acceptOrder(orderId: string): Promise<Order> {
  return api.post<Order>(`/delivery/orders/${orderId}/accept`, undefined, { auth: true });
}

export async function completeOrder(orderId: string): Promise<Order> {
  return api.post<Order>(`/delivery/orders/${orderId}/complete`, undefined, { auth: true });
}
