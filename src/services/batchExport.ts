import { Quote, WallpaperImage, Template, Selection, Result } from '../domain/types';
import { pickSelection } from '../engine/randomPick';

export interface BatchExportOptions {
  count: number;
  quotes: Quote[];
  images: WallpaperImage[];
  templates: Template[];
  templateMode?: 'fixed' | 'random';
  fixedTemplateId?: string;
  noRepeat?: boolean;
  favoritesBoost?: boolean;
  onProgress?: (current: number, total: number, successCount: number, errorCount: number) => void;
  isCancelled?: () => boolean;
  renderItem: (selection: Selection) => Promise<Result<unknown>>;
}

export interface BatchExportResult {
  totalRequested: number;
  completed: number;
  successCount: number;
  errorCount: number;
  isCancelled: boolean;
}

/**
 * Thực hiện xuất hàng loạt N hình nền ngẫu nhiên (R16).
 * - Mỗi hình được random độc lập theo quy tắc R1–R3, R16.
 * - Lỗi ở từng hình không dừng cả lô (TC-LOG-01).
 * - Có thể hủy giữa chừng và báo cáo chính xác số hình đã xuất (TC-UI-01).
 */
export async function executeBatchExport(options: BatchExportOptions): Promise<BatchExportResult> {
  const {
    count,
    quotes,
    images,
    templates,
    templateMode = 'fixed',
    fixedTemplateId,
    noRepeat = true,
    favoritesBoost = false,
    onProgress,
    isCancelled,
    renderItem,
  } = options;

  let successCount = 0;
  let errorCount = 0;
  let lastSelection: Selection | undefined = undefined;

  for (let i = 0; i < count; i++) {
    // Kiểm tra hủy trước mỗi lần render
    if (isCancelled && isCancelled()) {
      return {
        totalRequested: count,
        completed: i,
        successCount,
        errorCount,
        isCancelled: true,
      };
    }

    // Chọn ngẫu nhiên độc lập 1 tổ hợp theo R1-R3, R16
    const pickRes = pickSelection(
      { quotes, images, templates },
      {
        templateMode,
        fixedTemplateId: fixedTemplateId || templates[0]?.id || 'tpl-center',
        shuffleOnOpen: true,
        noRepeat,
        showAuthor: true,
        favoritesBoost,
        appearance: 'system',
        exportAlbumName: 'Quote Wallpaper',
      },
      lastSelection,
    );

    if (!pickRes.ok) {
      errorCount++;
      onProgress?.(i + 1, count, successCount, errorCount);
      continue;
    }

    const currentSelection = pickRes.data;
    lastSelection = currentSelection;

    try {
      const renderRes = await renderItem(currentSelection);
      if (renderRes.ok) {
        successCount++;
      } else {
        errorCount++; // TC-LOG-01: không dừng cả lô khi gặp lỗi
      }
    } catch {
      errorCount++;
    }

    onProgress?.(i + 1, count, successCount, errorCount);

    // Kiểm tra hủy ngay sau khi render xong
    if (isCancelled && isCancelled()) {
      return {
        totalRequested: count,
        completed: i + 1,
        successCount,
        errorCount,
        isCancelled: true,
      };
    }
  }

  return {
    totalRequested: count,
    completed: count,
    successCount,
    errorCount,
    isCancelled: false,
  };
}
