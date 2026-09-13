import { Platform, TextStyle } from 'react-native';

/**
 * System font stack — San Francisco on iOS, Roboto on Android.
 * Keeping to the platform font is what makes the app feel native rather than themed.
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

type Variant =
  | 'display'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'bodyStrong'
  | 'bodySmall'
  | 'caption'
  | 'captionStrong'
  | 'overline'
  | 'button'
  | 'buttonSmall';

export const typography: Record<Variant, TextStyle> = {
  display: { fontFamily, fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.6 },
  heading1: { fontFamily, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  heading2: { fontFamily, fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  heading3: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontFamily: fontFamilyMedium, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  bodySmall: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontFamily, fontSize: 11.5, lineHeight: 15, fontWeight: '500' },
  captionStrong: { fontFamily: fontFamilyMedium, fontSize: 11.5, lineHeight: 15, fontWeight: '700' },
  overline: {
    fontFamily: fontFamilyMedium,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fontFamilyMedium, fontSize: 16, lineHeight: 20, fontWeight: '700', letterSpacing: -0.1 },
  buttonSmall: { fontFamily: fontFamilyMedium, fontSize: 13.5, lineHeight: 17, fontWeight: '700' },
};

export type TypographyVariant = Variant;
