import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { storage, StorageKeys } from '../services/storage';

interface AuthState {
  /** True until the persisted session has been read from disk. */
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  user: User | null;
  token: string | null;
}

type AuthAction =
  | { type: 'bootstrapped'; payload: { user: User; token: string } | null }
  | { type: 'submitting'; payload: boolean }
  | { type: 'authenticated'; payload: { user: User; token: string } }
  | { type: 'signedOut' }
  | { type: 'userUpdated'; payload: Partial<User> };

const initialState: AuthState = {
  isBootstrapping: true,
  isAuthenticated: false,
  isSubmitting: false,
  user: null,
  token: null,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'bootstrapped':
      return {
        ...state,
        isBootstrapping: false,
        isAuthenticated: !!action.payload,
        user: action.payload?.user ?? null,
        token: action.payload?.token ?? null,
      };
    case 'submitting':
      return { ...state, isSubmitting: action.payload };
    case 'authenticated':
      return {
        ...state,
        isSubmitting: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'signedOut':
      return { ...state, isAuthenticated: false, user: null, token: null, isSubmitting: false };
    case 'userUpdated':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (phone: string) => Promise<void>;
  signup: (input: { name: string; phone: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore the persisted session once, on mount. The splash screen waits on this.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [user, token] = await Promise.all([
        storage.get<User>(StorageKeys.authUser),
        storage.get<string>(StorageKeys.authToken),
      ]);
      if (cancelled) return;
      dispatch({ type: 'bootstrapped', payload: user && token ? { user, token } : null });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (session: authService.AuthSession) => {
    await Promise.all([
      storage.set(StorageKeys.authUser, session.user),
      storage.set(StorageKeys.authToken, session.token),
    ]);
    dispatch({ type: 'authenticated', payload: session });
  }, []);

  const login = useCallback(
    async (phone: string) => {
      dispatch({ type: 'submitting', payload: true });
      try {
        const session = await authService.login(phone);
        await persistSession(session);
      } catch (error) {
        dispatch({ type: 'submitting', payload: false });
        throw error;
      }
    },
    [persistSession],
  );

  const signup = useCallback(
    async (input: { name: string; phone: string; email?: string }) => {
      dispatch({ type: 'submitting', payload: true });
      try {
        const session = await authService.signup(input);
        await persistSession(session);
      } catch (error) {
        dispatch({ type: 'submitting', payload: false });
        throw error;
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await storage.remove(StorageKeys.authUser, StorageKeys.authToken);
    dispatch({ type: 'signedOut' });
  }, []);

  const updateUser = useCallback(
    async (patch: Partial<User>) => {
      if (!state.user) return;
      const next = { ...state.user, ...patch };
      await storage.set(StorageKeys.authUser, next);
      dispatch({ type: 'userUpdated', payload: patch });
    },
    [state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, signup, logout, updateUser }),
    [state, login, signup, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
