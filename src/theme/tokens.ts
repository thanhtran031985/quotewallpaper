export interface ThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    grouped: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  tint: {
    primary: string;
    success: string;
    destructive: string;
    warning: string;
  };
  border: {
    separator: string;
    opaqueSeparator: string;
    subtle: string;
  };
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 9999,
} as const;

export const typography = {
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const },
} as const;

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#E5E5EA',
      card: '#FFFFFF',
      grouped: '#F2F2F7',
    },
    text: {
      primary: '#000000',
      secondary: '#6C6C70',
      tertiary: '#8E8E93',
      quaternary: '#D1D1D6',
    },
    tint: {
      primary: '#007AFF',
      success: '#34C759',
      destructive: '#FF3B30',
      warning: '#FF9500',
    },
    border: {
      separator: '#C6C6C8',
      opaqueSeparator: '#C6C6C8',
      subtle: '#E5E5EA',
    },
  },
  spacing,
  radii,
  typography,
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    bg: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      card: '#1C1C1E',
      grouped: '#000000',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      tertiary: '#636366',
      quaternary: '#48484A',
    },
    tint: {
      primary: '#0A84FF',
      success: '#30D158',
      destructive: '#FF453A',
      warning: '#FF9F0A',
    },
    border: {
      separator: '#38383A',
      opaqueSeparator: '#38383A',
      subtle: '#2C2C2E',
    },
  },
  spacing,
  radii,
  typography,
};

export function getEffectiveTheme(
  appearance: 'system' | 'light' | 'dark',
  systemColorScheme: 'light' | 'dark' | null | undefined,
): Theme {
  if (appearance === 'dark') return darkTheme;
  if (appearance === 'light') return lightTheme;
  return systemColorScheme === 'dark' ? darkTheme : lightTheme;
}
