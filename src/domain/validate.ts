import { Quote, WallpaperImage, Template, Settings, AppLibraryState, Result } from './types';

/**
 * Chuẩn hóa chuỗi văn bản: cắt khoảng trắng đầu/cuối và gộp khoảng trắng thừa ở giữa
 */
export function normalizeText(text: string): string {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Chuẩn hóa chuỗi để so sánh trùng lặp: chuyển chữ thường và gộp khoảng trắng
 */
export function normalizeForComparison(text: string): string {
  return normalizeText(text).toLowerCase();
}

/**
 * Kiểm tra tính hợp lệ của nội dung và tác giả danh ngôn theo R8
 * - text: 1–220 ký tự sau khi trim
 * - author: tùy chọn, ≤ 60 ký tự sau khi trim
 */
export function validateQuoteInput(
  rawText: string,
  rawAuthor?: string,
): Result<{ text: string; author?: string }> {
  const text = normalizeText(rawText);

  if (text.length === 0 || text.length > 220) {
    return {
      ok: false,
      code: 'INVALID_LENGTH',
      message: 'Nội dung danh ngôn phải từ 1 đến 220 ký tự.',
    };
  }

  let author: string | undefined;
  if (rawAuthor !== undefined && rawAuthor !== null) {
    const trimmedAuthor = normalizeText(rawAuthor);
    if (trimmedAuthor.length > 60) {
      return {
        ok: false,
        code: 'INVALID_AUTHOR',
        message: 'Tên tác giả không được vượt quá 60 ký tự.',
      };
    }
    author = trimmedAuthor.length > 0 ? trimmedAuthor : undefined;
  }

  return { ok: true, data: { text, author } };
}

/**
 * Kiểm tra câu danh ngôn có bị trùng lặp trong kho không (R8)
 * So sánh sau khi chuẩn hóa khoảng trắng và không phân biệt hoa thường
 */
export function isQuoteDuplicate(
  text: string,
  existingQuotes: Quote[],
  excludeId?: string,
): boolean {
  const target = normalizeForComparison(text);
  return existingQuotes.some(
    (q) => q.id !== excludeId && normalizeForComparison(q.text) === target,
  );
}

/**
 * Xác thực cấu trúc đối tượng Quote đọc từ storage/JSON
 */
export function validateQuote(data: unknown): Result<Quote> {
  if (!data || typeof data !== 'object') {
    return { ok: false, code: 'INVALID_QUOTE', message: 'Dữ liệu danh ngôn không hợp lệ.' };
  }

  const q = data as Record<string, unknown>;

  if (typeof q.id !== 'string' || q.id.trim() === '') {
    return { ok: false, code: 'INVALID_QUOTE_ID', message: 'ID danh ngôn không hợp lệ.' };
  }

  if (typeof q.text !== 'string' || q.text.trim().length === 0 || q.text.trim().length > 220) {
    return {
      ok: false,
      code: 'INVALID_QUOTE_TEXT',
      message: 'Nội dung danh ngôn phải từ 1 đến 220 ký tự.',
    };
  }

  if (q.author !== undefined && q.author !== null && typeof q.author !== 'string') {
    return { ok: false, code: 'INVALID_QUOTE_AUTHOR', message: 'Tác giả không hợp lệ.' };
  }

  if (typeof q.enabled !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_QUOTE_ENABLED',
      message: 'Trạng thái bật/tắt không hợp lệ.',
    };
  }

  if (typeof q.favorite !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_QUOTE_FAVORITE',
      message: 'Trạng thái yêu thích không hợp lệ.',
    };
  }

  if (q.source !== 'default' && q.source !== 'user') {
    return { ok: false, code: 'INVALID_QUOTE_SOURCE', message: 'Nguồn danh ngôn không hợp lệ.' };
  }

  return {
    ok: true,
    data: {
      id: q.id,
      text: q.text,
      author: typeof q.author === 'string' ? q.author : undefined,
      enabled: q.enabled,
      favorite: q.favorite,
      source: q.source,
      createdAt: typeof q.createdAt === 'string' ? q.createdAt : new Date().toISOString(),
      updatedAt: typeof q.updatedAt === 'string' ? q.updatedAt : new Date().toISOString(),
    },
  };
}

/**
 * Xác thực cấu trúc WallpaperImage đọc từ storage
 */
export function validateImage(data: unknown): Result<WallpaperImage> {
  if (!data || typeof data !== 'object') {
    return { ok: false, code: 'INVALID_IMAGE', message: 'Dữ liệu ảnh không hợp lệ.' };
  }

  const img = data as Record<string, unknown>;

  if (typeof img.id !== 'string' || !img.id) {
    return { ok: false, code: 'INVALID_IMAGE_ID', message: 'ID ảnh không hợp lệ.' };
  }
  if (typeof img.name !== 'string') {
    return { ok: false, code: 'INVALID_IMAGE_NAME', message: 'Tên ảnh không hợp lệ.' };
  }
  if (img.source !== 'default' && img.source !== 'user') {
    return { ok: false, code: 'INVALID_IMAGE_SOURCE', message: 'Nguồn ảnh không hợp lệ.' };
  }
  if (typeof img.uri !== 'string' || !img.uri) {
    return { ok: false, code: 'INVALID_IMAGE_URI', message: 'Đường dẫn ảnh không hợp lệ.' };
  }
  if (
    typeof img.width !== 'number' ||
    img.width <= 0 ||
    typeof img.height !== 'number' ||
    img.height <= 0
  ) {
    return { ok: false, code: 'INVALID_IMAGE_DIMENSIONS', message: 'Kích thước ảnh không hợp lệ.' };
  }
  if (typeof img.enabled !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_IMAGE_ENABLED',
      message: 'Trạng thái bật/tắt ảnh không hợp lệ.',
    };
  }

  const focal = img.focalPoint as Record<string, unknown> | undefined;
  const fx = typeof focal?.x === 'number' ? focal.x : 0.5;
  const fy = typeof focal?.y === 'number' ? focal.y : 0.5;

  return {
    ok: true,
    data: {
      id: img.id,
      name: img.name,
      source: img.source,
      uri: img.uri,
      width: img.width,
      height: img.height,
      focalPoint: { x: Math.max(0, Math.min(1, fx)), y: Math.max(0, Math.min(1, fy)) },
      enabled: img.enabled,
      createdAt: typeof img.createdAt === 'string' ? img.createdAt : new Date().toISOString(),
    },
  };
}

/**
 * Xác thực cấu trúc Template đọc từ storage
 */
export function validateTemplate(data: unknown): Result<Template> {
  if (!data || typeof data !== 'object') {
    return { ok: false, code: 'INVALID_TEMPLATE', message: 'Dữ liệu mẫu không hợp lệ.' };
  }

  const tpl = data as Record<string, unknown>;

  if (typeof tpl.id !== 'string' || !tpl.id) {
    return { ok: false, code: 'INVALID_TEMPLATE_ID', message: 'ID mẫu không hợp lệ.' };
  }
  if (typeof tpl.name !== 'string' || !tpl.name) {
    return { ok: false, code: 'INVALID_TEMPLATE_NAME', message: 'Tên mẫu không hợp lệ.' };
  }
  if (tpl.source !== 'builtin' && tpl.source !== 'user') {
    return { ok: false, code: 'INVALID_TEMPLATE_SOURCE', message: 'Nguồn mẫu không hợp lệ.' };
  }
  if (!tpl.style || typeof tpl.style !== 'object') {
    return { ok: false, code: 'INVALID_TEMPLATE_STYLE', message: 'Kiểu dáng mẫu không hợp lệ.' };
  }
  if (typeof tpl.enabled !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_TEMPLATE_ENABLED',
      message: 'Trạng thái bật/tắt mẫu không hợp lệ.',
    };
  }

  return {
    ok: true,
    data: tpl as unknown as Template,
  };
}

/**
 * Xác thực cấu trúc Settings
 */
export function validateSettings(data: unknown): Result<Settings> {
  if (!data || typeof data !== 'object') {
    return { ok: false, code: 'INVALID_SETTINGS', message: 'Dữ liệu cài đặt không hợp lệ.' };
  }

  const s = data as Record<string, unknown>;

  if (s.templateMode !== 'fixed' && s.templateMode !== 'random') {
    return { ok: false, code: 'INVALID_TEMPLATE_MODE', message: 'Chế độ mẫu không hợp lệ.' };
  }
  if (typeof s.fixedTemplateId !== 'string') {
    return { ok: false, code: 'INVALID_FIXED_TEMPLATE', message: 'Mẫu cố định không hợp lệ.' };
  }
  if (typeof s.shuffleOnOpen !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_SHUFFLE_ON_OPEN',
      message: 'Cài đặt đổi khi mở không hợp lệ.',
    };
  }
  if (typeof s.noRepeat !== 'boolean') {
    return { ok: false, code: 'INVALID_NO_REPEAT', message: 'Cài đặt không lặp lại không hợp lệ.' };
  }
  if (typeof s.showAuthor !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_SHOW_AUTHOR',
      message: 'Cài đặt hiển thị tác giả không hợp lệ.',
    };
  }
  if (typeof s.favoritesBoost !== 'boolean') {
    return {
      ok: false,
      code: 'INVALID_FAVORITES_BOOST',
      message: 'Cài đặt ưu tiên yêu thích không hợp lệ.',
    };
  }
  if (s.appearance !== 'system' && s.appearance !== 'light' && s.appearance !== 'dark') {
    return { ok: false, code: 'INVALID_APPEARANCE', message: 'Chế độ giao diện không hợp lệ.' };
  }
  if (typeof s.exportAlbumName !== 'string' || !s.exportAlbumName) {
    return { ok: false, code: 'INVALID_ALBUM_NAME', message: 'Tên album không hợp lệ.' };
  }

  return {
    ok: true,
    data: {
      templateMode: s.templateMode,
      fixedTemplateId: s.fixedTemplateId,
      shuffleOnOpen: s.shuffleOnOpen,
      noRepeat: s.noRepeat,
      showAuthor: s.showAuthor,
      favoritesBoost: s.favoritesBoost,
      appearance: s.appearance,
      exportAlbumName: s.exportAlbumName,
    },
  };
}

/**
 * Xác thực toàn bộ AppLibraryState
 */
export function validateAppLibraryState(data: unknown): Result<AppLibraryState> {
  if (!data || typeof data !== 'object') {
    return { ok: false, code: 'INVALID_STATE', message: 'Dữ liệu thư viện không hợp lệ.' };
  }

  const st = data as Record<string, unknown>;

  if (typeof st.version !== 'number' || st.version < 1) {
    return { ok: false, code: 'INVALID_VERSION', message: 'Phiên bản dữ liệu không hợp lệ.' };
  }
  if (!Array.isArray(st.quotes)) {
    return { ok: false, code: 'INVALID_QUOTES_LIST', message: 'Danh sách danh ngôn không hợp lệ.' };
  }
  if (!Array.isArray(st.images)) {
    return { ok: false, code: 'INVALID_IMAGES_LIST', message: 'Danh sách ảnh không hợp lệ.' };
  }
  if (!Array.isArray(st.templates)) {
    return { ok: false, code: 'INVALID_TEMPLATES_LIST', message: 'Danh sách mẫu không hợp lệ.' };
  }

  const validQuotes: Quote[] = [];
  for (const q of st.quotes) {
    const res = validateQuote(q);
    if (!res.ok) return res;
    validQuotes.push(res.data);
  }

  const validImages: WallpaperImage[] = [];
  for (const img of st.images) {
    const res = validateImage(img);
    if (!res.ok) return res;
    validImages.push(res.data);
  }

  const validTemplates: Template[] = [];
  for (const tpl of st.templates) {
    const res = validateTemplate(tpl);
    if (!res.ok) return res;
    validTemplates.push(res.data);
  }

  const pinned = st.pinned as Record<string, unknown> | undefined;

  return {
    ok: true,
    data: {
      version: st.version,
      quotes: validQuotes,
      images: validImages,
      templates: validTemplates,
      current: (st.current as AppLibraryState['current']) || null,
      pinned: {
        image: Boolean(pinned?.image),
        quote: Boolean(pinned?.quote),
        template: Boolean(pinned?.template),
      },
      history: Array.isArray(st.history) ? st.history : [],
    },
  };
}
