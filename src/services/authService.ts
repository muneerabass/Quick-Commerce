import { api } from './apiClient';
import { AuthResponse, User } from '../types';

export async function sendOtp(phone: string): Promise<void> {
  await api.post<{ message: string }>('/auth/send-otp', { phone });
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/verify-otp', { phone, otp });
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post<void>('/auth/logout', { refresh_token: refreshToken });
}

export async function logoutAll(): Promise<void> {
  await api.post<void>('/auth/logout-all', undefined, { auth: true });
}

export async function getMe(): Promise<User> {
  return api.get<User>('/users/me/', { auth: true });
}

export async function updateProfile(name: string | null): Promise<User> {
  return api.patch<User>('/users/me/', { name }, { auth: true });
}

/** Dev-only: fetch the most recent OTP for a phone. 404 if none / disabled. */
export async function getLastDevOtp(phone: string): Promise<string | null> {
  try {
    const response = await api.get<{ otp: string }>('/auth/dev/last-otp', { query: { phone } });
    return response.otp;
  } catch {
    return null;
  }
}
