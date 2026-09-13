import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

const ios = (
  opacity: number,
  radius: number,
  offsetY: number,
): ViewStyle => ({
  shadowColor: colors.shadow,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
});

/**
 * Shadows are deliberately restrained — one soft ambient layer, never stacked.
 * Android uses elevation, which reads very differently, so each level is tuned separately.
 */
export const shadows = {
  none: {} as ViewStyle,

  /** Barely-there lift for list cards. */
  soft: Platform.select({
    ios: ios(0.05, 10, 3),
    android: { elevation: 1 } as ViewStyle,
    default: {},
  }) as ViewStyle,

  /** Default product/category card. */
  card: Platform.select({
    ios: ios(0.07, 16, 5),
    android: { elevation: 2 } as ViewStyle,
    default: {},
  }) as ViewStyle,

  /** Sticky bars, floating summaries. */
  floating: Platform.select({
    ios: ios(0.12, 24, 10),
    android: { elevation: 8 } as ViewStyle,
    default: {},
  }) as ViewStyle,

  /** Tab bar sits above content and needs an upward shadow on iOS. */
  tabBar: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
    } as ViewStyle,
    android: { elevation: 16 } as ViewStyle,
    default: {},
  }) as ViewStyle,
} as const;
