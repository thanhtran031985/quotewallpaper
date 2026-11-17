import {
  pickImagesFromLibrary,
  deleteImageFile,
  cleanupOrphanImages,
  verifyImageExists,
} from '../../src/services/imageLibrary';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { WallpaperImage } from '../../src/domain/types';

jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system/legacy');

describe('imageLibrary service', () => {
  const mockDocDir = 'file:///app/documents/';

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem as any).documentDirectory = mockDocDir;
  });

  describe('pickImagesFromLibrary', () => {
    it('trả về lỗi PERMISSION_DENIED khi người dùng từ chối quyền thư viện ảnh', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: false,
      });

      const res = await pickImagesFromLibrary();
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('PERMISSION_DENIED');
        expect(res.message).toContain('quyền truy cập Ảnh');
      }
    });

    it('trả về danh sách rỗng khi người dùng hủy chọn ảnh', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      const res = await pickImagesFromLibrary();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toEqual([]);
      }
    });

    it('nén, resize và chép ảnh vào documentDirectory/images/ thành công', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'ph://temp-photo-1.jpg',
            fileName: 'sunset.jpg',
            width: 4000,
            height: 3000,
          },
        ],
      });

      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/manipulated_sunset.jpg',
        width: 2560,
        height: 1920,
      });

      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);

      const res = await pickImagesFromLibrary();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.length).toBe(1);
        const img = res.data[0];
        expect(img.name).toBe('sunset.jpg');
        expect(img.source).toBe('user');
        expect(img.enabled).toBe(true);
        expect(img.focalPoint).toEqual({ x: 0.5, y: 0.5 });
        expect(img.uri).toContain('file:///app/documents/images/');
        expect(img.width).toBe(2560);
        expect(img.height).toBe(1920);

        expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
          'file:///app/documents/images/',
          { intermediates: true },
        );
        expect(FileSystem.copyAsync).toHaveBeenCalled();
      }
    });
  });

  describe('deleteImageFile (TC-LOG-01)', () => {
    it('TC-LOG-01: xóa file trong documentDirectory khi là ảnh user', async () => {
      const userUri = 'file:///app/documents/images/img_123.jpg';
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      const res = await deleteImageFile(userUri);
      expect(res.ok).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(userUri, { idempotent: true });
    });

    it('không xóa file nếu không phải đường dẫn trong documentDirectory của app', async () => {
      const photoUri = 'ph://photos-asset-123.jpg';
      const res = await deleteImageFile(photoUri);
      expect(res.ok).toBe(true);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOrphanImages', () => {
    it('dọn dẹp các file trong images/ không còn được lưu trong store', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([
        'img_active.jpg',
        'img_orphan1.jpg',
        'img_orphan2.jpg',
      ]);
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      const registeredImages: WallpaperImage[] = [
        {
          id: 'img-1',
          name: 'Active',
          source: 'user',
          uri: 'file:///app/documents/images/img_active.jpg',
          width: 1000,
          height: 2000,
          focalPoint: { x: 0.5, y: 0.5 },
          enabled: true,
          createdAt: '2026-01-01',
        },
      ];

      const res = await cleanupOrphanImages(registeredImages);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toBe(2); // 2 file orphan bị xóa
        expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('verifyImageExists', () => {
    it('kiểm tra file tồn tại trên ổ đĩa', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
      const exists = await verifyImageExists('file:///app/documents/images/img_1.jpg');
      expect(exists).toBe(true);

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      const notExists = await verifyImageExists('file:///app/documents/images/missing.jpg');
      expect(notExists).toBe(false);
    });
  });
});
