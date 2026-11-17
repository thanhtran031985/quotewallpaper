import { Quote, WallpaperImage, Template, Settings, Selection, Result, Id } from '../domain/types';

export interface LibraryItems {
  quotes: Quote[];
  images: WallpaperImage[];
  templates: Template[];
}

export interface PinnedState {
  image?: boolean;
  quote?: boolean;
  template?: boolean;
}

/**
 * Tính số tổ hợp hình nền có thể tạo từ các kho đang bật.
 */
export function calculateCombinationsCount(lib: LibraryItems, settings: Settings): number {
  const enabledImages = lib.images.filter((img) => img.enabled && !img.fileMissing).length;
  const enabledQuotes = lib.quotes.filter((q) => q.enabled).length;
  if (enabledImages === 0 || enabledQuotes === 0) return 0;

  if (settings.templateMode === 'fixed') {
    // Chế độ cố định: template đếm là 1 nếu có ít nhất 1 template hoạt động (fixed hoặc fallback)
    const hasActiveTemplate = lib.templates.some((t) => t.enabled);
    return hasActiveTemplate ? enabledImages * enabledQuotes : 0;
  }

  const enabledTemplates = lib.templates.filter((t) => t.enabled).length;
  return enabledImages * enabledQuotes * enabledTemplates;
}

/**
 * Chọn ngẫu nhiên có trọng số (weighted pick).
 */
function weightedPick<T>(items: { item: T; weight: number }[], rng: () => number): T {
  const totalWeight = items.reduce((sum, current) => sum + current.weight, 0);
  if (totalWeight <= 0) return items[0].item;

  const threshold = rng() * totalWeight;
  let running = 0;
  for (const entry of items) {
    running += entry.weight;
    if (threshold < running) {
      return entry.item;
    }
  }
  return items[items.length - 1].item;
}

/**
 * Chọn ngẫu nhiên đồng đều từ danh sách.
 */
function uniformPick<T>(items: T[], rng: () => number): T {
  const index = Math.floor(rng() * items.length);
  return items[Math.min(index, items.length - 1)];
}

/**
 * Hàm thuần chọn hình nền ngẫu nhiên theo R1–R7.
 */
export function pickSelection(
  lib: LibraryItems,
  settings: Settings,
  prev?: Selection | null,
  pinned?: PinnedState,
  rng: () => number = Math.random
): Result<Selection> {
  const enabledImages = lib.images.filter((img) => img.enabled && !img.fileMissing);
  const enabledQuotes = lib.quotes.filter((q) => q.enabled);
  const enabledTemplates = lib.templates.filter((t) => t.enabled);

  // R5: Kiểm tra kho trống
  const emptyCodes: string[] = [];
  const emptyMessages: string[] = [];
  if (enabledImages.length === 0) {
    emptyCodes.push('EMPTY_IMAGES');
    emptyMessages.push('kho ảnh');
  }
  if (enabledQuotes.length === 0) {
    emptyCodes.push('EMPTY_QUOTES');
    emptyMessages.push('kho danh ngôn');
  }
  if (enabledTemplates.length === 0) {
    emptyCodes.push('EMPTY_TEMPLATES');
    emptyMessages.push('kho mẫu template');
  }

  if (emptyCodes.length > 0) {
    return {
      ok: false,
      code: emptyCodes.join('|'),
      message: `Chưa có mục nào đang bật trong ${emptyMessages.join(', ')}. Hãy bật ít nhất 1 mục để tiếp tục.`,
    };
  }

  // 1. Chọn Ảnh (R1, R3, R4)
  let chosenImageId: Id;
  if (pinned?.image && prev?.imageId && enabledImages.some((img) => img.id === prev.imageId)) {
    chosenImageId = prev.imageId;
  } else {
    let candidates = enabledImages;
    if (settings.noRepeat && enabledImages.length >= 2 && prev?.imageId) {
      const filtered = enabledImages.filter((img) => img.id !== prev.imageId);
      if (filtered.length > 0) candidates = filtered;
    }
    chosenImageId = uniformPick(candidates, rng).id;
  }

  // 2. Chọn Danh ngôn (R1, R3, R4, R7)
  let chosenQuoteId: Id;
  if (pinned?.quote && prev?.quoteId && enabledQuotes.some((q) => q.id === prev.quoteId)) {
    chosenQuoteId = prev.quoteId;
  } else {
    let candidates = enabledQuotes;
    if (settings.noRepeat && enabledQuotes.length >= 2 && prev?.quoteId) {
      const filtered = enabledQuotes.filter((q) => q.id !== prev.quoteId);
      if (filtered.length > 0) candidates = filtered;
    }

    if (settings.favoritesBoost) {
      const weightedQuotes = candidates.map((q) => ({
        item: q,
        weight: q.favorite ? 2 : 1,
      }));
      chosenQuoteId = weightedPick(weightedQuotes, rng).id;
    } else {
      chosenQuoteId = uniformPick(candidates, rng).id;
    }
  }

  // 3. Chọn Template (R1, R2, R3, R4)
  let chosenTemplateId: Id;
  if (pinned?.template && prev?.templateId && enabledTemplates.some((t) => t.id === prev.templateId)) {
    chosenTemplateId = prev.templateId;
  } else if (settings.templateMode === 'fixed') {
    // Chế độ Cố định
    const fixed = enabledTemplates.find((t) => t.id === settings.fixedTemplateId);
    if (fixed) {
      chosenTemplateId = fixed.id;
    } else {
      // Fallback về builtin template đầu tiên còn enabled hoặc template enabled đầu tiên
      const fallback = enabledTemplates.find((t) => t.source === 'builtin') || enabledTemplates[0];
      chosenTemplateId = fallback.id;
    }
  } else {
    // Chế độ Ngẫu nhiên
    let candidates = enabledTemplates;
    if (settings.noRepeat && enabledTemplates.length >= 2 && prev?.templateId) {
      const filtered = enabledTemplates.filter((t) => t.id !== prev.templateId);
      if (filtered.length > 0) candidates = filtered;
    }
    chosenTemplateId = uniformPick(candidates, rng).id;
  }

  return {
    ok: true,
    data: {
      imageId: chosenImageId,
      quoteId: chosenQuoteId,
      templateId: chosenTemplateId,
      pickedAt: new Date().toISOString(),
    },
  };
}
