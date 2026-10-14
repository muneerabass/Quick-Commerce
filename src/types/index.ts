/**
 * Domain types mirror the Go backend DTOs (quick-commerce/internal/dto/*).
 *
 * Monetary fields are integer paise (minor units); format with utils/price.
 * UUIDs are plain strings. Timestamps are ISO strings.
 */

export type UserRole = 'customer' | 'admin' | 'delivery';

export interface User {
  id: string;
  phone: string;
  name?: string | null;
  phone_verified_at?: string | null;
  status: string; // active | deleted
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  session_id: string;
}

/** Server-side product record returned by /catalog/nearby. */
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  /** Price in paise (minor units). */
  price: number;
  image_url?: string | null;
  /** All product images (cover first). Falls back to image_url when empty. */
  images?: string[] | null;
  category_id?: string | null;
  /** Inventory count at the current store context (0 if not stocked). */
  quantity: number;
  /** Filled in client-side so cart adds know which store a product belongs to. */
  store_id: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
  distance_km?: number;
}

export interface NearbyStore {
  store: Store;
  products: Omit<Product, 'store_id'>[];
}

/** Light client-side type used by the Categories/Home rails. */
export interface CategoryRef {
  id: string | null; // null = uncategorised bucket
  name: string;
  emoji: string;
  tint: string;
  productCount: number;
}

export interface Address {
  id: string;
  label: string; // "Home" | "Work" | "Other" | free text
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
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartLine {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number; // paise
  quantity: number;
  line_total: number; // paise
}

export interface Cart {
  id: string;
  store_id?: string | null;
  items: CartLine[];
  total_amount: number; // paise
}

export type OrderStatus = 'pending' | 'accepted' | 'completed';
export type PaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'cod';

export interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  store_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_amount: number;
  recipient_name: string;
  delivery_phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_instructions?: string | null;
  accepted_by?: string | null;
  accepted_at?: string | null;
  completed_at?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminStore extends Store {}

export interface AdminProduct {
  id: string;
  /** The store this product belongs to (products are strictly per-store). */
  store_id?: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  /** All product images (cover first). */
  images?: string[] | null;
  category_id?: string | null;
  /** Inventory at the admin's currently selected store, if known. */
  quantity?: number;
}

export interface Inventory {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
}
