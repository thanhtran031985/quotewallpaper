import { executeBatchExport } from '../../src/services/batchExport';
import { Quote, WallpaperImage, Template } from '../../src/domain/types';

describe('batchExport service (10-batch-export-shortcuts Step 1)', () => {
  const mockQuotes: Quote[] = [
    {
      id: 'q1',
      text: 'Câu 1',
      enabled: true,
      favorite: false,
      source: 'default',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'q2',
      text: 'Câu 2',
      enabled: true,
      favorite: false,
      source: 'default',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockImages: WallpaperImage[] = [
    {
      id: 'img1',
      name: 'Ảnh 1',
      source: 'default',
      uri: 'uri1',
      width: 100,
      height: 100,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
      createdAt: '2026-01-01',
    },
    {
      id: 'img2',
      name: 'Ảnh 2',
      source: 'default',
      uri: 'uri2',
      width: 100,
      height: 100,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
      createdAt: '2026-01-01',
    },
  ];

  const mockTemplates: Template[] = [
    {
      id: 'tpl1',
      name: 'Mẫu 1',
      source: 'builtin',
      style: {} as any,
      enabled: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  it('xuất N hình thành công và gọi onProgress ở mỗi bước', async () => {
    const progressCalls: any[] = [];
    const renderItemMock = jest.fn().mockResolvedValue({ ok: true, data: 'ph://mock' });

    const result = await executeBatchExport({
      count: 5,
      quotes: mockQuotes,
      images: mockImages,
      templates: mockTemplates,
      templateMode: 'fixed',
      fixedTemplateId: 'tpl1',
      onProgress: (current, total, success, error) => {
        progressCalls.push({ current, total, success, error });
      },
      renderItem: renderItemMock,
    });

    expect(result.totalRequested).toBe(5);
    expect(result.successCount).toBe(5);
    expect(result.errorCount).toBe(0);
    expect(result.isCancelled).toBe(false);
    expect(renderItemMock).toHaveBeenCalledTimes(5);
    expect(progressCalls.length).toBe(5);
    expect(progressCalls[4]).toEqual({
      current: 5,
      total: 5,
      success: 5,
      error: 0,
    });
  });

  it('TC-LOG-01: lỗi ở một hình không làm dừng toàn bộ lô, tiếp tục xuất các hình còn lại', async () => {
    let callIndex = 0;
    // Giả lập hình thứ 5 bị lỗi (callIndex === 4)
    const renderItemMock = jest.fn().mockImplementation(async () => {
      callIndex++;
      if (callIndex === 5) {
        return { ok: false, code: 'CAPTURE_FAILED', message: 'Lỗi bộ nhớ' };
      }
      return { ok: true, data: 'ph://mock' };
    });

    const result = await executeBatchExport({
      count: 20,
      quotes: mockQuotes,
      images: mockImages,
      templates: mockTemplates,
      templateMode: 'fixed',
      fixedTemplateId: 'tpl1',
      renderItem: renderItemMock,
    });

    expect(result.totalRequested).toBe(20);
    expect(result.completed).toBe(20);
    expect(result.successCount).toBe(19);
    expect(result.errorCount).toBe(1);
    expect(renderItemMock).toHaveBeenCalledTimes(20);
  });

  it('TC-UI-01: khi cờ hủy kích hoạt, dừng xuất tại thời điểm đó và báo cáo số lượng đã xuất', async () => {
    let callCount = 0;
    let isCancelled = false;

    const renderItemMock = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 3) {
        isCancelled = true;
      }
      return { ok: true, data: 'ph://mock' };
    });

    const result = await executeBatchExport({
      count: 10,
      quotes: mockQuotes,
      images: mockImages,
      templates: mockTemplates,
      templateMode: 'fixed',
      fixedTemplateId: 'tpl1',
      isCancelled: () => isCancelled,
      renderItem: renderItemMock,
    });

    // Dừng sau khi đạt 3 hình
    expect(result.isCancelled).toBe(true);
    expect(result.completed).toBe(3);
    expect(result.successCount).toBe(3);
    expect(renderItemMock).toHaveBeenCalledTimes(3);
  });
});
