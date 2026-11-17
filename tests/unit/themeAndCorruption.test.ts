import { getEffectiveTheme, lightTheme, darkTheme } from '../../src/theme/tokens';
import { checkAndRecoverCorruptedStorage } from '../../src/services/storageCorruption';
import { useLibraryStore } from '../../src/store/useLibraryStore';

// Mock AsyncStorage in-memory storage
const storageMock: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(storageMock[key] ?? null)),
  setItem: jest.fn((key: string, val: string) => {
    storageMock[key] = val;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete storageMock[key];
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storageMock))),
}));

describe('theme tokens & storage corruption recovery', () => {
  describe('Theme tokens', () => {
    it('returns lightTheme when appearance is light', () => {
      const theme = getEffectiveTheme('light', 'dark');
      expect(theme.isDark).toBe(false);
      expect(theme.colors.bg.primary).toBe(lightTheme.colors.bg.primary);
    });

    it('returns darkTheme when appearance is dark', () => {
      const theme = getEffectiveTheme('dark', 'light');
      expect(theme.isDark).toBe(true);
      expect(theme.colors.bg.primary).toBe(darkTheme.colors.bg.primary);
    });

    it('follows system color scheme when appearance is system', () => {
      expect(getEffectiveTheme('system', 'light').isDark).toBe(false);
      expect(getEffectiveTheme('system', 'dark').isDark).toBe(true);
      expect(getEffectiveTheme('system', null).isDark).toBe(false);
    });
  });

  describe('Storage Corruption Recovery (TC-LOG-07)', () => {
    beforeEach(() => {
      for (const k of Object.keys(storageMock)) {
        delete storageMock[k];
      }
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

    it('TC-LOG-07: recovers from invalid JSON in AsyncStorage by backing up and restoring defaults', async () => {
      // Giả lập AsyncStorage chứa JSON hỏng
      const corruptedData = '{ invalid_json_syntax: 123, quotes: ';
      storageMock['qw_library_store'] = corruptedData;

      const recovery = await checkAndRecoverCorruptedStorage();
      expect(recovery.recovered).toBe(true);
      expect(recovery.backupKey).toMatch(/^backup_corrupt_\d+$/);

      // Bản backup lưu đúng dữ liệu hỏng
      expect(storageMock[recovery.backupKey!]).toBe(corruptedData);

      // Store được khôi phục về mặc định an toàn
      const state = useLibraryStore.getState();
      expect(state.quotes.length).toBe(50);
      expect(state.images.length).toBe(12);
      expect(state.templates.length).toBe(8);
    });

    it('does nothing when data is valid or empty', async () => {
      const recovery = await checkAndRecoverCorruptedStorage();
      expect(recovery.recovered).toBe(false);
    });
  });
});
