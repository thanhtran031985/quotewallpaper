import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppLibraryState,
  Quote,
  WallpaperImage,
  Template,
  Selection,
  Result,
} from '../domain/types';
import { validateQuoteInput, isQuoteDuplicate } from '../domain/validate';
import { LIBRARY_STORE_VERSION, migrateLibraryState } from './migrations';
import { useSettingsStore } from './useSettingsStore';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export interface LibraryActions {
  // Quote
  addQuote: (text: string, author?: string) => Result<Quote>;
  updateQuote: (id: string, text: string, author?: string) => Result<Quote>;
  removeQuote: (id: string) => Result<void>;
  toggleQuote: (id: string) => void;
  toggleFavoriteQuote: (id: string) => void;

  // Image
  addImage: (image: Omit<WallpaperImage, 'id' | 'createdAt'>) => Result<WallpaperImage>;
  removeImage: (id: string) => Result<void>;
  toggleImage: (id: string) => void;
  updateImageFocalPoint: (id: string, focalPoint: { x: number; y: number }) => void;

  // Template
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Result<Template>;
  updateTemplate: (
    id: string,
    updates: Partial<Omit<Template, 'id' | 'source' | 'createdAt'>>,
  ) => Result<Template>;
  duplicateTemplate: (id: string) => Result<Template>;
  removeTemplate: (id: string) => Result<void>;
  toggleTemplate: (id: string) => Result<void>;

  // Selection & Pin
  setCurrentSelection: (selection: Selection) => void;
  togglePin: (type: 'image' | 'quote' | 'template') => void;
  resetPin: () => void;

  // Bulk / Admin
  setAllQuotesEnabled: (enabled: boolean) => void;
  setAllImagesEnabled: (enabled: boolean) => void;
  setAllTemplatesEnabled: (enabled: boolean) => Result<void>;
  resetToDefault: (quotes: Quote[], images: WallpaperImage[], templates: Template[]) => void;
}

export type LibraryStore = AppLibraryState & LibraryActions;

export const INITIAL_LIBRARY_STATE: AppLibraryState = {
  version: LIBRARY_STORE_VERSION,
  quotes: [],
  images: [],
  templates: [],
  current: null,
  pinned: { image: false, quote: false, template: false },
  history: [],
};

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_LIBRARY_STATE,

      // === QUOTE ACTIONS ===
      addQuote: (rawText, rawAuthor) => {
        const valRes = validateQuoteInput(rawText, rawAuthor);
        if (!valRes.ok) return valRes;

        const { quotes } = get();
        if (isQuoteDuplicate(valRes.data.text, quotes)) {
          return {
            ok: false,
            code: 'DUPLICATE_QUOTE',
            message: 'Danh ngôn này đã có trong bộ sưu tập.',
          };
        }

        const now = new Date().toISOString();
        const newQuote: Quote = {
          id: generateId('quote'),
          text: valRes.data.text,
          author: valRes.data.author,
          enabled: true,
          favorite: false,
          source: 'user',
          createdAt: now,
          updatedAt: now,
        };

        set({ quotes: [newQuote, ...quotes] });
        return { ok: true, data: newQuote };
      },

      updateQuote: (id, rawText, rawAuthor) => {
        const valRes = validateQuoteInput(rawText, rawAuthor);
        if (!valRes.ok) return valRes;

        const { quotes } = get();
        const target = quotes.find((q) => q.id === id);
        if (!target) {
          return { ok: false, code: 'QUOTE_NOT_FOUND', message: 'Không tìm thấy danh ngôn.' };
        }

        if (isQuoteDuplicate(valRes.data.text, quotes, id)) {
          return {
            ok: false,
            code: 'DUPLICATE_QUOTE',
            message: 'Danh ngôn này trùng lặp với một câu khác.',
          };
        }

        const now = new Date().toISOString();
        const updatedQuotes = quotes.map((q) =>
          q.id === id
            ? { ...q, text: valRes.data.text, author: valRes.data.author, updatedAt: now }
            : q,
        );

        set({ quotes: updatedQuotes });
        return { ok: true, data: { ...target, text: valRes.data.text, author: valRes.data.author, updatedAt: now } };
      },

      removeQuote: (id) => {
        const { quotes, current, pinned } = get();
        const target = quotes.find((q) => q.id === id);
        if (!target) {
          return { ok: false, code: 'QUOTE_NOT_FOUND', message: 'Không tìm thấy danh ngôn.' };
        }

        if (target.source === 'default') {
          return {
            ok: false,
            code: 'CANNOT_DELETE_DEFAULT',
            message: 'Danh ngôn mặc định không thể xóa, bạn có thể tắt công tắc.',
          };
        }

        const newPinned = { ...pinned };
        if (current?.quoteId === id && pinned.quote) {
          newPinned.quote = false;
        }

        set({
          quotes: quotes.filter((q) => q.id !== id),
          pinned: newPinned,
        });
        return { ok: true, data: undefined };
      },

      toggleQuote: (id) => {
        const { quotes, current, pinned } = get();
        const target = quotes.find((q) => q.id === id);
        if (!target) return;

        const nextEnabled = !target.enabled;
        const newPinned = { ...pinned };
        if (!nextEnabled && current?.quoteId === id && pinned.quote) {
          newPinned.quote = false;
        }

        set({
          quotes: quotes.map((q) => (q.id === id ? { ...q, enabled: nextEnabled } : q)),
          pinned: newPinned,
        });
      },

      toggleFavoriteQuote: (id) => {
        const { quotes } = get();
        set({
          quotes: quotes.map((q) => (q.id === id ? { ...q, favorite: !q.favorite } : q)),
        });
      },

      // === IMAGE ACTIONS ===
      addImage: (imgData) => {
        const { images } = get();
        const now = new Date().toISOString();
        const newImage: WallpaperImage = {
          ...imgData,
          id: generateId('img'),
          createdAt: now,
        };

        set({ images: [newImage, ...images] });
        return { ok: true, data: newImage };
      },

      removeImage: (id) => {
        const { images, current, pinned } = get();
        const target = images.find((img) => img.id === id);
        if (!target) {
          return { ok: false, code: 'IMAGE_NOT_FOUND', message: 'Không tìm thấy ảnh.' };
        }

        if (target.source === 'default') {
          return {
            ok: false,
            code: 'CANNOT_DELETE_DEFAULT',
            message: 'Ảnh mặc định không thể xóa, bạn có thể tắt công tắc.',
          };
        }

        const newPinned = { ...pinned };
        if (current?.imageId === id && pinned.image) {
          newPinned.image = false;
        }

        set({
          images: images.filter((img) => img.id !== id),
          pinned: newPinned,
        });
        return { ok: true, data: undefined };
      },

      toggleImage: (id) => {
        const { images, current, pinned } = get();
        const target = images.find((img) => img.id === id);
        if (!target) return;

        const nextEnabled = !target.enabled;
        const newPinned = { ...pinned };
        if (!nextEnabled && current?.imageId === id && pinned.image) {
          newPinned.image = false;
        }

        set({
          images: images.map((img) => (img.id === id ? { ...img, enabled: nextEnabled } : img)),
          pinned: newPinned,
        });
      },

      updateImageFocalPoint: (id, focalPoint) => {
        const { images } = get();
        const fx = Math.max(0, Math.min(1, focalPoint.x));
        const fy = Math.max(0, Math.min(1, focalPoint.y));

        set({
          images: images.map((img) =>
            img.id === id ? { ...img, focalPoint: { x: fx, y: fy } } : img,
          ),
        });
      },

      // === TEMPLATE ACTIONS ===
      addTemplate: (tplData) => {
        const { templates } = get();
        const now = new Date().toISOString();
        const newTpl: Template = {
          ...tplData,
          id: generateId('tpl'),
          createdAt: now,
          updatedAt: now,
        };

        set({ templates: [...templates, newTpl] });
        return { ok: true, data: newTpl };
      },

      updateTemplate: (id, updates) => {
        const { templates } = get();
        const target = templates.find((t) => t.id === id);
        if (!target) {
          return { ok: false, code: 'TEMPLATE_NOT_FOUND', message: 'Không tìm thấy mẫu.' };
        }

        if (target.source === 'builtin') {
          return {
            ok: false,
            code: 'BUILTIN_READONLY',
            message: 'Mẫu có sẵn chỉ đọc, hãy nhân bản để chỉnh sửa.',
          };
        }

        const now = new Date().toISOString();
        const updated = { ...target, ...updates, updatedAt: now };

        set({
          templates: templates.map((t) => (t.id === id ? updated : t)),
        });
        return { ok: true, data: updated };
      },

      duplicateTemplate: (id) => {
        const { templates } = get();
        const target = templates.find((t) => t.id === id);
        if (!target) {
          return { ok: false, code: 'TEMPLATE_NOT_FOUND', message: 'Không tìm thấy mẫu.' };
        }

        const now = new Date().toISOString();
        const cloned: Template = {
          ...target,
          id: generateId('tpl_user'),
          name: `${target.name} (bản sao)`,
          source: 'user',
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };

        set({ templates: [...templates, cloned] });
        return { ok: true, data: cloned };
      },

      removeTemplate: (id) => {
        const { templates, current, pinned } = get();
        const target = templates.find((t) => t.id === id);
        if (!target) {
          return { ok: false, code: 'TEMPLATE_NOT_FOUND', message: 'Không tìm thấy mẫu.' };
        }

        if (target.source === 'builtin') {
          return {
            ok: false,
            code: 'CANNOT_DELETE_BUILTIN',
            message: 'Mẫu có sẵn không thể xóa.',
          };
        }

        const settings = useSettingsStore.getState();
        const enabledTemplates = templates.filter((t) => t.enabled);

        // Quy tắc R12: Không được xóa template cuối cùng đang bật ở chế độ Ngẫu nhiên
        if (
          settings.templateMode === 'random' &&
          target.enabled &&
          enabledTemplates.length <= 1
        ) {
          return {
            ok: false,
            code: 'CANNOT_DELETE_LAST_ENABLED',
            message: 'Không thể xóa mẫu cuối cùng đang bật ở chế độ Ngẫu nhiên.',
          };
        }

        // Quy tắc R11: Xóa template đang là fixedTemplateId -> đổi về builtin đầu tiên
        if (settings.fixedTemplateId === id) {
          const firstBuiltin = templates.find((t) => t.source === 'builtin');
          if (firstBuiltin) {
            settings.setFixedTemplateId(firstBuiltin.id);
          }
        }

        const newPinned = { ...pinned };
        if (current?.templateId === id && pinned.template) {
          newPinned.template = false;
        }

        set({
          templates: templates.filter((t) => t.id !== id),
          pinned: newPinned,
        });
        return { ok: true, data: undefined };
      },

      toggleTemplate: (id) => {
        const { templates, current, pinned } = get();
        const target = templates.find((t) => t.id === id);
        if (!target) {
          return { ok: false, code: 'TEMPLATE_NOT_FOUND', message: 'Không tìm thấy mẫu.' };
        }

        const settings = useSettingsStore.getState();
        const enabledTemplates = templates.filter((t) => t.enabled);

        // Quy tắc R12: Giữ ít nhất 1 mẫu bật khi ở chế độ Ngẫu nhiên
        if (
          settings.templateMode === 'random' &&
          target.enabled &&
          enabledTemplates.length <= 1
        ) {
          return {
            ok: false,
            code: 'CANNOT_DISABLE_LAST_ENABLED',
            message: 'Cần giữ ít nhất 1 mẫu bật khi ở chế độ Ngẫu nhiên.',
          };
        }

        const nextEnabled = !target.enabled;
        const newPinned = { ...pinned };
        if (!nextEnabled && current?.templateId === id && pinned.template) {
          newPinned.template = false;
        }

        set({
          templates: templates.map((t) => (t.id === id ? { ...t, enabled: nextEnabled } : t)),
          pinned: newPinned,
        });
        return { ok: true, data: undefined };
      },

      // === SELECTION & PIN ===
      setCurrentSelection: (selection) => {
        const { history } = get();
        const filteredHistory = history.filter(
          (h) =>
            h.imageId !== selection.imageId ||
            h.quoteId !== selection.quoteId ||
            h.templateId !== selection.templateId,
        );

        set({
          current: selection,
          history: [selection, ...filteredHistory].slice(0, 50),
        });
      },

      togglePin: (type) => {
        const { pinned } = get();
        set({
          pinned: {
            ...pinned,
            [type]: !pinned[type],
          },
        });
      },

      resetPin: () => {
        set({
          pinned: { image: false, quote: false, template: false },
        });
      },

      setAllQuotesEnabled: (enabled) => {
        const { quotes } = get();
        set({ quotes: quotes.map((q) => ({ ...q, enabled })) });
      },

      setAllImagesEnabled: (enabled) => {
        const { images } = get();
        set({ images: images.map((img) => ({ ...img, enabled })) });
      },

      setAllTemplatesEnabled: (enabled) => {
        const { templates } = get();
        if (!enabled && useSettingsStore.getState().templateMode === 'random') {
          return {
            ok: false,
            code: 'CANNOT_DISABLE_ALL_TEMPLATES',
            message: 'Không thể tắt toàn bộ mẫu ở chế độ Ngẫu nhiên.',
          };
        }
        set({ templates: templates.map((t) => ({ ...t, enabled })) });
        return { ok: true, data: undefined };
      },

      resetToDefault: (defaultQuotes, defaultImages, defaultTemplates) => {
        const { quotes, images, templates } = get();

        // Giữ lại các mục do user tạo, khôi phục mục default
        const userQuotes = quotes.filter((q) => q.source === 'user');
        const userImages = images.filter((img) => img.source === 'user');
        const userTemplates = templates.filter((t) => t.source === 'user');

        set({
          quotes: [...defaultQuotes.map((q) => ({ ...q, enabled: true })), ...userQuotes],
          images: [...defaultImages.map((img) => ({ ...img, enabled: true })), ...userImages],
          templates: [
            ...defaultTemplates.map((t) => ({ ...t, enabled: true })),
            ...userTemplates,
          ],
        });
      },
    }),
    {
      name: 'qw_library_store',
      version: LIBRARY_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState, version) => migrateLibraryState(persistedState, version),
    },
  ),
);
