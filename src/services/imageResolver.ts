import { WallpaperImage } from '../domain/types';

export const DEFAULT_IMAGE_URLS: Record<string, string> = {
  'default-1':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
  'default-2':
    'https://images.unsplash.com/photo-1439853941329-a99ce0435c81?auto=format&fit=crop&w=1080&q=80',
  'default-3':
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&q=80',
  'default-4':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
  'default-5':
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1080&q=80',
  'default-6':
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=80',
  'default-7':
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&q=80',
  'default-8':
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&q=80',
  'default-9':
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1080&q=80',
  'default-10':
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1080&q=80',
  'default-11':
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1080&q=80',
  'default-12':
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80',
};

/**
 * Phân giải nguồn ảnh thực tế (URL Unsplash đối với ảnh mặc định, đường dẫn cục bộ đối với ảnh người dùng).
 */
export function resolveImageSource(image: WallpaperImage): string {
  if (image.source === 'default') {
    return DEFAULT_IMAGE_URLS[image.uri] || image.uri;
  }
  return image.uri;
}
