import { API_BASE_URL } from '../config/env';
import { storage, StorageKeys } from './storage';

export interface ApiErrorShape {
  status: number;
  code?: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor({ status, code, message }: ApiErrorShape) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Internal: skip refresh retry (used by the refresh call itself). */
  _skipRefresh?: boolean;
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Subscribe to global sign-out events (refresh failed → session dead). */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // listeners must not break others
    }
  });
}

let refreshInFlight: Promise<boolean> | null = null;

async function readAccessToken(): Promise<string | null> {
  return storage.get<string>(StorageKeys.authToken);
}

async function readRefreshToken(): Promise<string | null> {
  return storage.get<string>(StorageKeys.authRefreshToken);
}

/**
 * One-shot refresh; multiple parallel 401s share this promise so we never
 * fire the refresh endpoint twice (that would revoke our own session).
 */
async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = await readRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await rawRequest<{ access_token: string; refresh_token: string }>(
        '/auth/refresh',
        { method: 'POST', body: { refresh_token: refreshToken }, _skipRefresh: true },
      );
      await Promise.all([
        storage.set(StorageKeys.authToken, response.access_token),
        storage.set(StorageKeys.authRefreshToken, response.refresh_token),
      ]);
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (!query) return `${base}${suffix}`;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  if (!params) return `${base}${suffix}`;
  return `${base}${suffix}${suffix.includes('?') ? '&' : '?'}${params}`;
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, query } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await readAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  let parsed: any = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: text };
    }
  }
  if (!response.ok) {
    const message = (parsed && parsed.error) || `Request failed with status ${response.status}`;
    throw new ApiError({ status: response.status, message });
  }
  return parsed as T;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth &&
      !options._skipRefresh
    ) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return rawRequest<T>(path, options);
      }
      // Refresh failed — tell the app to wipe local session.
      await storage.remove(
        StorageKeys.authUser,
        StorageKeys.authToken,
        StorageKeys.authRefreshToken,
      );
      emitUnauthorized();
    }
    throw error;
  }
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
