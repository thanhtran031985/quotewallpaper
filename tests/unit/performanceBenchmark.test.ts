import { pickSelection } from '../../src/engine/randomPick';
import { matchesSearch } from '../../src/engine/vietnameseSearch';
import { parseQuotesFile } from '../../src/services/quoteParser';
import { BUILTIN_TEMPLATES } from '../../src/templates/builtin';
import { Quote, WallpaperImage, Template, Settings } from '../../src/domain/types';

describe('Performance Benchmarks (13-polish-performance Step 1)', () => {
  // Tạo 1.000 danh ngôn mock
  const largeQuotesList: Quote[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `quote_${i}`,
    text: `Danh ngôn truyền cảm hứng số ${i} về ý chí vươn lên và thành công trong cuộc sống.`,
    author: i % 2 === 0 ? `Tác giả ${i}` : undefined,
    enabled: true,
    favorite: i % 10 === 0, // 10% favorite
    source: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Tạo 200 ảnh mock
  const largeImagesList: WallpaperImage[] = Array.from({ length: 200 }, (_, i) => ({
    id: `img_${i}`,
    name: `Hình ảnh thiên nhiên số ${i}`,
    uri: `file:///images/nature_${i}.jpg`,
    width: 1080,
    height: 1920,
    source: 'user',
    enabled: true,
    focalPoint: { x: 0.5, y: 0.5 },
    fileMissing: false,
    createdAt: new Date().toISOString(),
  }));

  // 20 template
  const templatesList: Template[] = Array.from({ length: 20 }, (_, i) => ({
    ...BUILTIN_TEMPLATES[i % BUILTIN_TEMPLATES.length],
    id: `tpl_${i}`,
    name: `Mẫu thiết kế ${i}`,
  }));

  const settings: Settings = {
    templateMode: 'random',
    fixedTemplateId: 'tpl_0',
    shuffleOnOpen: true,
    noRepeat: true,
    showAuthor: true,
    favoritesBoost: true,
    appearance: 'system',
    exportAlbumName: 'Quote Wallpaper',
  };

  it('pickSelection 1.000 lần liên tiếp trên 1.000 câu + 200 ảnh: trung bình dưới 1ms/lần (PRD H: phản hồi < 150ms)', () => {
    let lastSelection = undefined;
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      const result = pickSelection(
        {
          quotes: largeQuotesList,
          images: largeImagesList,
          templates: templatesList,
        },
        settings,
        lastSelection,
      );
      if (result.ok) {
        lastSelection = result.data;
      }
    }

    const elapsed = performance.now() - start;
    const avgPerPick = elapsed / 1000;

    expect(lastSelection).toBeDefined();
    // Tiêu chuẩn PRD H: phản hồi đổi ngẫu nhiên ≤ 150ms, thực tế đạt < 1ms
    expect(avgPerPick).toBeLessThan(1.0);
    expect(elapsed).toBeLessThan(500);
  });

  it('tìm kiếm tiếng Việt không dấu trên 1.000 câu mất dưới 10ms', () => {
    const start = performance.now();
    const results = largeQuotesList.filter((q) =>
      matchesSearch(q.text, 'truyen cam hung'),
    );
    const elapsed = performance.now() - start;

    expect(results.length).toBe(1000);
    expect(elapsed).toBeLessThan(10);
  });

  it('parse file JSON gồm 1.000 câu danh ngôn mất dưới 100ms', () => {
    const jsonContent = JSON.stringify(
      Array.from({ length: 1000 }, (_, i) => ({
        text: `Câu danh ngôn số ${i} mang đầy niềm tin và hy vọng.`,
        author: `Tác giả ${i}`,
      })),
    );

    const start = performance.now();
    const result = parseQuotesFile(jsonContent, []);
    const elapsed = performance.now() - start;

    expect(result.validQuotes.length).toBe(1000);
    expect(result.duplicatesCount).toBe(0);
    expect(result.invalidCount).toBe(0);
    expect(elapsed).toBeLessThan(100);
  });
});
