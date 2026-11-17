import {
  getScreenExportDimensions,
  captureAndSaveWallpaper,
} from '../../src/services/exportWallpaper';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { Dimensions, PixelRatio } from 'react-native';

jest.mock('expo-media-library');
jest.mock('react-native-view-shot');

describe('exportWallpaper service (08-export-settings-mvp Step 1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 1,
    });
    jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
  });

  describe('getScreenExportDimensions (TC-LOG-01)', () => {
    it('TC-LOG-01: tính chính xác kích thước xuất hình nền theo pixel màn hình (width × height × scale)', () => {
      const dims = getScreenExportDimensions();
      expect(dims.width).toBe(390);
      expect(dims.height).toBe(844);
      expect(dims.scale).toBe(3);
      expect(dims.pixelWidth).toBe(1170); // 390 * 3
      expect(dims.pixelHeight).toBe(2532); // 844 * 3
    });
  });

  describe('captureAndSaveWallpaper', () => {
    const mockRef = { current: {} };

    it('trả về lỗi PERMISSION_DENIED khi không được cấp quyền thư viện ảnh', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      const res = await captureAndSaveWallpaper(mockRef);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('PERMISSION_DENIED');
        expect(res.message).toContain('quyền truy cập');
      }
    });

    it('chụp canvas JPEG 0.92 và lưu vào album "Quote Wallpaper" thành công', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (captureRef as jest.Mock).mockResolvedValue('file:///tmp/captured_wallpaper.jpg');

      const mockAsset = { id: 'asset-123', uri: 'file:///photos/asset-123.jpg' };
      (MediaLibrary.createAssetAsync as jest.Mock).mockResolvedValue(mockAsset);

      const mockAlbum = { id: 'album-qw', title: 'Quote Wallpaper' };
      (MediaLibrary.getAlbumAsync as jest.Mock).mockResolvedValue(mockAlbum);
      (MediaLibrary.addAssetsToAlbumAsync as jest.Mock).mockResolvedValue(true);

      const res = await captureAndSaveWallpaper(mockRef, 'Quote Wallpaper');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.assetId).toBe('asset-123');
        expect(captureRef).toHaveBeenCalledWith(mockRef, {
          format: 'jpg',
          quality: 0.92,
          result: 'tmpfile',
        });
        expect(MediaLibrary.createAssetAsync).toHaveBeenCalledWith(
          'file:///tmp/captured_wallpaper.jpg',
        );
        expect(MediaLibrary.addAssetsToAlbumAsync).toHaveBeenCalledWith(
          [mockAsset],
          mockAlbum,
          false,
        );
      }
    });

    it('tạo album mới nếu album chưa tồn tại', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (captureRef as jest.Mock).mockResolvedValue('file:///tmp/captured_wallpaper.jpg');

      const mockAsset = { id: 'asset-456', uri: 'file:///photos/asset-456.jpg' };
      (MediaLibrary.createAssetAsync as jest.Mock).mockResolvedValue(mockAsset);

      (MediaLibrary.getAlbumAsync as jest.Mock).mockResolvedValue(null);
      (MediaLibrary.createAlbumAsync as jest.Mock).mockResolvedValue({
        id: 'new-album',
        title: 'Quote Wallpaper',
      });

      const res = await captureAndSaveWallpaper(mockRef, 'Quote Wallpaper');
      expect(res.ok).toBe(true);
      expect(MediaLibrary.createAlbumAsync).toHaveBeenCalledWith(
        'Quote Wallpaper',
        mockAsset,
        false,
      );
    });
  });
});
