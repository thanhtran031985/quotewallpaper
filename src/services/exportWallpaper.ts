import { Dimensions, PixelRatio } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import { captureRef } from 'react-native-view-shot';
import { Result } from '../domain/types';

export interface ScreenExportDimensions {
  width: number;
  height: number;
  scale: number;
  pixelWidth: number;
  pixelHeight: number;
}

/**
 * Lấy kích thước xuất hình nền chuẩn pixel màn hình (width × height × scale - TC-LOG-01).
 */
export function getScreenExportDimensions(): ScreenExportDimensions {
  const { width, height } = Dimensions.get('window');
  const scale = PixelRatio.get();
  return {
    width,
    height,
    scale,
    pixelWidth: Math.round(width * scale),
    pixelHeight: Math.round(height * scale),
  };
}

/**
 * Chụp WallpaperCanvas ẩn ở chất lượng JPEG 0.92 và lưu vào Ảnh cùng album "Quote Wallpaper" (R15).
 */
export async function captureAndSaveWallpaper(
  viewRef: any,
  albumName: string = 'Quote Wallpaper',
): Promise<Result<{ assetId: string; uri: string }>> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      return {
        ok: false,
        code: 'PERMISSION_DENIED',
        message:
          'Cần cấp quyền truy cập Thư viện Ảnh để lưu hình nền. Hãy vào Cài đặt > Quote Wallpaper để cấp quyền.',
      };
    }

    const uri = await captureRef(viewRef, {
      format: 'jpg',
      quality: 0.92,
      result: 'tmpfile',
    });

    const asset = await MediaLibrary.createAssetAsync(uri);

    const effectiveAlbumName = albumName.trim() || 'Quote Wallpaper';
    const album = await MediaLibrary.getAlbumAsync(effectiveAlbumName);

    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync(effectiveAlbumName, asset, false);
    }

    return {
      ok: true,
      data: {
        assetId: asset.id,
        uri,
      },
    };
  } catch (error) {
    return {
      ok: false,
      code: 'EXPORT_FAILED',
      message: `Không thể lưu hình nền: ${(error as Error)?.message || 'Lỗi không xác định'}`,
    };
  }
}
