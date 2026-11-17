import { Platform } from 'react-native';
import { FontFamily, FontWeight } from '../domain/types';

/**
 * Phân giải font family phù hợp với hệ thống iOS / fallback, hỗ trợ tiếng Việt có dấu.
 */
export function resolveFontFamily(
  family: FontFamily,
  _weight?: FontWeight,
  italic?: boolean,
): string {
  if (Platform.OS === 'ios') {
    switch (family) {
      case 'Serif':
        return italic ? 'Georgia-Italic' : 'Georgia';
      case 'Mono':
        return 'Menlo';
      case 'Rounded':
        return 'System';
      case 'Handwriting':
        return 'Snell Roundhand';
      case 'Sans':
      default:
        return 'System';
    }
  }

  // Fallbacks cho các nền tảng khác
  switch (family) {
    case 'Serif':
      return 'serif';
    case 'Mono':
      return 'monospace';
    case 'Rounded':
    case 'Handwriting':
    case 'Sans':
    default:
      return 'sans-serif';
  }
}
