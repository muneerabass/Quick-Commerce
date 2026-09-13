/**
 * Brand palette for Zipp.
 * Single source of truth — never hardcode a hex value in a component.
 */
export const colors = {
  // Brand
  primary: '#5B21E8',
  primaryDark: '#4715C4',
  primaryPressed: '#3F11B0',
  primarySoft: '#F1ECFF',
  primaryBorder: '#DCD0FF',

  // Secondary accent — used for savings, freshness, success
  accent: '#12A05C',
  accentSoft: '#E4F6ED',

  // Surfaces
  background: '#FFFFFF',
  canvas: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFC',
  overlay: 'rgba(14, 16, 22, 0.45)',

  // Text
  text: '#101219',
  textSecondary: '#5A6173',
  textTertiary: '#8B92A3',
  textInverse: '#FFFFFF',

  // Lines
  border: '#ECEEF2',
  borderStrong: '#DCE0E8',

  // Status
  success: '#12A05C',
  successSoft: '#E4F6ED',
  warning: '#E38A00',
  warningSoft: '#FFF3E0',
  error: '#DC2B2B',
  errorSoft: '#FDECEC',
  info: '#2563EB',

  // Utility
  star: '#F5A524',
  skeleton: '#EDEFF3',
  skeletonHighlight: '#F7F8FA',
  shadow: '#0B1020',
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

/** Gradient presets, kept here so gradients stay consistent and rare. */
export const gradients = {
  brand: ['#6D31FF', '#4A15C8'] as const,
  delivery: ['#171A2E', '#2B1E63'] as const,
  splash: ['#5B21E8', '#3D0FA8'] as const,
  imageFallback: ['#FFFFFF', '#F0F1F5'] as const,
};

export type AppColors = typeof colors;
