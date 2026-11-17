import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useLibraryStore & useSettingsStore actions', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      version: 1,
      quotes: [
        {
          id: 'q-default',
          text: 'Học, học nữa, học mãi.',
          author: 'V.I. Lênin',
          enabled: true,
          favorite: false,
          source: 'default',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      images: [
        {
          id: 'img-default',
          name: 'Ảnh 1',
          source: 'default',
          uri: 'asset-1',
          width: 1080,
          height: 1920,
          focalPoint: { x: 0.5, y: 0.5 },
          enabled: true,
          createdAt: '2026-01-01',
        },
      ],
      templates: [
        {
          id: 'tpl-center',
          name: 'Trung tâm',
          source: 'builtin',
          style: {} as any,
          enabled: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });

    useSettingsStore.setState({
      templateMode: 'fixed',
      fixedTemplateId: 'tpl-center',
      shuffleOnOpen: true,
      noRepeat: true,
      showAuthor: true,
      favoritesBoost: false,
      appearance: 'system',
      exportAlbumName: 'Quote Wallpaper',
    });
  });

  describe('Quote Actions (R8, R9)', () => {
    it('TC-LOG-01: rejects empty quote and quote > 220 chars', () => {
      const store = useLibraryStore.getState();
      const resEmpty = store.addQuote('   ');
      expect(resEmpty.ok).toBe(false);
      if (!resEmpty.ok) {
        expect(resEmpty.code).toBe('INVALID_LENGTH');
      }

      const resLong = store.addQuote('a'.repeat(221));
      expect(resLong.ok).toBe(false);
      if (!resLong.ok) {
        expect(resLong.code).toBe('INVALID_LENGTH');
      }
    });

    it('TC-LOG-02: rejects duplicate quote ignoring casing & whitespace', () => {
      const store = useLibraryStore.getState();
      const res = store.addQuote('  HỌC,   HỌC NỮA,   HỌC MÃI.  ');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('DUPLICATE_QUOTE');
      }
    });

    it('adds a valid user quote', () => {
      const store = useLibraryStore.getState();
      const res = store.addQuote('Không có gì quý hơn độc lập tự do', 'Hồ Chí Minh');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.source).toBe('user');
        expect(res.data.text).toBe('Không có gì quý hơn độc lập tự do');
      }
      expect(useLibraryStore.getState().quotes).toHaveLength(2);
    });

    it('TC-LOG-03: refuses to delete default quote', () => {
      const store = useLibraryStore.getState();
      const res = store.removeQuote('q-default');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('CANNOT_DELETE_DEFAULT');
      }
      expect(useLibraryStore.getState().quotes).toHaveLength(1);
    });

    it('deletes user quote and unpins if current', () => {
      const store = useLibraryStore.getState();
      const addRes = store.addQuote('Câu của user', 'User');
      expect(addRes.ok).toBe(true);
      if (addRes.ok) {
        useLibraryStore.setState({
          current: { imageId: 'img-default', quoteId: addRes.data.id, templateId: 'tpl-center', pickedAt: '' },
          pinned: { image: false, quote: true, template: false },
        });

        const delRes = useLibraryStore.getState().removeQuote(addRes.data.id);
        expect(delRes.ok).toBe(true);
        expect(useLibraryStore.getState().pinned.quote).toBe(false);
      }
    });
  });

  describe('Template Actions (R11, R12)', () => {
    it('TC-LOG-04: refuses to delete builtin template', () => {
      const store = useLibraryStore.getState();
      const res = store.removeTemplate('tpl-center');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('CANNOT_DELETE_BUILTIN');
      }
    });

    it('TC-LOG-05: refuses to delete last enabled template in random mode (R12)', () => {
      useSettingsStore.setState({ templateMode: 'random' });
      const store = useLibraryStore.getState();

      const dupRes = store.duplicateTemplate('tpl-center');
      expect(dupRes.ok).toBe(true);
      if (dupRes.ok) {
        const userTplId = dupRes.data.id;
        // Turn off builtin template so only userTplId is enabled
        useLibraryStore.setState((s) => ({
          templates: s.templates.map((t) => (t.id === 'tpl-center' ? { ...t, enabled: false } : t)),
        }));

        const delRes = useLibraryStore.getState().removeTemplate(userTplId);
        expect(delRes.ok).toBe(false);
        if (!delRes.ok) {
          expect(delRes.code).toBe('CANNOT_DELETE_LAST_ENABLED');
        }
      }
    });

    it('duplicates builtin template with " (bản sao)"', () => {
      const store = useLibraryStore.getState();
      const res = store.duplicateTemplate('tpl-center');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.name).toBe('Trung tâm (bản sao)');
        expect(res.data.source).toBe('user');
      }
    });
  });
});
