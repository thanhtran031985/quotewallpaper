import { parseQuotesFile } from '../../src/services/quoteParser';
import { Quote } from '../../src/domain/types';

describe('quoteParser service (11-import-history Step 1)', () => {
  const existingQuotes: Quote[] = [
    {
      id: 'q1',
      text: 'Hành trình vạn dặm bắt đầu từ một bước chân.',
      author: 'Lão Tử',
      enabled: true,
      favorite: false,
      source: 'default',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  describe('JSON parsing', () => {
    it('parse mảng JSON hợp lệ chứa các câu danh ngôn', () => {
      const jsonContent = JSON.stringify([
        { text: 'Học, học nữa, học mãi.', author: 'Lê-nin' },
        { text: 'Tri thức là sức mạnh.', author: 'Francis Bacon' },
        { text: 'Không có tác giả cũng được.' },
      ]);

      const result = parseQuotesFile(jsonContent, existingQuotes);
      expect(result.validQuotes.length).toBe(3);
      expect(result.validQuotes[0]).toEqual({
        text: 'Học, học nữa, học mãi.',
        author: 'Lê-nin',
      });
      expect(result.validQuotes[2].author).toBeUndefined();
      expect(result.duplicatesCount).toBe(0);
      expect(result.invalidCount).toBe(0);
    });

    it('phát hiện câu trùng lặp với kho hiện có và trong cùng file', () => {
      const jsonContent = JSON.stringify([
        { text: 'Hành trình vạn dặm bắt đầu từ một bước chân.' }, // Trùng với existingQuotes
        { text: 'Cuộc sống là một bài học.' },
        { text: '   Cuộc sống là một bài học.   ' }, // Trùng với câu trên
      ]);

      const result = parseQuotesFile(jsonContent, existingQuotes);
      expect(result.validQuotes.length).toBe(1);
      expect(result.validQuotes[0].text).toBe('Cuộc sống là một bài học.');
      expect(result.duplicatesCount).toBe(2);
      expect(result.invalidCount).toBe(0);
    });

    it('loại bỏ câu không hợp lệ (rỗng hoặc quá 220 ký tự hoặc tác giả > 60 ký tự)', () => {
      const jsonContent = JSON.stringify([
        { text: '' }, // Rỗng
        { text: 'A'.repeat(225) }, // Quá 220 ký tự
        { text: 'Hợp lệ', author: 'Tác giả '.repeat(20) }, // Tác giả quá 60 ký tự
        { text: 'Câu hợp lệ duy nhất.' },
      ]);

      const result = parseQuotesFile(jsonContent, existingQuotes);
      expect(result.validQuotes.length).toBe(1);
      expect(result.validQuotes[0].text).toBe('Câu hợp lệ duy nhất.');
      expect(result.invalidCount).toBe(3);
    });
  });

  describe('CSV parsing', () => {
    it('parse file CSV chuẩn có header và dấu phẩy trong ngoặc kép, xử lý UTF-8 BOM', () => {
      const csvContent =
        '\uFEFFtext,author\n' +
        '"Bình yên bắt đầu từ một nụ cười, tình yêu.",Mẹ Teresa\n' +
        '"Hãy sống là chính mình.",Oscar Wilde\n' +
        'Một câu không ngoặc kép,Khuyết danh';

      const result = parseQuotesFile(csvContent, existingQuotes);
      expect(result.validQuotes.length).toBe(3);
      expect(result.validQuotes[0].text).toBe(
        'Bình yên bắt đầu từ một nụ cười, tình yêu.',
      );
      expect(result.validQuotes[0].author).toBe('Mẹ Teresa');
      expect(result.validQuotes[2].text).toBe('Một câu không ngoặc kép');
      expect(result.validQuotes[2].author).toBe('Khuyết danh');
      expect(result.invalidCount).toBe(0);
    });

    it('hiệu năng: parse 500 câu trong thời gian dưới 1 giây', () => {
      const lines = ['text,author'];
      for (let i = 0; i < 500; i++) {
        lines.push(`"Danh ngôn thứ ${i} tràn đầy cảm hứng.",Tác giả ${i}`);
      }
      const csvContent = lines.join('\n');

      const start = Date.now();
      const result = parseQuotesFile(csvContent, existingQuotes);
      const elapsed = Date.now() - start;

      expect(result.validQuotes.length).toBe(500);
      expect(elapsed).toBeLessThan(1000);
    });
  });
});
