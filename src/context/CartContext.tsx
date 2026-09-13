import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { CartItem, Product } from '../types';
import { storage, StorageKeys } from '../services/storage';

/** Free delivery above this order value. Server-owned in Phase 2. */
export const FREE_DELIVERY_THRESHOLD = 199;
export const DELIVERY_FEE = 25;
const HANDLING_FEE = 4;
const MAX_PER_ITEM = 10;

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

type CartAction =
  | { type: 'hydrated'; payload: CartItem[] }
  | { type: 'add'; payload: Product }
  | { type: 'decrement'; payload: string }
  | { type: 'remove'; payload: string }
  | { type: 'setQuantity'; payload: { id: string; quantity: number } }
  | { type: 'clear' };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrated':
      return { items: action.payload, isHydrated: true };

    case 'add': {
      const existing = state.items.find((i) => i.product.id === action.payload.id);
      if (!existing) {
        return { ...state, items: [...state.items, { product: action.payload, quantity: 1 }] };
      }
      if (existing.quantity >= MAX_PER_ITEM) return state;
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      };
    }

    case 'decrement': {
      const existing = state.items.find((i) => i.product.id === action.payload);
      if (!existing) return state;
      if (existing.quantity <= 1) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.payload) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      };
    }

    case 'remove':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.payload) };

    case 'setQuantity': {
      const quantity = Math.max(0, Math.min(action.payload.quantity, MAX_PER_ITEM));
      if (quantity === 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.id ? { ...i, quantity } : i,
        ),
      };
    }

    case 'clear':
      return { ...state, items: [] };

    default:
      return state;
  }
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  /** Total pre-discount value, used to show "you saved". */
  savings: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  /** Rupees still needed to unlock free delivery; 0 once unlocked. */
  amountToFreeDelivery: number;
}

interface CartContextValue {
  items: CartItem[];
  isHydrated: boolean;
  totals: CartTotals;
  addItem: (product: Product) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** 0 when the product is not in the cart. */
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isHydrated: false });

  // Restore the cart from disk on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await storage.get<CartItem[]>(StorageKeys.cart);
      if (cancelled) return;
      dispatch({ type: 'hydrated', payload: Array.isArray(saved) ? saved : [] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after every change, but never before hydration or we'd wipe the saved cart.
  useEffect(() => {
    if (!state.isHydrated) return;
    void storage.set(StorageKeys.cart, state.items);
  }, [state.items, state.isHydrated]);

  /** Quantity lookup by id — avoids an O(n) scan inside every product card. */
  const quantityMap = useMemo(() => {
    const map = new Map<string, number>();
    state.items.forEach((i) => map.set(i.product.id, i.quantity));
    return map;
  }, [state.items]);

  const totals = useMemo<CartTotals>(() => {
    let itemCount = 0;
    let subtotal = 0;
    let originalTotal = 0;

    for (const item of state.items) {
      itemCount += item.quantity;
      subtotal += item.product.price * item.quantity;
      originalTotal += (item.product.originalPrice ?? item.product.price) * item.quantity;
    }

    const isEmpty = itemCount === 0;
    const deliveryFee = isEmpty || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const handlingFee = isEmpty ? 0 : HANDLING_FEE;

    return {
      itemCount,
      subtotal,
      savings: originalTotal - subtotal,
      deliveryFee,
      handlingFee,
      total: subtotal + deliveryFee + handlingFee,
      amountToFreeDelivery: isEmpty ? 0 : Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal),
    };
  }, [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      totals,
      addItem: (product) => dispatch({ type: 'add', payload: product }),
      decrementItem: (id) => dispatch({ type: 'decrement', payload: id }),
      removeItem: (id) => dispatch({ type: 'remove', payload: id }),
      setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', payload: { id, quantity } }),
      clearCart: () => dispatch({ type: 'clear' }),
      getQuantity: (id) => quantityMap.get(id) ?? 0,
    }),
    [state.items, state.isHydrated, totals, quantityMap],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>.');
  return ctx;
}

/**
 * Subscribes a component to a single product's quantity.
 * Product cards use this instead of reading the whole cart.
 */
export function useCartQuantity(productId: string): number {
  const { getQuantity } = useCart();
  return getQuantity(productId);
}
