import { MD3LightTheme } from 'react-native-paper';

// Color palette matching the web app
export const colors = {
  primary: {
    50: '#E6F3FE',
    100: '#BFDFFB',
    200: '#99CBF8',
    300: '#73B7F5',
    400: '#4DA3F2',
    500: '#0C88F1', // Main primary color
    600: '#0A7AD9',
    700: '#086BC0',
    800: '#065DA8',
    900: '#044E8F',
  },
  accent: {
    400: '#D946EF',
    500: '#D946EF',
    600: '#C026D3',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  white: '#FFFFFF',
  black: '#000000',
  background: '#FAFAFC',
};

// Paper theme configuration
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary[500],
    primaryContainer: colors.primary[100],
    secondary: colors.slate[600],
    secondaryContainer: colors.slate[100],
    background: colors.background,
    surface: colors.white,
    surfaceVariant: colors.slate[50],
    error: colors.danger[500],
    errorContainer: colors.danger[100],
    onPrimary: colors.white,
    onPrimaryContainer: colors.primary[900],
    onSecondary: colors.white,
    onSecondaryContainer: colors.slate[900],
    onSurface: colors.slate[900],
    onSurfaceVariant: colors.slate[600],
    outline: colors.slate[300],
    outlineVariant: colors.slate[200],
  },
  roundness: 12,
};

// Typography styles
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.slate[900],
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.slate[900],
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.slate[900],
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.slate[700],
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.slate[600],
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.slate[500],
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.slate[700],
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.slate[400],
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadows for cards
export const shadows = {
  small: {
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
