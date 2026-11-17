import { resolveBoxLayout, CLOCK_ZONE } from '@/engine/layout';
import { fitText } from '@/engine/fitText';
import { TemplateStyle } from '@/domain/types';

describe('layout engine (resolveBoxLayout)', () => {
  const containerWidth = 390;
  const containerHeight = 844;

  it('TC-LOG-02: template có yPct trong vùng đồng hồ -> tự động đẩy xuống dưới vùng đồng hồ (R13)', () => {
    // Vùng đồng hồ: 8% đến 32%
    const boxInClockZone: TemplateStyle['box'] = {
      xPct: 10,
      yPct: 18, // Trong vùng đồng hồ!
      widthPct: 80,
      anchor: 'top',
      background: 'none',
      backgroundColor: '#000000',
      backgroundOpacity: 0,
      radius: 0,
      padding: 0,
      borderLeft: false,
    };

    const result = resolveBoxLayout(boxInClockZone, containerWidth, containerHeight);
    expect(result.pushedOutOfClockZone).toBe(true);
    expect(result.yPct).toBeGreaterThanOrEqual(CLOCK_ZONE.bottomPct);
    expect(result.top).toBeGreaterThanOrEqual((CLOCK_ZONE.bottomPct / 100) * containerHeight);
  });

  it('vị trí an toàn ngoài vùng đồng hồ giữ nguyên tọa độ và không bị đẩy', () => {
    const safeBox: TemplateStyle['box'] = {
      xPct: 10,
      yPct: 55, // Ở giữa dưới màn hình, an toàn
      widthPct: 80,
      anchor: 'top',
      background: 'solid',
      backgroundColor: '#000000',
      backgroundOpacity: 0.5,
      radius: 12,
      padding: 16,
      borderLeft: false,
    };

    const result = resolveBoxLayout(safeBox, containerWidth, containerHeight);
    expect(result.pushedOutOfClockZone).toBe(false);
    expect(result.yPct).toBe(55);
    expect(result.top).toBeCloseTo((55 / 100) * containerHeight);
    expect(result.width).toBeCloseTo((80 / 100) * containerWidth);
    expect(result.left).toBeCloseTo((10 / 100) * containerWidth);
  });

  it('tính đúng tọa độ khi anchor là bottom', () => {
    const bottomBox: TemplateStyle['box'] = {
      xPct: 8,
      yPct: 85,
      widthPct: 84,
      anchor: 'bottom',
      background: 'none',
      backgroundColor: '#000000',
      backgroundOpacity: 0,
      radius: 0,
      padding: 0,
      borderLeft: false,
    };

    const result = resolveBoxLayout(bottomBox, containerWidth, containerHeight);
    expect(result.pushedOutOfClockZone).toBe(false);
    expect(result.bottom).toBeDefined();
    // yPct 85 với anchor bottom nghĩa là cách đỉnh 85% -> cách đáy 15%
    expect(result.bottom).toBeCloseTo(((100 - 85) / 100) * containerHeight);
  });
});

describe('fitText engine', () => {
  const containerWidth = 320;
  const containerHeight = 200;

  it('câu ngắn vừa vặn giữ nguyên baseFontSize', () => {
    const res = fitText('Học, học nữa, học mãi.', {
      containerWidth,
      containerHeight,
      fontFamily: 'Sans',
      baseFontSize: 24,
      minFontSize: 14,
      lineHeightMultiplier: 1.4,
    });

    expect(res.fontSize).toBe(24);
    expect(res.overflow).toBe(false);
    expect(res.lines.length).toBeGreaterThan(0);
  });

  it('TC-LOG-01: câu 220 ký tự giảm cỡ chữ, không tràn hoặc trả overflow=true nếu chạm min', () => {
    const longQuote =
      'Cuộc sống không phải là việc chờ đợi cơn bão đi qua, mà là việc học cách nhảy múa dưới những cơn mưa rào. Mỗi thử thách chúng ta vượt qua hôm nay sẽ trở thành sức mạnh và sự tự tin giúp chúng ta vững bước trên con đường ngày mai.';
    expect(longQuote.length).toBeGreaterThanOrEqual(200);

    const res = fitText(longQuote, {
      containerWidth: 260,
      containerHeight: 120, // Hộp nhỏ
      fontFamily: 'Serif',
      baseFontSize: 28,
      minFontSize: 16,
      lineHeightMultiplier: 1.35,
    });

    // Cỡ chữ phải tự giảm xuống nhỏ hơn base
    expect(res.fontSize).toBeLessThan(28);

    // Nếu vẫn không vừa ở cỡ minFontSize -> cờ overflow bật và có truncatedText kết thúc bằng '…'
    if (res.overflow) {
      expect(res.fontSize).toBe(16);
      expect(res.truncatedText.endsWith('…')).toBe(true);
    } else {
      expect(res.fontSize).toBeGreaterThanOrEqual(16);
    }
  });

  it('chữ dài vượt quá khả năng chứa ngay cả ở minFontSize thì kích hoạt overflow và cắt bằng dấu …', () => {
    const superLongText = 'A '.repeat(150); // Rất nhiều từ
    const res = fitText(superLongText, {
      containerWidth: 100,
      containerHeight: 50, // Hộp cực kỳ nhỏ
      fontFamily: 'Mono',
      baseFontSize: 22,
      minFontSize: 14,
      lineHeightMultiplier: 1.3,
    });

    expect(res.overflow).toBe(true);
    expect(res.fontSize).toBe(14);
    expect(res.truncatedText.endsWith('…')).toBe(true);
  });
});
