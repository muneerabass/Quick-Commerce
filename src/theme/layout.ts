import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Reference width — iPhone 13/14 logical width. Used only as a scaling baseline. */
const BASE_WIDTH = 390;

export const isSmallDevice = SCREEN_WIDTH < 360;
export const isLargeDevice = SCREEN_WIDTH >= 414;

/**
 * Scales a font size for very small / very large handsets without letting
 * text run away on tablets. Clamped so the type scale stays coherent.
 */
export function scaleFont(size: number): number {
  const ratio = Math.min(Math.max(SCREEN_WIDTH / BASE_WIDTH, 0.92), 1.12);
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const gutter = isSmallDevice ? 14 : isLargeDevice ? 20 : 16;

/**
 * Horizontal product rails show 2 full cards plus a peek of the third, which is
 * what signals "this list scrolls" without needing an affordance.
 */
const productCardWidth = clamp((SCREEN_WIDTH - gutter * 2 - 12 * 2) / 2.45, 132, 176);

/** Home category rail: 4 tiles plus a peek. */
const categoryTileWidth = clamp((SCREEN_WIDTH - gutter * 2 - 10 * 4) / 4.4, 62, 84);

/** Two-column product grid used by search results and category listings. */
const productGridWidth = (SCREEN_WIDTH - gutter * 2 - 12) / 2;

/** Categories grid: 3 columns on normal phones, 2 on very small ones. */
const categoryGridColumns = isSmallDevice ? 2 : 3;
const categoryGridWidth =
  (SCREEN_WIDTH - gutter * 2 - 12 * (categoryGridColumns - 1)) / categoryGridColumns;

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  gutter,
  productCardWidth,
  productImageHeight: Math.round(productCardWidth * 0.86),
  productGridWidth,
  productGridImageHeight: Math.round(productGridWidth * 0.7),
  categoryTileWidth,
  categoryGridColumns,
  categoryGridWidth,
  /** Height reserved for the floating cart bar so lists can pad past it. */
  floatingBarHeight: 68,
  tabBarHeight: 60,
} as const;
