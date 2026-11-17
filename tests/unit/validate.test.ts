import {
  normalizeText,
  normalizeForComparison,
  validateQuoteInput,
  isQuoteDuplicate,
  validateQuote,
  validateImage,
  validateTemplate,
  validateSettings,
  validateAppLibraryState,
} from '../../src/domain/validate';
import { Quote } from '../../src/domain/types';

describe('validate domain rules', () => {
  describe('normalizeText & comparison', () => {
    it('trims and collapses whitespace', () => {
      expect(normalizeText('   Cuộc   sống   đẹp   ')).toBe('Cuộc sống đẹp');
    });

    it('normalizes for comparison case-insensitively', () => {
      expect(normalizeForComparison('   Cuộc   SỐNG đẹp  ')).toBe('cuộc sống đẹp');
    });
  });

  describe('validateQuoteInput (R8)', () => {
    it('accepts valid text and author', () => {
      const res = validateQuoteInput('Hành trình vạn dặm bắt đầu từ một bước chân.', 'Lão Tử');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.text).toBe('Hành trình vạn dặm bắt đầu từ một bước chân.');
        expect(res.data.author).toBe('Lão Tử');
      }
    });

    it('TC-LOG-01: rejects empty text (0 chars)', () => {
      const res = validateQuoteInput('    ');
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_LENGTH');
        expect(res.message).toContain('1 đến 220 ký tự');
      }
    });

    it('TC-LOG-01: rejects text exceeding 220 chars', () => {
      const longText = 'a'.repeat(221);
      const res = validateQuoteInput(longText);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_LENGTH');
      }
    });

    it('rejects author exceeding 60 chars', () => {
      const longAuthor = 'a'.repeat(61);
      const res = validateQuoteInput('Một câu ngắn', longAuthor);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_AUTHOR');
      }
    });
  });

  describe('isQuoteDuplicate (R8 / TC-LOG-02)', () => {
    const existingQuotes: Quote[] = [
      {
        id: 'q-1',
        text: 'Kiến tha lâu cũng đầy tổ.',
        author: 'Tục ngữ',
        enabled: true,
        favorite: false,
        source: 'default',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    it('TC-LOG-02: detects duplicate ignoring casing and whitespace', () => {
      expect(isQuoteDuplicate('  kiến  tha  lâu  cũng  đầy  tổ. ', existingQuotes)).toBe(true);
      expect(isQuoteDuplicate('KIẾN THA LÂU CŨNG ĐẦY TỔ.', existingQuotes)).toBe(true);
      expect(isQuoteDuplicate('Câu khác hoàn toàn', existingQuotes)).toBe(false);
    });

    it('ignores self when editing with excludeId', () => {
      expect(isQuoteDuplicate('Kiến tha lâu cũng đầy tổ.', existingQuotes, 'q-1')).toBe(false);
    });
  });

  describe('schema validation', () => {
    it('validates a valid Quote object', () => {
      const raw = {
        id: 'q-1',
        text: 'Sống là cống hiến.',
        enabled: true,
        favorite: true,
        source: 'user',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      const res = validateQuote(raw);
      expect(res.ok).toBe(true);
    });

    it('rejects an invalid Quote object missing fields', () => {
      const res = validateQuote({ id: 'q-1', text: '' });
      expect(res.ok).toBe(false);
    });

    it('validates a valid Settings object', () => {
      const settings = {
        templateMode: 'fixed',
        fixedTemplateId: 'tpl-center',
        shuffleOnOpen: true,
        noRepeat: true,
        showAuthor: true,
        favoritesBoost: false,
        appearance: 'system',
        exportAlbumName: 'Quote Wallpaper',
      };
      const res = validateSettings(settings);
      expect(res.ok).toBe(true);
    });

    it('validates a valid WallpaperImage object', () => {
      const img = {
        id: 'img-1',
        name: 'Núi tuyết',
        source: 'default',
        uri: 'default-1',
        width: 1080,
        height: 1920,
        focalPoint: { x: 0.5, y: 0.5 },
        enabled: true,
        createdAt: '2026-01-01',
      };
      const res = validateImage(img);
      expect(res.ok).toBe(true);
    });

    it('validates a valid Template and AppLibraryState', () => {
      const tpl = {
        id: 'tpl-1',
        name: 'Mẫu tối giản',
        source: 'builtin',
        style: {} as any,
        enabled: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      expect(validateTemplate(tpl).ok).toBe(true);

      const state = {
        version: 1,
        quotes: [],
        images: [],
        templates: [tpl],
        current: null,
        pinned: { image: false, quote: false, template: false },
        history: [],
      };
      expect(validateAppLibraryState(state).ok).toBe(true);
    });
  });
});
