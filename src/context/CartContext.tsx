import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import * as cartService from '../services/cartService';
import { ApiError } from '../services/apiClient';
import { Cart, CartLine, Product } from '../types';
import { useAuth } from './AuthContext';

/** Display-only — the backend's total_amount is authoritative. */
export const FREE_DELIVERY_THRESHOLD_PAISE = 19900;
export const DELIVERY_FEE_PAISE = 2500;
const HANDLING_FEE_PAISE = 400;

export interface CartTotals {
  itemCount: number;
  /** Items subtotal in paise. */
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  amountToFreeDelivery: number;
}

interface CartContextValue {
  isHydrated: boolean;
  isMutating: boolean;
  cart: Cart | null;
  items: CartLine[];
  totals: CartTotals;
  addItem: (product: Product) => Promise<void>;
  decrementByProductId: (productId: string) => Promise<void>;
  incrementLine: (line: CartLine) => Promise<void>;
  decrementLine: (line: CartLine) => Promise<void>;
  removeLine: (line: CartLine) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  getQuantity: (productId: string) => number;
  getLineByProductId: (productId: string) => CartLine | undefined;
}

const EMPTY_CART: Cart = { id: '', items: [], total_amount: 0 };

const CartContext = createContext<CartContextValue | undefined>(undefined);

function computeTotals(cart: Cart | null): CartTotals {
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart?.total_amount ?? 0;
  const isEmpty = itemCount === 0;
  const deliveryFee = isEmpty || subtotal >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_FEE_PAISE;
  const handlingFee = isEmpty ? 0 : HANDLING_FEE_PAISE;
  return {
    itemCount,
    subtotal,
    deliveryFee,
    handlingFee,
    total: subtotal + deliveryFee + handlingFee,
    amountToFreeDelivery: isEmpty ? 0 : Math.max(0, FREE_DELIVERY_THRESHOLD_PAISE - subtotal),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // Only customers have carts; admins/delivery don't interact with it.
  const canHaveCart = isAuthenticated && user?.role === 'customer';

  const refresh = useCallback(async () => {
    if (!canHaveCart) {
      setCart(null);
      setIsHydrated(true);
      return;
    }
    try {
      const next = await cartService.getCart();
      setCart(next);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setIsHydrated(true);
    }
  }, [canHaveCart]);

  useEffect(() => {
    setIsHydrated(false);
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (product: Product) => {
      if (!canHaveCart) return;
      setIsMutating(true);
      try {
        const next = await cartService.addCartItem(product.store_id, product.id, 1);
        setCart(next);
      } catch (error) {
        if (error instanceof ApiError && /only one store/i.test(error.message)) {
          // Offer to wipe the existing cart and switch stores.
          await new Promise<void>((resolve) => {
            Alert.alert(
              'Switch store?',
              'Your cart has items from a different store. Clear it to add this product?',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
                {
                  text: 'Clear & switch',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await cartService.clearCart();
                      const next = await cartService.addCartItem(product.store_id, product.id, 1);
                      setCart(next);
                    } catch (e) {
                      Alert.alert('Could not switch', e instanceof Error ? e.message : 'Try again.');
                    } finally {
                      resolve();
                    }
                  },
                },
              ],
            );
          });
        } else {
          Alert.alert('Could not add item', error instanceof Error ? error.message : 'Try again.');
        }
      } finally {
        setIsMutating(false);
      }
    },
    [canHaveCart],
  );

  const incrementLine = useCallback(
    async (line: CartLine) => {
      if (!canHaveCart) return;
      setIsMutating(true);
      try {
        const next = await cartService.updateCartItem(line.id, line.quantity + 1);
        setCart(next);
      } catch (error) {
        Alert.alert('Could not update item', error instanceof Error ? error.message : 'Try again.');
      } finally {
        setIsMutating(false);
      }
    },
    [canHaveCart],
  );

  const decrementLine = useCallback(
    async (line: CartLine) => {
      if (!canHaveCart) return;
      setIsMutating(true);
      try {
        if (line.quantity <= 1) {
          const next = await cartService.deleteCartItem(line.id);
          setCart(next);
        } else {
          const next = await cartService.updateCartItem(line.id, line.quantity - 1);
          setCart(next);
        }
      } catch (error) {
        Alert.alert('Could not update item', error instanceof Error ? error.message : 'Try again.');
      } finally {
        setIsMutating(false);
      }
    },
    [canHaveCart],
  );

  const removeLine = useCallback(
    async (line: CartLine) => {
      if (!canHaveCart) return;
      setIsMutating(true);
      try {
        const next = await cartService.deleteCartItem(line.id);
        setCart(next);
      } finally {
        setIsMutating(false);
      }
    },
    [canHaveCart],
  );

  const clearCart = useCallback(async () => {
    if (!canHaveCart) return;
    setIsMutating(true);
    try {
      await cartService.clearCart();
      setCart(EMPTY_CART);
    } finally {
      setIsMutating(false);
    }
  }, [canHaveCart]);

  const lineMap = useMemo(() => {
    const map = new Map<string, CartLine>();
    (cart?.items ?? []).forEach((line) => map.set(line.product_id, line));
    return map;
  }, [cart]);

  const decrementByProductId = useCallback(
    async (productId: string) => {
      const line = lineMap.get(productId);
      if (line) await decrementLine(line);
    },
    [decrementLine, lineMap],
  );

  const totals = useMemo(() => computeTotals(cart), [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      isHydrated,
      isMutating,
      cart,
      items: cart?.items ?? [],
      totals,
      addItem,
      decrementByProductId,
      incrementLine,
      decrementLine,
      removeLine,
      clearCart,
      refresh,
      getQuantity: (productId) => lineMap.get(productId)?.quantity ?? 0,
      getLineByProductId: (productId) => lineMap.get(productId),
    }),
    [addItem, cart, clearCart, decrementByProductId, decrementLine, incrementLine, isHydrated, isMutating, lineMap, refresh, removeLine, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>.');
  return ctx;
}

export function useCartQuantity(productId: string): number {
  const { getQuantity } = useCart();
  return getQuantity(productId);
}
