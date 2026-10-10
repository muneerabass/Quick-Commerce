import { api } from './apiClient';
import { NearbyStore } from '../types';

export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export async function nearby({ latitude, longitude, radiusKm = 10 }: NearbyQuery): Promise<NearbyStore[]> {
  const response = await api.get<{ stores: NearbyStore[] }>('/catalog/nearby', {
    query: { latitude, longitude, radius_km: radiusKm },
  });
  return response.stores ?? [];
}
