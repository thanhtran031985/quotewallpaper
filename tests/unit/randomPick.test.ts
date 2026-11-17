import { pickSelection, calculateCombinationsCount } from '@/engine/randomPick';
import { Quote, WallpaperImage, Template, Settings, Selection } from '@/domain/types';

const mockImages: WallpaperImage[] = [
  {
    id: 'img-1',
    name: 'Image 1',
    source: 'default',
    uri: 'default-1',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'img-2',
    name: 'Image 2',
    source: 'default',
    uri: 'default-2',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'img-3',
    name: 'Image 3',
    source: 'default',
    uri: 'default-3',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'q-1',
    text: 'Quote 1',
    author: 'Author 1',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'q-2',
    text: 'Quote 2',
    author: 'Author 2',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'q-fav',
    text: 'Favorite Quote',
    author: 'Author Fav',
    enabled: true,
    favorite: true,
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'q-disabled',
    text: 'Disabled Quote',
    enabled: false,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockTemplates: Template[] = [
  {
    id: 'tpl-1',
    name: 'Template 1',
    source: 'builtin',
    enabled: true,
    style: {} as any,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-2',
    name: 'Template 2',
    source: 'builtin',
    enabled: true,
    style: {} as any,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-3',
    name: 'Template 3',
    source: 'user',
    enabled: false,
    style: {} as any,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const defaultSettings: Settings = {
  templateMode: 'random',
  fixedTemplateId: 'tpl-1',
  shuffleOnOpen: true,
  noRepeat: true,
  showAuthor: true,
  favoritesBoost: false,
  appearance: 'system',
  exportAlbumName: 'Quote Wallpaper',
};

describe('pickSelection', () => {
  const lib = {
    images: mockImages,
    quotes: mockQuotes,
    templates: mockTemplates,
  };

  it('TC-LOG-01: noRepeat với 2 câu, shuffle 100 lần không bao giờ trùng câu liên tiếp', () => {
    const twoQuotesLib = {
      ...lib,
      quotes: mockQuotes.filter((q) => q.id === 'q-1' || q.id === 'q-2'),
    };
    let prev: Selection | null = null;
    for (let i = 0; i < 100; i++) {
      const result = pickSelection(twoQuotesLib, defaultSettings, prev);
      expect(result.ok).toBe(true);
      if (result.ok) {
        if (prev) {
          expect(result.data.quoteId).not.toBe(prev.quoteId);
        }
        prev = result.data;
      }
    }
  });

  it('TC-LOG-02: noRepeat với 1 câu vẫn chọn được câu đó', () => {
    const oneQuoteLib = {
      ...lib,
      quotes: [mockQuotes[0]],
    };
    const prev: Selection = {
      imageId: 'img-1',
      quoteId: mockQuotes[0].id,
      templateId: 'tpl-1',
      pickedAt: '2026-01-01T00:00:00.000Z',
    };
    const result = pickSelection(oneQuoteLib, defaultSettings, prev);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.quoteId).toBe(mockQuotes[0].id);
    }
  });

  it('TC-LOG-03: Chế độ Cố định -> Template luôn = fixedTemplateId', () => {
    const settings: Settings = {
      ...defaultSettings,
      templateMode: 'fixed',
      fixedTemplateId: 'tpl-2',
    };
    for (let i = 0; i < 20; i++) {
      const result = pickSelection(lib, settings);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.templateId).toBe('tpl-2');
      }
    }
  });

  it('TC-LOG-03b: Chế độ Cố định fallback về template builtin đầu tiên khi fixedTemplate bị tắt/xóa', () => {
    const settings: Settings = {
      ...defaultSettings,
      templateMode: 'fixed',
      fixedTemplateId: 'tpl-nonexistent',
    };
    const result = pickSelection(lib, settings);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.templateId).toBe('tpl-1');
    }
  });

  it('TC-LOG-04: Ghim ảnh -> Ảnh không đổi qua các lần shuffle', () => {
    const prev: Selection = {
      imageId: 'img-1',
      quoteId: 'q-1',
      templateId: 'tpl-1',
      pickedAt: '2026-01-01T00:00:00.000Z',
    };
    const pinned = { image: true, quote: false, template: false };
    for (let i = 0; i < 20; i++) {
      const result = pickSelection(lib, defaultSettings, prev, pinned);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.imageId).toBe('img-1');
      }
    }
  });

  it('TC-LOG-04b: Ghim tự nhả khi mục đang ghim bị tắt', () => {
    const prev: Selection = {
      imageId: 'img-3', // img-3 is enabled: false
      quoteId: 'q-1',
      templateId: 'tpl-1',
      pickedAt: '2026-01-01T00:00:00.000Z',
    };
    const pinned = { image: true, quote: false, template: false };
    const result = pickSelection(lib, defaultSettings, prev, pinned);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.imageId).not.toBe('img-3');
    }
  });

  it('TC-LOG-05: Tắt hết ảnh -> Trả EMPTY_IMAGES', () => {
    const noImagesLib = {
      ...lib,
      images: mockImages.map((img) => ({ ...img, enabled: false })),
    };
    const result = pickSelection(noImagesLib, defaultSettings);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_IMAGES');
    }
  });

  it('TC-LOG-05b: Tắt cả ảnh và câu -> Trả lỗi chứa cả hai mã lỗi', () => {
    const emptyLib = {
      images: [],
      quotes: [],
      templates: mockTemplates,
    };
    const result = pickSelection(emptyLib, defaultSettings);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toContain('EMPTY_IMAGES');
      expect(result.code).toContain('EMPTY_QUOTES');
    }
  });

  it('TC-LOG-06: favoritesBoost -> Câu yêu thích xuất hiện ~2 lần câu thường', () => {
    const settings: Settings = {
      ...defaultSettings,
      favoritesBoost: true,
      noRepeat: false, // tắt noRepeat để quan sát phân bố thuần túy
    };
    const simpleLib = {
      ...lib,
      quotes: [
        { ...mockQuotes[0], id: 'q-regular', favorite: false },
        { ...mockQuotes[2], id: 'q-favorite', favorite: true },
      ],
    };

    let regCount = 0;
    let favCount = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      const result = pickSelection(simpleLib, settings);
      if (result.ok) {
        if (result.data.quoteId === 'q-regular') regCount++;
        if (result.data.quoteId === 'q-favorite') favCount++;
      }
    }

    // Với tỷ lệ 1 : 2, favCount sẽ xấp xỉ 2 * regCount (fav ~ 66.6%, reg ~ 33.3%)
    const ratio = favCount / regCount;
    expect(ratio).toBeGreaterThan(1.7);
    expect(ratio).toBeLessThan(2.3);
  });

  it('phân bố ngẫu nhiên đều giữa các ảnh qua 10.000 lần', () => {
    const settings: Settings = {
      ...defaultSettings,
      noRepeat: false,
    };
    let count1 = 0;
    let count2 = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
      const result = pickSelection(lib, settings);
      if (result.ok) {
        if (result.data.imageId === 'img-1') count1++;
        if (result.data.imageId === 'img-2') count2++;
      }
    }

    // 2 ảnh tỉ lệ xấp xỉ 50/50, độ lệch không quá 6%
    expect(Math.abs(count1 - count2) / iterations).toBeLessThan(0.06);
  });

  it('tính đúng số kết hợp qua calculateCombinationsCount', () => {
    // 2 images enabled, 3 quotes enabled, 2 templates enabled
    // Mode random: 2 * 3 * 2 = 12
    expect(calculateCombinationsCount(lib, defaultSettings)).toBe(12);

    // Mode fixed: 2 * 3 * 1 = 6
    const fixedSettings: Settings = { ...defaultSettings, templateMode: 'fixed' };
    expect(calculateCombinationsCount(lib, fixedSettings)).toBe(6);

    // Khi 1 kho có 0 mục bật: 0
    const emptyLib = { ...lib, images: [] };
    expect(calculateCombinationsCount(emptyLib, defaultSettings)).toBe(0);
  });
});
