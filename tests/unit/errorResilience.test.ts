import { pickSelection } from '../../src/engine/randomPick';
import {
  checkAndRecoverCorruptedStorage,
  LIBRARY_STORAGE_KEY,
} from '../../src/services/storageCorruption';
import { BUILTIN_TEMPLATES } from '../../src/templates/builtin';
import { Quote, WallpaperImage, Settings } from '../../src/domain/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    __store: store,
  };
});

describe('Error Resilience & Fault Tolerance (13-polish-performance Step 3)', () => {
  const validQuotes: Quote[] = [
    {
      id: 'q1',
      text: 'Một câu danh ngôn hợp lệ.',
      enabled: true,
      favorite: false,
      source: 'default',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const validImages: WallpaperImage[] = [
    {
      id: 'img1',
      name: 'Ảnh 1',
      uri: 'file:///images/img1.jpg',
      width: 1080,
      height: 1920,
      source: 'default',
      enabled: true,
      focalPoint: { x: 0.5, y: 0.5 },
      fileMissing: false,
      createdAt: '2026-01-01',
    },
  ];

  const baseSettings: Settings = {
    templateMode: 'random',
    fixedTemplateId: 'tpl-center',
    shuffleOnOpen: true,
    noRepeat: true,
    showAuthor: true,
    favoritesBoost: true,
    appearance: 'system',
    exportAlbumName: 'Quote Wallpaper',
  };

  it('kho trống (0 câu hoặc 0 ảnh hoặc 0 mẫu): pickSelection trả về Result lỗi rõ ràng, không crash', () => {
    // 0 câu bật
    const resNoQuotes = pickSelection(
      { quotes: [], images: validImages, templates: BUILTIN_TEMPLATES },
      baseSettings,
    );
    expect(resNoQuotes.ok).toBe(false);
    expect(resNoQuotes.code).toBe('EMPTY_QUOTES');

    // 0 ảnh bật
    const resNoImages = pickSelection(
      { quotes: validQuotes, images: [], templates: BUILTIN_TEMPLATES },
      baseSettings,
    );
    expect(resNoImages.ok).toBe(false);
    expect(resNoImages.code).toBe('EMPTY_IMAGES');

    // 0 mẫu bật
    const resNoTemplates = pickSelection(
      { quotes: validQuotes, images: validImages, templates: [] },
      baseSettings,
    );
    expect(resNoTemplates.ok).toBe(false);
    expect(resNoTemplates.code).toBe('EMPTY_TEMPLATES');
  });

  it('ảnh bị đánh dấu fileMissing=true sẽ tự động bị loại bỏ khỏi danh sách random', () => {
    const imagesWithMissing: WallpaperImage[] = [
      {
        id: 'img_missing',
        name: 'Ảnh bị xóa file',
        uri: 'file:///images/missing.jpg',
        width: 1080,
        height: 1920,
        source: 'user',
        enabled: true,
        focalPoint: { x: 0.5, y: 0.5 },
        fileMissing: true, // Bị mất file
        createdAt: '2026-01-01',
      },
      ...validImages,
    ];

    for (let i = 0; i < 20; i++) {
      const res = pickSelection(
        {
          quotes: validQuotes,
          images: imagesWithMissing,
          templates: BUILTIN_TEMPLATES,
        },
        baseSettings,
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.imageId).toBe('img1'); // Không bao giờ chọn img_missing
      }
    }
  });

  it('chế độ fixed trỏ đến template không tồn tại sẽ tự động fallback về template có sẵn đầu tiên', () => {
    const brokenSettings: Settings = {
      ...baseSettings,
      templateMode: 'fixed',
      fixedTemplateId: 'non_existent_template_id',
    };

    const res = pickSelection(
      {
        quotes: validQuotes,
        images: validImages,
        templates: BUILTIN_TEMPLATES,
      },
      brokenSettings,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.templateId).toBe(BUILTIN_TEMPLATES[0].id);
    }
  });

  it('dữ liệu lưu trữ AsyncStorage bị hỏng JSON cú pháp sẽ tự động khôi phục an toàn', async () => {
    // Ghi dữ liệu rác làm hỏng JSON
    await AsyncStorage.setItem(LIBRARY_STORAGE_KEY, '{"invalid_json_syntax: 123... [');

    const recovery = await checkAndRecoverCorruptedStorage();
    expect(recovery.recovered).toBe(true);
    expect(recovery.backupKey).toContain('backup_corrupt_');

    // Dữ liệu rác đã được sao lưu sang key khác
    if (recovery.backupKey) {
      const backupContent = await AsyncStorage.getItem(recovery.backupKey);
      expect(backupContent).toBe('{"invalid_json_syntax: 123... [');
    }
  });
});
