import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { getEffectiveTheme, Theme } from './tokens';

export interface UseThemeResult {
  theme: Theme;
  isDark: boolean;
  appearance: 'system' | 'light' | 'dark';
}

export function useTheme(): UseThemeResult {
  const appearance = useSettingsStore((s) => s.appearance);
  const colorScheme = useColorScheme();
  const theme = getEffectiveTheme(appearance, colorScheme);

  return {
    theme,
    isDark: theme.isDark,
    appearance,
  };
}
