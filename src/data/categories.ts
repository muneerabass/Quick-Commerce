import { Category } from '../types';
import { IMG, img } from './images';

/**
 * Category catalogue. Phase 2 replaces this module with a `GET /categories` call —
 * nothing in the UI reads anything beyond the `Category` shape.
 */
export const categories: Category[] = [
  { id: 'fruits-vegetables', name: 'Fruits & Vegetables', emoji: '🥬', image: img(IMG.produceMarket, 300), tint: '#EAF7EC', itemCount: 412 },
  { id: 'dairy-eggs', name: 'Dairy & Eggs', emoji: '🥛', image: img(IMG.milk, 300), tint: '#EEF3FE', itemCount: 268 },
  { id: 'snacks', name: 'Snacks & Munchies', emoji: '🍪', image: img(IMG.chips, 300), tint: '#FFF4E6', itemCount: 534 },
  { id: 'beverages', name: 'Cold Drinks & Juices', emoji: '🥤', image: img(IMG.cola, 300), tint: '#FDEDF0', itemCount: 316 },
  { id: 'bakery', name: 'Bakery & Biscuits', emoji: '🍞', image: img(IMG.bread, 300), tint: '#FBF1E3', itemCount: 189 },
  { id: 'staples', name: 'Atta, Rice & Dal', emoji: '🍚', image: img(IMG.rice, 300), tint: '#F4F1E8', itemCount: 226 },
  { id: 'personal-care', name: 'Personal Care', emoji: '🧴', image: img(IMG.soap, 300), tint: '#F0EEFB', itemCount: 478 },
  { id: 'household', name: 'Home & Cleaning', emoji: '🧹', image: img(IMG.detergent, 300), tint: '#E9F5F7', itemCount: 352 },
  { id: 'chocolates', name: 'Sweet Tooth', emoji: '🍫', image: img(IMG.chocolateBar, 300), tint: '#F6EEE9', itemCount: 143 },
  { id: 'ice-cream', name: 'Ice Cream & Frozen', emoji: '🍦', image: img(IMG.iceCream, 300), tint: '#EDF4FB', itemCount: 121 },
  { id: 'meat', name: 'Meat & Fish', emoji: '🍗', image: img(IMG.chickenBreast, 300), tint: '#FCEEEC', itemCount: 87 },
  { id: 'pet-care', name: 'Pet Care', emoji: '🐶', image: img(IMG.puppy, 300), tint: '#F2F0EA', itemCount: 64 },
];

const categoryIndex = new Map(categories.map((c) => [c.id, c]));

export function getCategoryById(id: string): Category | undefined {
  return categoryIndex.get(id);
}

export function getCategoryName(id: string): string {
  return categoryIndex.get(id)?.name ?? 'Groceries';
}
