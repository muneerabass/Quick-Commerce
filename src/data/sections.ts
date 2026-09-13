import { Product, ProductSectionData } from '../types';
import { products } from './products';

const byTag = (tag: string) => products.filter((p) => p.tags.includes(tag as never));
const byCategory = (id: string) => products.filter((p) => p.categoryId === id);
const ids = (list: Product[], limit = 10) => list.slice(0, limit).map((p) => p.id);

/**
 * Home rails. In Phase 2 these come from a merchandising endpoint; the screen only
 * ever reads `ProductSectionData`, so the swap is a one-line change.
 */
export const homeSections: ProductSectionData[] = [
  {
    id: 'fresh-picks',
    title: 'Fresh picks for you',
    subtitle: 'Sourced this morning',
    productIds: ids(byTag('fresh').concat(byCategory('fruits-vegetables'))),
  },
  {
    id: 'most-bought',
    title: 'Most bought in Nagpur',
    subtitle: 'What your neighbours are ordering',
    productIds: ids(byTag('bestseller')),
  },
  {
    id: 'snacks-drinks',
    title: 'Snacks & beverages',
    subtitle: 'Sorted for tonight',
    productIds: ids(byCategory('snacks').concat(byCategory('beverages'))),
  },
  {
    id: 'daily-essentials',
    title: 'Daily essentials',
    subtitle: 'The things you always run out of',
    productIds: ids(byCategory('dairy-eggs').concat(byCategory('bakery'), byCategory('staples'))),
  },
  {
    id: 'home-care',
    title: 'Home & personal care',
    productIds: ids(byCategory('personal-care').concat(byCategory('household'))),
  },
];

/** Seeded suggestions for the empty state of the search screen. */
export const popularSearches: string[] = [
  'Milk',
  'Banana',
  'Bread',
  'Eggs',
  'Chips',
  'Curd',
  'Onion',
  'Cold drinks',
  'Ice cream',
  'Paneer',
];
