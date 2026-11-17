import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateAppLibraryState } from '../domain/validate';
import { useLibraryStore } from '../store/useLibraryStore';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from './seed';

export interface CorruptionRecoveryResult {
  recovered: boolean;
  backupKey?: string;
  error?: string;
}

export const LIBRARY_STORAGE_KEY = 'qw_library_store';

/**
 * Kiểm tra dữ liệu trong AsyncStorage, nếu phát hiện JSON hỏng hoặc sai cấu trúc:
 * - Sao lưu bản hỏng sang key `backup_corrupt_<timestamp>`
 * - Reset store về dữ liệu mặc định an toàn
 * - Trả về kết quả phục hồi để UI có thể hiển thị thông báo
 */
export async function checkAndRecoverCorruptedStorage(): Promise<CorruptionRecoveryResult> {
  try {
    const rawData = await AsyncStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!rawData) {
      return { recovered: false };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      return await handleCorruption(rawData, 'JSON_SYNTAX_ERROR');
    }

    // Kiểm tra cấu trúc persisted state của zustand: { state: AppLibraryState, version: number }
    const actualState = parsed?.state ?? parsed;
    const valRes = validateAppLibraryState(actualState);

    if (!valRes.ok) {
      return await handleCorruption(rawData, valRes.code);
    }

    return { recovered: false };
  } catch (error) {
    return { recovered: false, error: String(error) };
  }
}

async function handleCorruption(
  rawCorruptedData: string,
  reason: string,
): Promise<CorruptionRecoveryResult> {
  const timestamp = Date.now();
  const backupKey = `backup_corrupt_${timestamp}`;

  try {
    // 1. Sao lưu bản dữ liệu hỏng
    await AsyncStorage.setItem(backupKey, rawCorruptedData);

    // 2. Khôi phục store về mặc định an toàn
    useLibraryStore.setState({
      version: 1,
      quotes: DEFAULT_QUOTES,
      images: DEFAULT_IMAGES,
      templates: DEFAULT_TEMPLATES,
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });

    console.warn(
      `[StorageCorruption] Đã phát hiện và phục hồi dữ liệu hỏng (${reason}). Backup key: ${backupKey}`,
    );
    return { recovered: true, backupKey };
  } catch (err) {
    console.error('[StorageCorruption] Lỗi khi tạo backup bản dữ liệu hỏng:', err);
    return { recovered: true, backupKey, error: String(err) };
  }
}
