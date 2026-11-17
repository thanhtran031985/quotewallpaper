import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Quote, Result } from '../domain/types';

/**
 * Xuất danh sách danh ngôn ra file JSON và mở trình chia sẻ iOS / hệ thống
 */
export async function exportQuotesToJson(quotes: Quote[]): Promise<Result<string>> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        ok: false,
        code: 'SHARING_UNAVAILABLE',
        message: 'Tính năng chia sẻ không khả dụng trên thiết bị này.',
      };
    }

    const exportData = quotes.map((q) => ({
      text: q.text,
      author: q.author,
      source: q.source,
      favorite: q.favorite,
      enabled: q.enabled,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `quotes-export.json`;
    const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(targetUri, jsonString, {
      encoding: 'utf8',
    });

    await Sharing.shareAsync(targetUri, {
      mimeType: 'application/json',
      dialogTitle: 'Sao lưu danh ngôn',
      UTI: 'public.json',
    });

    return { ok: true, data: targetUri };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      code: 'EXPORT_FAILED',
      message: `Không thể xuất danh ngôn: ${msg}`,
    };
  }
}
