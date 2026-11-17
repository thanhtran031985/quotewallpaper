import { seedInitialData, restoreDefaultData } from '../../src/services/seed';
import { useLibraryStore } from '../../src/store/useLibraryStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('services/seed', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      version: 1,
      quotes: [],
      images: [],
      templates: [],
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('TC-LOG-06: seeds initial data and is idempotent when run twice', async () => {
    // Lần 1
    await seedInitialData();
    const state1 = useLibraryStore.getState();

    expect(state1.quotes).toHaveLength(50);
    expect(state1.images).toHaveLength(12);
    expect(state1.templates).toHaveLength(8);

    // Kiểm tra tất cả đều enabled = true
    expect(state1.quotes.every((q) => q.enabled && q.source === 'default')).toBe(true);
    expect(state1.images.every((img) => img.enabled && img.source === 'default')).toBe(true);
    expect(state1.templates.every((t) => t.enabled && t.source === 'builtin')).toBe(true);

    // Lần 2 (idempotent)
    await seedInitialData();
    const state2 = useLibraryStore.getState();

    expect(state2.quotes).toHaveLength(50);
    expect(state2.images).toHaveLength(12);
    expect(state2.templates).toHaveLength(8);
  });

  it('restores default data: re-enables default items and restores missing without affecting user items', async () => {
    await seedInitialData();

    // User thêm 1 câu
    useLibraryStore.getState().addQuote('Câu của user', 'User');

    // Tắt 1 câu default
    const firstDefault = useLibraryStore.getState().quotes.find((q) => q.source === 'default')!;
    useLibraryStore.getState().toggleQuote(firstDefault.id);
    expect(useLibraryStore.getState().quotes.find((q) => q.id === firstDefault.id)!.enabled).toBe(
      false,
    );

    // Giả lập mất 1 ảnh default
    useLibraryStore.setState((s) => ({
      images: s.images.slice(1),
    }));
    expect(useLibraryStore.getState().images).toHaveLength(11);

    // Gọi khôi phục
    await restoreDefaultData();
    const state = useLibraryStore.getState();

    // Câu default được bật lại
    expect(state.quotes.find((q) => q.id === firstDefault.id)!.enabled).toBe(true);
    // Vẫn còn câu của user (50 default + 1 user = 51)
    expect(state.quotes).toHaveLength(51);
    expect(state.quotes.some((q) => q.text === 'Câu của user')).toBe(true);
    // Ảnh default thiếu được bù lại đủ 12
    expect(state.images).toHaveLength(12);
  });
});
