import { removeVietnameseDiacritics, matchesSearch } from '@/engine/vietnameseSearch';

describe('vietnameseSearch engine', () => {
  it('TC-LOG-01: Tìm không dấu ra kết quả có dấu', () => {
    const text = 'Bình yên bắt đầu từ một nụ cười.';

    expect(matchesSearch(text, 'binh yen')).toBe(true);
    expect(matchesSearch(text, 'BINH YEN')).toBe(true);
    expect(matchesSearch(text, 'nu cuoi')).toBe(true);
    expect(matchesSearch(text, 'bắt đầu')).toBe(true);
    expect(matchesSearch(text, 'bat dau')).toBe(true);
    expect(matchesSearch(text, 'hạnh phúc')).toBe(false);
  });

  it('loại bỏ chính xác các dấu tiếng Việt phức tạp (ệ, ữ, ỗ, đ, Đ)', () => {
    expect(removeVietnameseDiacritics('Đường đời gập ghềnh')).toBe('duong doi gap ghenh');
    expect(removeVietnameseDiacritics('Cỗ xe gỗ')).toBe('co xe go');
    expect(removeVietnameseDiacritics('Những điều kỳ diệu')).toBe('nhung dieu ky dieu');
  });
});
