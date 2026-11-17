import { Quote } from '../domain/types';
import {
  validateQuoteInput,
  isQuoteDuplicate,
  normalizeForComparison,
} from '../domain/validate';

export interface ParsedQuoteItem {
  text: string;
  author?: string;
}

export interface ParsedQuotesResult {
  validQuotes: ParsedQuoteItem[];
  duplicatesCount: number;
  invalidCount: number;
  errors: string[];
}

/**
 * Phân tích file CSV cơ bản hỗ trợ dấu ngoặc kép và dấu phẩy trong trường dữ liệu
 */
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Loại bỏ UTF-8 BOM nếu có
  const cleanContent = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    const nextChar = cleanContent[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Bỏ qua dấu kép escaped
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Phân tích nội dung chuỗi (JSON hoặc CSV) thành danh sách danh ngôn hợp lệ,
 * đồng thời kiểm tra tính hợp lệ và phát hiện trùng lặp.
 */
export function parseQuotesFile(
  content: string,
  existingQuotes: Quote[] = [],
): ParsedQuotesResult {
  const result: ParsedQuotesResult = {
    validQuotes: [],
    duplicatesCount: 0,
    invalidCount: 0,
    errors: [],
  };

  const trimmed = content.trim();
  if (!trimmed) {
    return result;
  }

  const rawItems: { text?: unknown; author?: unknown }[] = [];

  // 1. Thử nhận diện JSON trước
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === 'object') {
            rawItems.push(item as { text?: unknown; author?: unknown });
          } else {
            result.invalidCount++;
          }
        }
      } else if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (Array.isArray(obj.quotes)) {
          for (const item of obj.quotes) {
            if (item && typeof item === 'object') {
              rawItems.push(item as { text?: unknown; author?: unknown });
            } else {
              result.invalidCount++;
            }
          }
        } else {
          result.errors.push('Định dạng JSON không chứa danh sách danh ngôn hợp lệ.');
        }
      }
    } catch {
      // Nếu không parse được JSON, tiếp tục thử CSV
    }
  }

  // 2. Nếu không tìm thấy item nào từ JSON, parse theo CSV
  if (rawItems.length === 0) {
    const rows = parseCSV(trimmed);
    if (rows.length > 0) {
      let textCol = 0;
      let authorCol = 1;
      let startIndex = 0;

      // Kiểm tra xem dòng đầu có phải header không
      const firstRow = rows[0].map((c) => c.trim().toLowerCase());
      const hasHeader = firstRow.some(
        (c) =>
          c.includes('text') ||
          c.includes('quote') ||
          c.includes('câu') ||
          c.includes('nội dung') ||
          c.includes('author') ||
          c.includes('tác giả'),
      );

      if (hasHeader) {
        startIndex = 1;
        const foundTextCol = firstRow.findIndex(
          (c) => c.includes('text') || c.includes('quote') || c.includes('nội dung'),
        );
        const foundAuthorCol = firstRow.findIndex(
          (c) => c.includes('author') || c.includes('tác giả'),
        );
        if (foundTextCol !== -1) textCol = foundTextCol;
        if (foundAuthorCol !== -1) authorCol = foundAuthorCol;
      }

      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 1 && !row[0].trim()) continue; // Dòng trống

        const textVal = row[textCol];
        const authorVal = authorCol < row.length ? row[authorCol] : undefined;
        rawItems.push({ text: textVal, author: authorVal });
      }
    }
  }

  // 3. Xác thực & phát hiện trùng lặp
  const seenInFile = new Set<string>();

  for (const item of rawItems) {
    const rawText = typeof item.text === 'string' ? item.text : '';
    const rawAuthor = typeof item.author === 'string' ? item.author : undefined;

    const validation = validateQuoteInput(rawText, rawAuthor);
    if (!validation.ok) {
      result.invalidCount++;
      continue;
    }

    const { text, author } = validation.data;
    const normalizedKey = normalizeForComparison(text);

    // Kiểm tra trùng trong kho hiện có
    if (isQuoteDuplicate(text, existingQuotes)) {
      result.duplicatesCount++;
      continue;
    }

    // Kiểm tra trùng trong cùng file
    if (seenInFile.has(normalizedKey)) {
      result.duplicatesCount++;
      continue;
    }

    seenInFile.add(normalizedKey);
    result.validQuotes.push({ text, author });
  }

  return result;
}
