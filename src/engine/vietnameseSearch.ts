/**
 * Chuẩn hóa chuỗi tiếng Việt loại bỏ dấu và chuyển về chữ thường.
 */
export function removeVietnameseDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

/**
 * Kiểm tra xem chuỗi văn bản có chứa từ khóa tìm kiếm hay không (không phân biệt dấu và hoa thường).
 */
export function matchesSearch(text: string, query: string): boolean {
  if (!query || query.trim() === '') return true;

  const normalizedText = removeVietnameseDiacritics(text);
  const normalizedQuery = removeVietnameseDiacritics(query);

  return normalizedText.includes(normalizedQuery);
}
