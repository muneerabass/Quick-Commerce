import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as deliveryService from '../services/deliveryService';
import { ApiError } from '../services/apiClient';
import { Order } from '../types';

const POLL_INTERVAL_MS = 20_000;

interface DeliveryContextValue {
  pending: Order[];
  active: Order[];
  history: Order[];
  /** A rider may hold only one active delivery at a time. */
  hasActiveOrder: boolean;
  isHydrated: boolean;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  /** Accepts an order. Returns the server error message on failure (e.g. busy). */
  accept: (orderId: string) => Promise<{ ok: boolean; message?: string }>;
  complete: (orderId: string) => Promise<{ ok: boolean; message?: string }>;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Order[]>([]);
  const [active, setActive] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [pendingList, activeList, historyList] = await Promise.all([
        deliveryService.listPendingOrders().catch(() => [] as Order[]),
        deliveryService.listMyOrders('accepted').catch(() => [] as Order[]),
        deliveryService.listMyOrders('completed').catch(() => [] as Order[]),
      ]);
      setPending(pendingList);
      setActive(activeList);
      setHistory(historyList);
    } finally {
      setIsHydrated(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshAll();
    timer.current = setInterval(() => void refreshAll(), POLL_INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refreshAll]);

  const accept = useCallback(
    async (orderId: string) => {
      try {
        await deliveryService.acceptOrder(orderId);
        await refreshAll();
        return { ok: true };
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Could not accept this order.';
        // Re-sync so a 409 (taken / already busy) reflects reality.
        await refreshAll();
        return { ok: false, message };
      }
    },
    [refreshAll],
  );

  const complete = useCallback(
    async (orderId: string) => {
      try {
        await deliveryService.completeOrder(orderId);
        await refreshAll();
        return { ok: true };
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Could not complete this order.';
        return { ok: false, message };
      }
    },
    [refreshAll],
  );

  const value = useMemo<DeliveryContextValue>(
    () => ({
      pending,
      active,
      history,
      hasActiveOrder: active.length > 0,
      isHydrated,
      isRefreshing,
      refreshAll,
      accept,
      complete,
    }),
    [accept, active, complete, history, isHydrated, isRefreshing, pending, refreshAll],
  );

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery(): DeliveryContextValue {
  const context = useContext(DeliveryContext);
  if (!context) throw new Error('useDelivery must be used inside <DeliveryProvider>.');
  return context;
}
