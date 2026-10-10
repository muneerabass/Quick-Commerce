import { api } from './apiClient';
import { Address } from '../types';

export interface AddressInput {
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_instructions?: string | null;
  is_default?: boolean;
}

export async function listAddresses(): Promise<Address[]> {
  const response = await api.get<{ addresses: Address[] }>('/users/me/addresses', { auth: true });
  return response.addresses ?? [];
}

export async function createAddress(input: AddressInput): Promise<Address> {
  return api.post<Address>('/users/me/addresses', input, { auth: true });
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  return api.patch<Address>(`/users/me/addresses/${id}`, input, { auth: true });
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete<void>(`/users/me/addresses/${id}`, { auth: true });
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return api.put<Address>(`/users/me/addresses/${id}/default`, undefined, { auth: true });
}

export interface GeocodeResponse {
  formatted_address: string;
  latitude: number;
  longitude: number;
}

export async function geocode(address: string): Promise<GeocodeResponse> {
  return api.post<GeocodeResponse>('/users/me/addresses/geocode', { address }, { auth: true });
}
