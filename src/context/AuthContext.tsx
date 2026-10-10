import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { User } from '../types';
import * as auth from '../services/authService';
import { storage, StorageKeys } from '../services/storage';
import { onUnauthorized } from '../services/apiClient';

interface AuthState {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  user: User | null;
}

type AuthAction =
  | { type: 'bootstrapped'; payload: User | null }
  | { type: 'submitting'; payload: boolean }
  | { type: 'authenticated'; payload: User }
  | { type: 'signedOut' }
  | { type: 'userUpdated'; payload: User };

const initialState: AuthState = {
  isBootstrapping: true,
  isAuthenticated: false,
  isSubmitting: false,
  user: null,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'bootstrapped':
      return {
        ...state,
        isBootstrapping: false,
        isAuthenticated: !!action.payload,
        user: action.payload,
      };
    case 'submitting':
      return { ...state, isSubmitting: action.payload };
    case 'authenticated':
      return { ...state, isSubmitting: false, isAuthenticated: true, user: action.payload };
    case 'signedOut':
      return { ...state, isAuthenticated: false, user: null, isSubmitting: false };
    case 'userUpdated':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<User>;
  updateProfile: (name: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function clearSession() {
  await storage.remove(
    StorageKeys.authUser,
    StorageKeys.authToken,
    StorageKeys.authRefreshToken,
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore persisted session once at launch. The splash screen is held until this resolves.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [user, token] = await Promise.all([
        storage.get<User>(StorageKeys.authUser),
        storage.get<string>(StorageKeys.authToken),
      ]);
      if (cancelled) return;
      dispatch({ type: 'bootstrapped', payload: user && token ? user : null });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Globally force sign-out if a refresh fails inside the API client.
  useEffect(
    () =>
      onUnauthorized(() => {
        dispatch({ type: 'signedOut' });
      }),
    [],
  );

  const sendOtp = useCallback(async (phone: string) => {
    dispatch({ type: 'submitting', payload: true });
    try {
      await auth.sendOtp(phone);
    } finally {
      dispatch({ type: 'submitting', payload: false });
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    dispatch({ type: 'submitting', payload: true });
    try {
      const response = await auth.verifyOtp(phone, otp);
      await Promise.all([
        storage.set(StorageKeys.authToken, response.access_token),
        storage.set(StorageKeys.authRefreshToken, response.refresh_token),
        storage.set(StorageKeys.authUser, response.user),
      ]);
      dispatch({ type: 'authenticated', payload: response.user });
      return response.user;
    } catch (error) {
      dispatch({ type: 'submitting', payload: false });
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (name: string | null) => {
    const user = await auth.updateProfile(name);
    await storage.set(StorageKeys.authUser, user);
    dispatch({ type: 'userUpdated', payload: user });
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const user = await auth.getMe();
      await storage.set(StorageKeys.authUser, user);
      dispatch({ type: 'userUpdated', payload: user });
    } catch {
      // if /me fails, let the interceptor handle session death
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await storage.get<string>(StorageKeys.authRefreshToken);
    if (refreshToken) {
      try {
        await auth.logout(refreshToken);
      } catch {
        // best-effort; local wipe still happens below
      }
    }
    await clearSession();
    dispatch({ type: 'signedOut' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, sendOtp, verifyOtp, updateProfile, logout, refreshMe }),
    [state, sendOtp, verifyOtp, updateProfile, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
