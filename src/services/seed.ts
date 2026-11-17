import defaultQuotesData from '../../data/quotes.default.json';
import { BUILTIN_TEMPLATES } from '../templates/builtin';
import { Quote, WallpaperImage, Template } from '../domain/types';
import { useLibraryStore } from '../store/useLibraryStore';

export const DEFAULT_TEMPLATES: Template[] = BUILTIN_TEMPLATES;

export const DEFAULT_IMAGES: WallpaperImage[] = [
  {
    id: 'default-1',
    name: 'Bình minh trên núi',
    source: 'default',
    uri: 'default-1',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-2',
    name: 'Mặt hồ tĩnh lặng',
    source: 'default',
    uri: 'default-2',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-3',
    name: 'Rừng thông sương mù',
    source: 'default',
    uri: 'default-3',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-4',
    name: 'Bờ biển chiều hoàng hôn',
    source: 'default',
    uri: 'default-4',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-5',
    name: 'Đường chân trời',
    source: 'default',
    uri: 'default-5',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-6',
    name: 'Góc phố tĩnh mịch',
    source: 'default',
    uri: 'default-6',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-7',
    name: 'Đồi cát vàng',
    source: 'default',
    uri: 'default-7',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-8',
    name: 'Đỉnh mây bồng bềnh',
    source: 'default',
    uri: 'default-8',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-9',
    name: 'Cánh đồng hoa dại',
    source: 'default',
    uri: 'default-9',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-10',
    name: 'Ánh sáng xuyên tán lá',
    source: 'default',
    uri: 'default-10',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-11',
    name: 'Sóng vỗ ghềnh đá',
    source: 'default',
    uri: 'default-11',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
  {
    id: 'default-12',
    name: 'Bầu trời đêm đầy sao',
    source: 'default',
    uri: 'default-12',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-11-16T00:00:00.000Z',
  },
];

export const DEFAULT_QUOTES: Quote[] = defaultQuotesData.map((item, index) => ({
  id: `quote-default-${index + 1}`,
  text: item.text,
  author: item.author,
  enabled: true,
  favorite: false,
  source: 'default' as const,
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
}));

/**
 * Nạp dữ liệu mặc định vào store nếu store đang trống (chạy lần mở đầu tiên)
 * Đảm bảo tính Idempotent: chạy nhiều lần không gây nhân đôi dữ liệu.
 */
export async function seedInitialData(): Promise<void> {
  const store = useLibraryStore.getState();

  const currentQuotes = store.quotes;
  const currentImages = store.images;
  const currentTemplates = store.templates;

  const hasQuotes = currentQuotes.length > 0;
  const hasImages = currentImages.length > 0;
  const hasTemplates = currentTemplates.length > 0;

  if (hasQuotes && hasImages && hasTemplates) {
    return;
  }

  useLibraryStore.setState({
    quotes: hasQuotes ? currentQuotes : DEFAULT_QUOTES,
    images: hasImages ? currentImages : DEFAULT_IMAGES,
    templates: hasTemplates ? currentTemplates : DEFAULT_TEMPLATES,
  });
}

/**
 * Khôi phục mặc định theo quy tắc R9:
 * - Bật lại toàn bộ các mục mặc định (`enabled = true`)
 * - Thêm lại các mục mặc định bị thiếu
 * - Giữ nguyên toàn bộ các mục người dùng đã thêm (`source: 'user'`)
 */
export async function restoreDefaultData(): Promise<void> {
  const store = useLibraryStore.getState();

  // 1. Phục hồi danh ngôn
  const userQuotes = store.quotes.filter((q) => q.source === 'user');
  const restoredDefaultQuotes = DEFAULT_QUOTES.map((defQuote) => {
    const existing = store.quotes.find((q) => q.id === defQuote.id);
    return {
      ...(existing || defQuote),
      enabled: true,
    };
  });

  // 2. Phục hồi ảnh
  const userImages = store.images.filter((img) => img.source === 'user');
  const restoredDefaultImages = DEFAULT_IMAGES.map((defImg) => {
    const existing = store.images.find((img) => img.id === defImg.id);
    return {
      ...(existing || defImg),
      enabled: true,
    };
  });

  // 3. Phục hồi mẫu
  const userTemplates = store.templates.filter((t) => t.source === 'user');
  const restoredDefaultTemplates = DEFAULT_TEMPLATES.map((defTpl) => {
    const existing = store.templates.find((t) => t.id === defTpl.id);
    return {
      ...(existing || defTpl),
      enabled: true,
    };
  });

  useLibraryStore.setState({
    quotes: [...restoredDefaultQuotes, ...userQuotes],
    images: [...restoredDefaultImages, ...userImages],
    templates: [...restoredDefaultTemplates, ...userTemplates],
  });
}
