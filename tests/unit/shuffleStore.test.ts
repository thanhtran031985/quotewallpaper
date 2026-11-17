import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { WallpaperImage, Template } from '@/domain/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useLibraryStore - shuffle & history', () => {
  beforeEach(() => {
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();
  });

  const setupMockData = () => {
    const img1: Omit<WallpaperImage, 'id' | 'createdAt'> = {
      name: 'Ảnh 1',
      source: 'default',
      uri: 'uri-1',
      width: 1080,
      height: 1920,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
    };
    const img2: Omit<WallpaperImage, 'id' | 'createdAt'> = {
      name: 'Ảnh 2',
      source: 'default',
      uri: 'uri-2',
      width: 1080,
      height: 1920,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
    };
    const tpl1: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Mẫu 1',
      source: 'builtin',
      style: {} as any,
      enabled: true,
    };

    const q1 = useLibraryStore.getState().addQuote('Câu danh ngôn thứ nhất', 'Tác giả 1');
    const q2 = useLibraryStore.getState().addQuote('Câu danh ngôn thứ hai', 'Tác giả 2');
    const i1 = useLibraryStore.getState().addImage(img1);
    const i2 = useLibraryStore.getState().addImage(img2);
    const t1 = useLibraryStore.getState().addTemplate(tpl1);

    if (q1.ok && q2.ok && i1.ok && i2.ok && t1.ok) {
      return {
        quotes: [q1.data, q2.data],
        images: [i1.data, i2.data],
        templates: [t1.data],
      };
    }
    throw new Error('Setup mock data failed');
  };

  it('shuffle chọn hình nền mới, cập nhật current và ghi vào history', () => {
    setupMockData();

    const res = useLibraryStore.getState().shuffle();
    expect(res.ok).toBe(true);

    const state = useLibraryStore.getState();
    expect(state.current).not.toBeNull();
    if (res.ok) {
      expect(state.current?.imageId).toBe(res.data.imageId);
      expect(state.current?.quoteId).toBe(res.data.quoteId);
      expect(state.current?.templateId).toBe(res.data.templateId);
      expect(state.history.length).toBe(1);
      expect(state.history[0]).toEqual(state.current);
    }
  });

  it('lịch sử history giới hạn tối đa 50 lần chọn gần nhất (R17)', () => {
    setupMockData();

    for (let i = 0; i < 65; i++) {
      const res = useLibraryStore.getState().shuffle();
      expect(res.ok).toBe(true);
    }

    const state = useLibraryStore.getState();
    expect(state.history.length).toBe(50);
  });

  it('tự động nhả ghim khi mục đang ghim bị tắt', () => {
    setupMockData();

    // Shuffle để có current
    useLibraryStore.getState().shuffle();
    const current = useLibraryStore.getState().current;
    expect(current).not.toBeNull();

    // Ghim ảnh
    useLibraryStore.getState().setPinned('image', true);
    expect(useLibraryStore.getState().pinned.image).toBe(true);

    // Tắt ảnh đang được ghim
    if (current) {
      useLibraryStore.getState().toggleImage(current.imageId);
      // Pinned của ảnh phải tự động chuyển thành false
      expect(useLibraryStore.getState().pinned.image).toBe(false);
    }
  });

  it('tự động nhả ghim khi mục đang ghim bị xóa', () => {
    setupMockData();

    useLibraryStore.getState().shuffle();
    const current = useLibraryStore.getState().current;
    expect(current).not.toBeNull();

    useLibraryStore.getState().setPinned('quote', true);
    expect(useLibraryStore.getState().pinned.quote).toBe(true);

    if (current) {
      useLibraryStore.getState().deleteQuote(current.quoteId);
      expect(useLibraryStore.getState().pinned.quote).toBe(false);
    }
  });

  it('trả lỗi khi không thể chọn và không ghi vào history', () => {
    // Không có dữ liệu nào
    const res = useLibraryStore.getState().shuffle();
    expect(res.ok).toBe(false);
    expect(useLibraryStore.getState().current).toBeNull();
    expect(useLibraryStore.getState().history.length).toBe(0);
  });
});
