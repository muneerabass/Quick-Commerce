import { colors } from '../theme';

/**
 * Pure cosmetics for category tiles. The backend only stores category name and id;
 * emoji + tint are a client-side look-up by (lower-case) name. "default" wins when
 * a category hasn't been styled yet, so new categories always have *some* look.
 */

export interface CategoryLook {
  emoji: string;
  tint: string;
}

const DEFAULT: CategoryLook = { emoji: '🛒', tint: colors.surfaceMuted };

const LOOKS: Record<string, CategoryLook> = {
  grocery: { emoji: '🥦', tint: '#E7F7E9' },
  groceries: { emoji: '🥦', tint: '#E7F7E9' },
  'fruits & vegetables': { emoji: '🍎', tint: '#FBE9EC' },
  dairy: { emoji: '🥛', tint: '#EAF2FB' },
  bakery: { emoji: '🥐', tint: '#FBF0E0' },
  beverages: { emoji: '🥤', tint: '#E6F2F3' },
  snacks: { emoji: '🍪', tint: '#FBF0E0' },
  'home care': { emoji: '🧼', tint: '#EEEAFB' },
  'personal care': { emoji: '🧴', tint: '#FBEAF2' },
  frozen: { emoji: '🧊', tint: '#E6F2F3' },
  pharmacy: { emoji: '💊', tint: '#FBE9EC' },
  pet: { emoji: '🐾', tint: '#EEEAFB' },
};

export function lookForCategory(name: string | null | undefined): CategoryLook {
  if (!name) return DEFAULT;
  return LOOKS[name.trim().toLowerCase()] ?? DEFAULT;
}
