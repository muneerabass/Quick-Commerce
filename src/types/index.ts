/** Domain models. These mirror the shapes a real API is expected to return in Phase 2. */

export interface Product {
  id: string;
  name: string;
  /** Pack size shown under the name, e.g. "1 L", "500 g", "6 pcs". */
  quantity: string;
  price: number;
  /** Pre-discount price. Omitted when the product is not discounted. */
  originalPrice?: number;
  /** Whole-number percentage off. Derived at build time from the two prices. */
  discount?: number;
  image: string;
  /** Emoji shown if the remote image fails — guarantees we never render an empty box. */
  emoji: string;
  categoryId: string;
  /** Delivery/stock copy used on the details screen. */
  deliveryEta: string;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  description: string;
  tags: ProductTag[];
}

export type ProductTag = 'bestseller' | 'fresh' | 'new' | 'organic' | 'low-stock';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  image: string;
  /** Soft background tint for the category tile. */
  tint: string;
  itemCount: number;
}

export interface ProductSectionData {
  id: string;
  title: string;
  subtitle?: string;
  productIds: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  /** ISO string. */
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}
