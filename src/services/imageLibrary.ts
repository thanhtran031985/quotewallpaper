import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { WallpaperImage, Result } from '../domain/types';

export function getImagesDirectory(): string {
  const baseDir = FileSystem.documentDirectory || '';
  return `${baseDir}images/`;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Chọn ảnh từ Thư viện Photos (tối đa 20 ảnh một lần).
 * Tự động nén, đổi cỡ ảnh tối ưu cho hình nền và chép vào documentDirectory/images/.
 */
export async function pickImagesFromLibrary(
  maxImages: number = 20,
): Promise<Result<WallpaperImage[]>> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return {
        ok: false,
        code: 'PERMISSION_DENIED',
        message:
          'Cần cấp quyền truy cập Ảnh để thêm hình nền. Hãy vào Cài đặt > Quote Wallpaper để cấp quyền.',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.min(20, Math.max(1, maxImages)),
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { ok: true, data: [] };
    }

    const dir = getImagesDirectory();
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

    const newImages: WallpaperImage[] = [];

    for (const asset of result.assets) {
      // 1. Nén và resize nếu kích thước quá lớn (> 2560px)
      const targetWidth = Math.min(asset.width || 2560, 2560);
      const actions: ImageManipulator.Action[] = [];
      if (asset.width && asset.width > 2560) {
        actions.push({ resize: { width: targetWidth } });
      }

      const manipulated = await ImageManipulator.manipulateAsync(asset.uri, actions, {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      // 2. Chép vào documentDirectory/images/
      const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const targetUri = `${dir}${filename}`;

      await FileSystem.copyAsync({
        from: manipulated.uri,
        to: targetUri,
      });

      const now = new Date().toISOString();
      const imageItem: WallpaperImage = {
        id: generateId('img_user'),
        name: asset.fileName || 'Ảnh cá nhân',
        source: 'user',
        uri: targetUri,
        width: manipulated.width || 1080,
        height: manipulated.height || 1920,
        focalPoint: { x: 0.5, y: 0.5 },
        enabled: true,
        createdAt: now,
      };

      newImages.push(imageItem);
    }

    return { ok: true, data: newImages };
  } catch (error) {
    return {
      ok: false,
      code: 'PICK_IMAGES_FAILED',
      message: `Không thể thêm ảnh: ${(error as Error)?.message || 'Lỗi không xác định'}`,
    };
  }
}

/**
 * Xóa file ảnh trong thư mục app (TC-LOG-01).
 * Tuyệt đối không xóa nếu file không nằm trong documentDirectory của app.
 */
export async function deleteImageFile(uri: string): Promise<Result<void>> {
  try {
    const docDir = FileSystem.documentDirectory || '';
    // Chỉ xóa nếu uri nằm trong documentDirectory
    if (docDir && uri.startsWith(docDir)) {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      code: 'DELETE_FILE_FAILED',
      message: `Không thể xóa file ảnh: ${(error as Error)?.message || 'Lỗi'}`,
    };
  }
}

/**
 * Dọn dẹp file mồ côi: quét thư mục images/, xóa file nào không còn được lưu trong store.
 */
export async function cleanupOrphanImages(
  registeredImages: WallpaperImage[],
): Promise<Result<number>> {
  try {
    const dir = getImagesDirectory();
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      return { ok: true, data: 0 };
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    const registeredFilenames = new Set(
      registeredImages.map((img) => img.uri.split('/').pop()).filter(Boolean),
    );

    let deletedCount = 0;
    for (const file of files) {
      if (!registeredFilenames.has(file)) {
        await FileSystem.deleteAsync(`${dir}${file}`, { idempotent: true });
        deletedCount++;
      }
    }

    return { ok: true, data: deletedCount };
  } catch (error) {
    return {
      ok: false,
      code: 'CLEANUP_ORPHANS_FAILED',
      message: `Lỗi dọn dẹp file mồ côi: ${(error as Error)?.message || 'Lỗi'}`,
    };
  }
}

/**
 * Kiểm tra file ảnh có tồn tại hay không.
 */
export async function verifyImageExists(uri: string): Promise<boolean> {
  try {
    if (!uri) return false;
    // Ảnh default hoặc asset bundle không phải file trong documentDirectory
    if (uri.startsWith('default-') || uri.startsWith('http') || uri.startsWith('asset:')) {
      return true;
    }

    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
}
